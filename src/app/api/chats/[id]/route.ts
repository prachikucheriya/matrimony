import { NextResponse } from "next/server";
import { formatChatTime } from "@/lib/chat";
import { canUseChat } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function getOwnedConversation(conversationId: string, userId: string) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userAId: userId }, { userBId: userId }],
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
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const conversation = await getOwnedConversation(id, session.userId);
    if (!conversation) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    }

    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          include: {
            profile: { select: { displayName: true, photoUrl: true } },
          },
        },
      },
    });

    const other =
      conversation.userAId === session.userId
        ? conversation.userB
        : conversation.userA;

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        other: {
          id: other.id,
          name: other.profile?.displayName ?? "Member",
          photoUrl: other.profile?.photoUrl ?? null,
        },
      },
      messages: messages.map((message) => ({
        id: message.id,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
        time: formatChatTime(message.createdAt),
        mine: message.senderId === session.userId,
        senderName: message.sender.profile?.displayName ?? "Member",
      })),
    });
  } catch (error) {
    console.error("get chat error", error);
    return NextResponse.json(
      { error: "Unable to load chat history." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const me = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { plan: true },
    });
    if (!canUseChat(me?.plan)) {
      return NextResponse.json(
        {
          error:
            "Chat is disabled on Free plan. Upgrade to Gold or Platinum to chat.",
        },
        { status: 403 },
      );
    }

    const { id } = await context.params;
    const conversation = await getOwnedConversation(id, session.userId);
    if (!conversation) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    }

    const body = await request.json();
    const text = typeof body.body === "string" ? body.body.trim() : "";
    if (!text || text.length > 2000) {
      return NextResponse.json(
        { error: "Message must be between 1 and 2000 characters." },
        { status: 400 },
      );
    }

    const now = new Date();
    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId: id,
          senderId: session.userId,
          body: text,
        },
      });
      await tx.conversation.update({
        where: { id },
        data: { lastMessageAt: now },
      });
      return created;
    });

    return NextResponse.json({
      ok: true,
      message: {
        id: message.id,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
        time: formatChatTime(message.createdAt),
        mine: true,
      },
    });
  } catch (error) {
    console.error("send chat error", error);
    return NextResponse.json(
      { error: "Unable to send message." },
      { status: 500 },
    );
  }
}
