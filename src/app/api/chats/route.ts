import { NextResponse } from "next/server";
import { InterestStatus } from "@prisma/client";
import { ensureConversation, formatChatTime } from "@/lib/chat";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function syncAcceptedConversations(userId: string) {
  const accepted = await prisma.interest.findMany({
    where: {
      status: InterestStatus.ACCEPTED,
      OR: [{ toUserId: userId }, { fromUserId: userId }],
    },
    select: { fromUserId: true, toUserId: true },
  });

  await Promise.all(
    accepted.map((row) =>
      ensureConversation(row.fromUserId, row.toUserId),
    ),
  );
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncAcceptedConversations(session.userId);

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ userAId: session.userId }, { userBId: session.userId }],
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
          conversation.userAId === session.userId
            ? conversation.userB
            : conversation.userA;
        const last = conversation.messages[0] ?? null;
        const unread = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: session.userId },
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
          hasMessages: Boolean(last),
        };
      }),
    );

    // Chat list focuses on active chat history first.
    chats.sort((a, b) => {
      if (a.hasMessages !== b.hasMessages) return a.hasMessages ? -1 : 1;
      return 0;
    });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("list chats error", error);
    return NextResponse.json(
      { error: "Unable to load chats." },
      { status: 500 },
    );
  }
}
