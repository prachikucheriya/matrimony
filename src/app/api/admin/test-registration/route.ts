import { NextResponse } from "next/server";
import { OtpChannel } from "@prisma/client";
import { getSession, setSessionCookie } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, hashOtp, verifyOtpCode } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (process.env.ADMIN_TEST_REGISTRATION_ENABLED !== "true") {
      return NextResponse.json({ error: "Admin testing is disabled." }, { status: 403 });
    }
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).host !== request.headers.get("host")) {
      return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
    }
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin login required." }, { status: 403 });
    }
    const admin = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    if (admin?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin login required." }, { status: 403 });
    }
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      return NextResponse.json({ error: "Email already registered. Use a new test email." }, { status: 409 });
    }
    if (body.action === "send") {
      const recent = await prisma.otpChallenge.findFirst({
        where: { identifier: email, channel: OtpChannel.EMAIL, createdAt: { gte: new Date(Date.now() - 30000) } },
      });
      if (recent) return NextResponse.json({ error: "Wait 30 seconds before another OTP." }, { status: 429 });
      const code = generateOtpCode();
      await prisma.otpChallenge.create({
        data: { identifier: email, channel: OtpChannel.EMAIL, codeHash: hashOtp(code), expiresAt: new Date(Date.now() + 600000) },
      });
      return NextResponse.json({ ok: true, code });
    }
    if (body.action === "verify") {
      const code = typeof body.code === "string" ? body.code : "";
      if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter the 6-digit OTP." }, { status: 400 });
      const result = await verifyOtpCode(OtpChannel.EMAIL, email, code);
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
      const user = await prisma.user.create({
        data: { email, emailVerifiedAt: new Date(), profile: { create: {} } },
      });
      await setSessionCookie({ userId: user.id, role: "USER" });
      return NextResponse.json({ ok: true, redirectTo: "/onboarding" });
    }
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("admin test registration error", error);
    return NextResponse.json({ error: "Unable to complete test registration." }, { status: 500 });
  }
}
