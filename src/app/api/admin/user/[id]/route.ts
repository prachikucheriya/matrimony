
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (id === session.userId) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!target) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (target.role === "ADMIN") {
      return NextResponse.json(
        { error: "Admin accounts cannot be deleted" },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Delete conversations involving this user.
      // Messages in these conversations are removed by cascade.
      await tx.conversation.deleteMany({
        where: {
          OR: [{ userAId: id }, { userBId: id }],
        },
      });

      // Other related records are removed by Prisma cascades.
      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      ok: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete user error", error);

    return NextResponse.json(
      { error: "Unable to delete account" },
      { status: 500 }
    );
  }
}
