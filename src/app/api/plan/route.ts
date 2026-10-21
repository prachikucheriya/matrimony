import { NextResponse } from "next/server";
import { MembershipPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { planLabel } from "@/lib/plan";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { plan: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    plan: user.plan,
    label: planLabel(user.plan),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const plan = body.plan as MembershipPlan | undefined;
    if (plan !== "FREE" && plan !== "GOLD" && plan !== "PLATINUM") {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { plan },
      select: { plan: true },
    });

    return NextResponse.json({
      ok: true,
      plan: user.plan,
      label: planLabel(user.plan),
      redirectTo: "/plan",
    });
  } catch (error) {
    console.error("plan update error", error);
    return NextResponse.json(
      { error: "Unable to update plan." },
      { status: 500 },
    );
  }
}
