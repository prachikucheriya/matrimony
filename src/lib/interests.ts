import { InterestStatus } from "@prisma/client";
import type { InterestItem } from "@/components/DashboardClient";
import { prisma } from "@/lib/prisma";

function ageFromDob(dob: Date | null | undefined) {
  if (!dob) return null;
  return Math.floor(
    (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

const profileSelect = {
  displayName: true,
  city: true,
  dob: true,
  height: true,
  occupation: true,
  photoUrl: true,
} as const;

export async function ensureDemoInterests(
  userId: string,
  matchUserIds: string[],
) {
  const receivedCount = await prisma.interest.count({
    where: { toUserId: userId },
  });
  if (receivedCount > 0 || matchUserIds.length === 0) return;

  await prisma.interest.createMany({
    data: matchUserIds.slice(0, 3).map((fromUserId) => ({
      fromUserId,
      toUserId: userId,
      status: InterestStatus.PENDING,
    })),
  });
}

export async function getUserInterests(userId: string): Promise<InterestItem[]> {
  const interestRows = await prisma.interest.findMany({
    where: {
      OR: [{ toUserId: userId }, { fromUserId: userId }],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      fromUser: { include: { profile: { select: profileSelect } } },
      toUser: { include: { profile: { select: profileSelect } } },
    },
  });

  return interestRows.map((row) => {
    const other = row.fromUserId === userId ? row.toUser : row.fromUser;
    const otherProfile = other.profile;
    return {
      id: row.id,
      status: row.status,
      direction: (row.fromUserId === userId ? "sent" : "received") as
        | "sent"
        | "received",
      name: otherProfile?.displayName ?? "Member",
      city: otherProfile?.city ?? null,
      age: ageFromDob(otherProfile?.dob),
      height: otherProfile?.height ?? null,
      job: otherProfile?.occupation ?? null,
      photoUrl: otherProfile?.photoUrl ?? null,
      createdAt: row.createdAt.toISOString(),
      otherUserId: other.id,
    };
  });
}
