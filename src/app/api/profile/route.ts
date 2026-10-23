import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isProfileComplete, onboardingSchema } from "@/lib/validators";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: {
        include: {
          religion: true,
          caste: true,
          subCaste: true,
          partnerPreference: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    profile: user.profile,
    needsOnboarding: !isProfileComplete(user.profile),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid profile data" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const dob = new Date(data.dob);
    const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) {
      return NextResponse.json(
        { error: "You must be at least 18 years old." },
        { status: 400 },
      );
    }

    const caste = await prisma.caste.findFirst({
      where: { id: data.casteId, religionId: data.religionId },
    });
    if (!caste) {
      return NextResponse.json({ error: "Invalid caste selection." }, { status: 400 });
    }

    const subCaste = await prisma.subCaste.findFirst({
      where: { id: data.subCasteId, casteId: data.casteId },
    });
    if (!subCaste) {
      return NextResponse.json({ error: "Invalid sub-caste selection." }, { status: 400 });
    }

    const profileData = {
      displayName: data.displayName.trim(),
      gender: data.gender,
      dob,
      motherTongue: data.motherTongue,
      height: data.height,
      birthPlace: data.birthPlace.trim(),
      birthTime: data.birthTime,
      complexion: data.complexion,
      religionId: data.religionId,
      casteId: data.casteId,
      subCasteId: data.subCasteId,
      education: data.education,
      occupation: data.occupation,
      incomeRange: data.incomeRange,
      city: data.city.trim(),
      state: data.state,
      address: data.address.trim(),
      fatherName: data.fatherName.trim(),
      fatherOccupation: data.fatherOccupation.trim(),
      motherName: data.motherName.trim(),
      motherOccupation: data.motherOccupation.trim(),
      brothersCount: data.brothersCount,
      brothersNames: data.brothersNames.trim() || null,
      sistersCount: data.sistersCount,
      sistersNames: data.sistersNames.trim() || null,
      maritalStatus: data.maritalStatus,
      spouseName:
        data.maritalStatus === "MARRIED" ? data.spouseName.trim() || null : null,
      spouseOccupation:
        data.maritalStatus === "MARRIED"
          ? data.spouseOccupation.trim() || null
          : null,
      isDifferentlyAbled: Boolean(data.isDifferentlyAbled),
      status: "ACTIVE" as const,
    };

    const profile = await prisma.profile.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        ...profileData,
      },
      update: profileData,
    });

    // Draft table may not exist in older Neon databases; profile saving must not fail.
    try {
      await prisma.onboardingDraft.deleteMany({ where: { userId: session.userId } });
    } catch (draftError) {
      console.warn("Draft cleanup skipped:", draftError);
    }

    const existingPref = await prisma.partnerPreference.findUnique({
      where: { profileId: profile.id },
      select: { id: true },
    });

    return NextResponse.json({
      ok: true,
      profile,
      redirectTo: existingPref ? "/home" : "/preferences",
    });
  } catch (error) {
    console.error("profile save error", error);
    return NextResponse.json({ error: "Unable to save profile." }, { status: 500 });
  }
}
