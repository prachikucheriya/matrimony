import { prisma } from "@/lib/prisma";

/** Keep pair order stable so unique constraint works. */
export function orderedUserPair(userId1: string, userId2: string) {
  return userId1 < userId2
    ? { userAId: userId1, userBId: userId2 }
    : { userAId: userId2, userBId: userId1 };
}

export async function ensureConversation(userId1: string, userId2: string) {
  const pair = orderedUserPair(userId1, userId2);
  return prisma.conversation.upsert({
    where: {
      userAId_userBId: pair,
    },
    create: pair,
    update: {},
  });
}

export function formatChatTime(date: Date | null | undefined) {
  if (!date) return "";
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}
