import { redirect } from "next/navigation";
import { InterestStatus } from "@prisma/client";
import { ChatListView } from "@/components/ChatListView";
import { DashShell } from "@/components/DashShell";
import { ensureConversation, formatChatTime } from "@/lib/chat";
import { canUseChat } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  hasPartnerPreference,
  isProfileComplete,
} from "@/lib/validators";

export default async function ChatsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: { include: { partnerPreference: true } } },
  });

  if (!user) redirect("/login");
  if (!isProfileComplete(user.profile)) redirect("/onboarding");
  if (!hasPartnerPreference(user.profile)) redirect("/preferences");

  const profile = user.profile!;

  const accepted = await prisma.interest.findMany({
    where: {
      status: InterestStatus.ACCEPTED,
      OR: [{ toUserId: user.id }, { fromUserId: user.id }],
    },
    select: { fromUserId: true, toUserId: true },
  });

  await Promise.all(
    accepted.map((row) => ensureConversation(row.fromUserId, row.toUserId)),
  );

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ userAId: user.id }, { userBId: user.id }],
      messages: { some: {} },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    include: {
      userA: {
        include: {
          profile: { select: { displayName: true, photoUrl: true } },
        },
      },
      userB: {
        include: {
          profile: { select: { displayName: true, photoUrl: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const chats = await Promise.all(
    conversations.map(async (conversation) => {
      const other =
        conversation.userAId === user.id ? conversation.userB : conversation.userA;
      const last = conversation.messages[0];
      const unread = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: user.id },
          readAt: null,
        },
      });

      return {
        id: conversation.id,
        name: other.profile?.displayName ?? "Member",
        photoUrl: other.profile?.photoUrl ?? null,
        preview: last?.body ?? "Start a conversation",
        time: formatChatTime(last?.createdAt ?? conversation.updatedAt),
        unread,
        hasMessages: true,
      };
    }),
  );

  return (
    <DashShell
      userName={profile.displayName || "Member"}
      contact={user.phone ?? user.email ?? ""}
      photoUrl={profile.photoUrl}
      active="chats"
    >
      <ChatListView chats={chats} canChat={canUseChat(user.plan)} />
    </DashShell>
  );
}
