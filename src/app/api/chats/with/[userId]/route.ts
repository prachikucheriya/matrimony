import { NextResponse } from "next/server";
import { InterestStatus } from "@prisma/client";
import { ensureConversation } from "@/lib/chat";
import { canUseChat } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
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

    const { userId: otherUserId } = await context.params;
    if (!otherUserId || otherUserId === session.userId) {
      return NextResponse.json({ error: "Invalid user." }, { status: 400 });
    }

    const accepted = await prisma.interest.findFirst({
      where: {
        status: InterestStatus.ACCEPTED,
        OR: [
          { fromUserId: session.userId, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: session.userId },
        ],
      },
    });

    if (!accepted) {
      return NextResponse.json(
        { error: "Chat unlocks after interest is accepted." },
        { status: 403 },
      );
    }

    const conversation = await ensureConversation(session.userId, otherUserId);
    return NextResponse.json({
      ok: true,
      conversationId: conversation.id,
      redirectTo: `/chats/${conversation.id}`,
    });
  } catch (error) {
    console.error("open chat error", error);
    return NextResponse.json(
      { error: "Unable to open chat." },
      { status: 500 },
    );
  }
}
