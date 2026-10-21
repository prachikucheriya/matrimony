import { NextRequest, NextResponse } from "next/server";
import { InterestStatus } from "@prisma/client";
import { ensureConversation } from "@/lib/chat";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function ageFromDob(dob: Date | null | undefined) {
  if (!dob) return null;
  return Math.floor(
    (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

function mapInterest(
  interest: {
    id: string;
    status: InterestStatus;
    createdAt: Date;
    fromUserId: string;
    toUserId: string;
    fromUser: {
      id: string;
      profile: {
        displayName: string | null;
        city: string | null;
        dob: Date | null;
        height: string | null;
        occupation: string | null;
        photoUrl: string | null;
      } | null;
    };
    toUser: {
      id: string;
      profile: {
        displayName: string | null;
        city: string | null;
        dob: Date | null;
        height: string | null;
        occupation: string | null;
        photoUrl: string | null;
      } | null;
    };
  },
  viewerId: string,
) {
  const other =
    interest.fromUserId === viewerId ? interest.toUser : interest.fromUser;
  const profile = other.profile;

  return {
    id: interest.id,
    status: interest.status,
    direction: interest.fromUserId === viewerId ? "sent" : "received",
    createdAt: interest.createdAt,
    otherUserId: other.id,
    name: profile?.displayName ?? "Member",
    city: profile?.city ?? null,
    age: ageFromDob(profile?.dob),
    height: profile?.height ?? null,
    job: profile?.occupation ?? null,
    photoUrl: profile?.photoUrl ?? null,
  };
}

const profileSelect = {
  displayName: true,
  city: true,
  dob: true,
  height: true,
  occupation: true,
  photoUrl: true,
} as const;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tab = (request.nextUrl.searchParams.get("tab") || "all").toLowerCase();

  const where =
    tab === "pending"
      ? { toUserId: session.userId, status: InterestStatus.PENDING }
      : tab === "accepted"
        ? {
            status: InterestStatus.ACCEPTED,
            OR: [
              { toUserId: session.userId },
              { fromUserId: session.userId },
            ],
          }
        : tab === "sent"
          ? { fromUserId: session.userId }
          : {
              OR: [
                { toUserId: session.userId },
                { fromUserId: session.userId },
              ],
            };

  const interests = await prisma.interest.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      fromUser: { include: { profile: { select: profileSelect } } },
      toUser: { include: { profile: { select: profileSelect } } },
    },
  });

  return NextResponse.json({
    interests: interests.map((item) => mapInterest(item, session.userId)),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const toUserId =
      typeof body.toUserId === "string" ? body.toUserId.trim() : "";
    const toProfileId =
      typeof body.toProfileId === "string" ? body.toProfileId.trim() : "";

    let targetUserId = toUserId;
    if (!targetUserId && toProfileId) {
      const profile = await prisma.profile.findUnique({
        where: { id: toProfileId },
        select: { userId: true },
      });
      targetUserId = profile?.userId ?? "";
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Select a profile to send interest." },
        { status: 400 },
      );
    }

    if (targetUserId === session.userId) {
      return NextResponse.json(
        { error: "You cannot send interest to yourself." },
        { status: 400 },
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, profile: { select: { status: true } } },
    });

    if (!target?.profile || target.profile.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Profile is not available." },
        { status: 404 },
      );
    }

    const existing = await prisma.interest.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: session.userId,
          toUserId: targetUserId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.status === "DENIED"
              ? "This interest was already declined."
              : "Interest already sent.",
          interest: existing,
        },
        { status: 409 },
      );
    }

    const reverse = await prisma.interest.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: targetUserId,
          toUserId: session.userId,
        },
      },
    });

    if (reverse?.status === "PENDING") {
      const accepted = await prisma.interest.update({
        where: { id: reverse.id },
        data: { status: InterestStatus.ACCEPTED },
        include: {
          fromUser: { include: { profile: { select: profileSelect } } },
          toUser: { include: { profile: { select: profileSelect } } },
        },
      });
      const conversation = await ensureConversation(
        accepted.fromUserId,
        accepted.toUserId,
      );
      return NextResponse.json({
        ok: true,
        conversationId: conversation.id,
        interest: mapInterest(accepted, session.userId),
        message: "Mutual interest accepted.",
      });
    }

    if (reverse?.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "You already have an accepted interest with this member." },
        { status: 409 },
      );
    }

    const interest = await prisma.interest.create({
      data: {
        fromUserId: session.userId,
        toUserId: targetUserId,
        status: InterestStatus.PENDING,
      },
      include: {
        fromUser: { include: { profile: { select: profileSelect } } },
        toUser: { include: { profile: { select: profileSelect } } },
      },
    });

    return NextResponse.json({
      ok: true,
      interest: mapInterest(interest, session.userId),
    });
  } catch (error) {
    console.error("send interest error", error);
    return NextResponse.json(
      { error: "Unable to send interest." },
      { status: 500 },
    );
  }
}
