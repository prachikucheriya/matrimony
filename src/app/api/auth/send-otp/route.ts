import { NextResponse } from "next/server";
import { OtpChannel } from "@prisma/client";
import { createAndSendOtp, normalizeIdentifier } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { sendOtpSchema } from "@/lib/validators";

async function findUserByIdentifier(channel: OtpChannel, identifier: string) {
  if (channel === OtpChannel.EMAIL) {
    return prisma.user.findUnique({ where: { email: identifier } });
  }
  return prisma.user.findUnique({ where: { phone: identifier } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const channel = parsed.data.channel as OtpChannel;
    const intent = parsed.data.intent;
    const identifier = normalizeIdentifier(channel, parsed.data.identifier);

    if (channel === OtpChannel.EMAIL && !identifier.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (channel === OtpChannel.SMS && identifier.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });
    }

    const existing = await findUserByIdentifier(channel, identifier);

    if (intent === "login" && !existing) {
      return NextResponse.json(
        {
          error:
            channel === OtpChannel.SMS
              ? "This mobile number is not registered. Please register first."
              : "This email is not registered. Please register first.",
        },
        { status: 404 },
      );
    }

    if (intent === "register" && existing) {
      return NextResponse.json(
        {
          error:
            channel === OtpChannel.SMS
              ? "This mobile number is already registered. Please login with the same number."
              : "This email is already registered. Please login with the same email.",
        },
        { status: 409 },
      );
    }

    const result = await createAndSendOtp(channel, identifier);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, retryAfterSeconds: result.retryAfterSeconds },
        { status: 429 },
      );
    }

    return NextResponse.json({
      ok: true,
      channel,
      identifier,
      intent,
      expiresAt: result.expiresAt,
      delivered: result.delivered,
      ...(result.deliveryError ? { deliveryError: result.deliveryError } : {}),
      ...(result.devCode ? { devCode: result.devCode } : {}),
    });
  } catch (error) {
    console.error("send-otp error", error);
    return NextResponse.json({ error: "Unable to send OTP." }, { status: 500 });
  }
}
