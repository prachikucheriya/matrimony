import { createHash, randomInt, timingSafeEqual } from "crypto";
import { OtpChannel } from "@prisma/client";
import { sendMsg91EmailOtp, sendMsg91SmsOtp } from "@/lib/msg91";
import { prisma } from "@/lib/prisma";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;

function isDevOtpMode() {
  return process.env.OTP_DEV_MODE !== "false";
}

export function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function generateOtpCode(): string {
  return String(randomInt(100000, 999999));
}

export function normalizeIdentifier(channel: OtpChannel, raw: string): string {
  const value = raw.trim();
  if (channel === OtpChannel.EMAIL) {
    return value.toLowerCase();
  }
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (value.startsWith("+") && digits.length >= 10) return `+${digits}`;
  return `+${digits}`;
}

export async function createAndSendOtp(channel: OtpChannel, identifier: string) {
  const recent = await prisma.otpChallenge.findFirst({
    where: {
      identifier,
      channel,
      createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_MS) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recent) {
    const waitMs = RESEND_COOLDOWN_MS - (Date.now() - recent.createdAt.getTime());
    return {
      ok: false as const,
      error: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another OTP.`,
      retryAfterSeconds: Math.ceil(waitMs / 1000),
    };
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const challenge = await prisma.otpChallenge.create({
    data: {
      identifier,
      channel,
      codeHash: hashOtp(code),
      expiresAt,
    },
  });

  let delivery:
    | { ok: true; provider: string }
    | { ok: false; error: string };

  try {
    delivery =
      channel === OtpChannel.EMAIL
        ? await sendMsg91EmailOtp(identifier, code)
        : await sendMsg91SmsOtp(identifier, code);
  } catch (error) {
    console.error("OTP provider error", error);
    delivery = { ok: false, error: "OTP provider request failed." };
  }

  if (!delivery.ok) {
    if (!isDevOtpMode()) {
      await prisma.otpChallenge.delete({ where: { id: challenge.id } });
      return { ok: false as const, error: delivery.error };
    }

    console.warn(`[OTP fallback] ${channel} ${identifier}: ${delivery.error}`);
    console.log(`[OTP:${channel}] ${identifier} => ${code} (dev fallback)`);
    return {
      ok: true as const,
      expiresAt,
      delivered: false,
      deliveryError: delivery.error,
      devCode: code,
    };
  }

  console.log(`[OTP:${channel}] sent via ${delivery.provider} to ${identifier}`);

  return {
    ok: true as const,
    expiresAt,
    delivered: true,
    ...(isDevOtpMode() ? { devCode: code } : {}),
  };
}

export async function verifyOtpCode(
  channel: OtpChannel,
  identifier: string,
  code: string,
) {
  const challenge = await prisma.otpChallenge.findFirst({
    where: { identifier, channel },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) {
    return { ok: false as const, error: "No OTP found. Please request a new one." };
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    return { ok: false as const, error: "OTP expired. Please request a new one." };
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    return { ok: false as const, error: "Too many attempts. Please request a new OTP." };
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { attempts: { increment: 1 } },
  });

  const expected = Buffer.from(challenge.codeHash, "hex");
  const actual = Buffer.from(hashOtp(code), "hex");
  const matches =
    expected.length === actual.length && timingSafeEqual(expected, actual);

  if (!matches) {
    return { ok: false as const, error: "Invalid OTP. Please try again." };
  }

  await prisma.otpChallenge.deleteMany({ where: { identifier, channel } });
  return { ok: true as const };
}
