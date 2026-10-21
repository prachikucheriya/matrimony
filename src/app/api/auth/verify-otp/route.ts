import { NextResponse } from "next/server";
import { OtpChannel } from "@prisma/client";
import { normalizeIdentifier, verifyOtpCode } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import {
  hasPartnerPreference,
  isProfileComplete,
  verifyOtpSchema,
} from "@/lib/validators";

const profileInclude = {
  profile: { include: { partnerPreference: true } },
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const channel = parsed.data.channel as OtpChannel;
    const intent = parsed.data.intent;
    const identifier = normalizeIdentifier(channel, parsed.data.identifier);
    const verified = await verifyOtpCode(channel, identifier, parsed.data.code);

    if (!verified.ok) {
      return NextResponse.json({ error: verified.error }, { status: 400 });
    }

    let user =
      channel === OtpChannel.EMAIL
        ? await prisma.user.findUnique({
            where: { email: identifier },
            include: profileInclude,
          })
        : await prisma.user.findUnique({
            where: { phone: identifier },
            include: profileInclude,
          });

    if (!user) {
      if (intent === "login") {
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

      user = await prisma.user.create({
        data: {
          email: channel === OtpChannel.EMAIL ? identifier : null,
          phone: channel === OtpChannel.SMS ? identifier : null,
          emailVerifiedAt: channel === OtpChannel.EMAIL ? new Date() : null,
          phoneVerifiedAt: channel === OtpChannel.SMS ? new Date() : null,
          profile: { create: {} },
        },
        include: profileInclude,
      });
    } else {
      if (intent === "register") {
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

      if (!user.profile) {
        await prisma.profile.create({ data: { userId: user.id } });
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerifiedAt:
            channel === OtpChannel.EMAIL ? new Date() : user.emailVerifiedAt,
          phoneVerifiedAt:
            channel === OtpChannel.SMS ? new Date() : user.phoneVerifiedAt,
        },
        include: profileInclude,
      });
    }

    await setSessionCookie({ userId: user.id, role: user.role });

    const needsOnboarding = !isProfileComplete(user.profile);
    const needsPreferences =
      !needsOnboarding && !hasPartnerPreference(user.profile);

    return NextResponse.json({
      ok: true,
      needsOnboarding,
      needsPreferences,
      identifier,
      channel,
      phone: user.phone,
      email: user.email,
      redirectTo: needsOnboarding
        ? "/onboarding"
        : needsPreferences
          ? "/preferences"
          : "/home",
    });
  } catch (error) {
    console.error("verify-otp error", error);
    return NextResponse.json({ error: "Unable to verify OTP." }, { status: 500 });
  }
}
