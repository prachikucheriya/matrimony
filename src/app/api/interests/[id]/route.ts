import { NextResponse } from "next/server";
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const status = body.status as InterestStatus | undefined;

    if (status !== "ACCEPTED" && status !== "DENIED") {
      return NextResponse.json(
        { error: "Status must be ACCEPTED or DENIED." },
        { status: 400 },
      );
    }

    const interest = await prisma.interest.findUnique({
      where: { id },
    });

    if (!interest) {
      return NextResponse.json({ error: "Interest not found." }, { status: 404 });
    }

    if (interest.toUserId !== session.userId) {
      return NextResponse.json(
        { error: "Only the receiver can respond to this interest." },
        { status: 403 },
      );
    }

    if (interest.status !== "PENDING") {
      return NextResponse.json(
        { error: "This interest was already responded to." },
        { status: 409 },
      );
    }

    const updated = await prisma.interest.update({
      where: { id },
      data: { status },
      include: {
        fromUser: {
          include: {
            profile: {
              select: {
                displayName: true,
                city: true,
                dob: true,
                height: true,
                occupation: true,
                photoUrl: true,
              },
            },
          },
        },
        toUser: {
          include: {
            profile: {
              select: {
                displayName: true,
                city: true,
                dob: true,
                height: true,
                occupation: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    let conversationId: string | null = null;
    if (status === "ACCEPTED") {
      const conversation = await ensureConversation(
        updated.fromUserId,
        updated.toUserId,
      );
      conversationId = conversation.id;
    }

    const other =
      updated.fromUserId === session.userId ? updated.toUser : updated.fromUser;
    const profile = other.profile;

    return NextResponse.json({
      ok: true,
      conversationId,
      interest: {
        id: updated.id,
        status: updated.status,
        direction: "received",
        createdAt: updated.createdAt,
        otherUserId: other.id,
        name: profile?.displayName ?? "Member",
        city: profile?.city ?? null,
        age: ageFromDob(profile?.dob),
        height: profile?.height ?? null,
        job: profile?.occupation ?? null,
        photoUrl: profile?.photoUrl ?? null,
      },
    });
  } catch (error) {
    console.error("interest update error", error);
    return NextResponse.json(
      { error: "Unable to update interest." },
      { status: 500 },
    );
  }
}
