import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { partnerPreferenceSchema } from "@/lib/validators";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
    include: { partnerPreference: true, religion: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    gender: profile.gender,
    religionId: profile.religionId,
    preference: profile.partnerPreference,
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });
    if (!profile || profile.status === "INCOMPLETE") {
      return NextResponse.json(
        { error: "Complete your profile first." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = partnerPreferenceSchema.safeParse({
      ...body,
      gender: profile.gender,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid preferences" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const preference = await prisma.partnerPreference.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        ageMin: data.prefAgeMin,
        ageMax: data.prefAgeMax,
        anyCaste: data.prefAnyCaste,
        preferredCasteIds: JSON.stringify(
          data.prefAnyCaste ? [] : data.prefCasteIds,
        ),
        workType: data.prefWorkType ?? null,
        incomeRange:
          data.prefWorkType === "HOMEMAKER"
            ? null
            : data.prefIncomeRange?.trim() || null,
        kundaliMatch: data.prefKundali,
        preferredCategories: JSON.stringify(data.prefCategories),
      },
      update: {
        ageMin: data.prefAgeMin,
        ageMax: data.prefAgeMax,
        anyCaste: data.prefAnyCaste,
        preferredCasteIds: JSON.stringify(
          data.prefAnyCaste ? [] : data.prefCasteIds,
        ),
        workType: data.prefWorkType ?? null,
        incomeRange:
          data.prefWorkType === "HOMEMAKER"
            ? null
            : data.prefIncomeRange?.trim() || null,
        kundaliMatch: data.prefKundali,
        preferredCategories: JSON.stringify(data.prefCategories),
      },
    });

    return NextResponse.json({
      ok: true,
      preference,
      redirectTo: "/home",
    });
  } catch (error) {
    console.error("preference save error", error);
    return NextResponse.json(
      { error: "Unable to save partner requirements." },
      { status: 500 },
    );
  }
}
