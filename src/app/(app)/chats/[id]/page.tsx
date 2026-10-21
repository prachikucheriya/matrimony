import { redirect, notFound } from "next/navigation";
import { ChatThreadView } from "@/components/ChatThreadView";
import { DashShell } from "@/components/DashShell";
import { formatChatTime } from "@/lib/chat";
import { canUseChat } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  hasPartnerPreference,
  isProfileComplete,
} from "@/lib/validators";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: { include: { partnerPreference: true } } },
  });

  if (!user) redirect("/login");
  if (!isProfileComplete(user.profile)) redirect("/onboarding");
  if (!hasPartnerPreference(user.profile)) redirect("/preferences");

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      OR: [{ userAId: user.id }, { userBId: user.id }],
    },
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
    },
  });

  if (!conversation) notFound();

  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });

  const other =
    conversation.userAId === user.id ? conversation.userB : conversation.userA;
  const profile = user.profile!;

  return (
    <DashShell
      userName={profile.displayName || "Member"}
      contact={user.phone ?? user.email ?? ""}
      photoUrl={profile.photoUrl}
      active="chats"
    >
      <ChatThreadView
        conversationId={conversation.id}
        otherName={other.profile?.displayName ?? "Member"}
        otherPhotoUrl={other.profile?.photoUrl ?? null}
        canChat={canUseChat(user.plan)}
        initialMessages={messages.map((message) => ({
          id: message.id,
          body: message.body,
          time: formatChatTime(message.createdAt),
          mine: message.senderId === user.id,
        }))}
      />
    </DashShell>
  );
}
