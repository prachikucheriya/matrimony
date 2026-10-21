import { NextRequest, NextResponse } from "next/server";
import { Gender, Prisma } from "@prisma/client";
import {
  categoryMatchFilter,
  isProfileCategory,
  parsePreferredCategories,
} from "@/lib/categories";
import { canViewContactDetails } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function ageBoundsToDates(ageMin: number, ageMax: number) {
  const now = new Date();
  const oldest = new Date(
    now.getFullYear() - ageMax - 1,
    now.getMonth(),
    now.getDate() + 1,
  );
  const youngest = new Date(
    now.getFullYear() - ageMin,
    now.getMonth(),
    now.getDate(),
  );
  return { oldest, youngest };
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  const genderParam = request.nextUrl.searchParams.get("gender");
  const religion = (request.nextUrl.searchParams.get("religion") || "").trim();
  const motherTongue = (request.nextUrl.searchParams.get("motherTongue") || "").trim();
  const location = (request.nextUrl.searchParams.get("location") || "").trim();
  const sort = (request.nextUrl.searchParams.get("sort") || "newest").trim();
  const ageMin = Number(request.nextUrl.searchParams.get("ageMin") || "");
  const ageMax = Number(request.nextUrl.searchParams.get("ageMax") || "");
  const categoryParam = (request.nextUrl.searchParams.get("category") || "").trim();

  const viewer = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      plan: true,
      profile: {
        select: {
          gender: true,
          partnerPreference: { select: { preferredCategories: true } },
        },
      },
    },
  });
  const showContact = canViewContactDetails(viewer?.plan);
  const me = viewer?.profile;

  const oppositeGender: Gender | undefined =
    genderParam === "BRIDE" || genderParam === "GROOM"
      ? genderParam
      : me?.gender === "BRIDE"
        ? "GROOM"
        : me?.gender === "GROOM"
          ? "BRIDE"
          : undefined;

  const where: Prisma.ProfileWhereInput = {
    status: "ACTIVE",
    userId: { not: session.userId },
    ...(oppositeGender ? { gender: oppositeGender } : {}),
  };

  // Browse by explicit category chip, else by saved partner preferences
  const selectedCategories = categoryParam
    .split(",")
    .map((c) => c.trim())
    .filter(isProfileCategory);
  const prefCategories = parsePreferredCategories(
    me?.partnerPreference?.preferredCategories,
  );
  const catFilter = categoryMatchFilter(
    selectedCategories.length > 0 ? selectedCategories : prefCategories,
  );
  if (catFilter) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      catFilter,
    ];
  }

  if (religion) {
    where.religion = { name: { equals: religion } };
  }

  if (motherTongue) {
    where.motherTongue = { equals: motherTongue };
  }

  if (location) {
    const locationFilter = {
      OR: [{ state: { equals: location } }, { city: { contains: location } }],
    };
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      locationFilter,
    ];
  }

  if (!Number.isNaN(ageMin) && !Number.isNaN(ageMax) && ageMin > 0 && ageMax > 0) {
    const { oldest, youngest } = ageBoundsToDates(
      Math.min(ageMin, ageMax),
      Math.max(ageMin, ageMax),
    );
    where.dob = {
      gte: oldest,
      lte: youngest,
    };
  }

  if (q) {
    const textFilter = {
      OR: [
        { displayName: { contains: q } },
        { city: { contains: q } },
        { state: { contains: q } },
        { education: { contains: q } },
        { occupation: { contains: q } },
        { motherTongue: { contains: q } },
        { religion: { name: { contains: q } } },
        { caste: { name: { contains: q } } },
        { subCaste: { name: { contains: q } } },
      ],
    };

    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      textFilter,
    ];
  }

  const orderBy: Prisma.ProfileOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "name"
        ? { displayName: "asc" }
        : { updatedAt: "desc" };

  const profiles = await prisma.profile.findMany({
    where,
    take: 40,
    orderBy,
    include: {
      religion: true,
      caste: true,
      subCaste: true,
      user: { select: { phone: true } },
    },
  });

  return NextResponse.json({
    profiles: profiles.map((p) => ({
      id: p.id,
      displayName: p.displayName,
      gender: p.gender,
      dob: p.dob,
      height: p.height,
      city: p.city,
      state: p.state,
      education: p.education,
      occupation: p.occupation,
      photoUrl: p.photoUrl,
      religion: p.religion?.name ?? null,
      caste: p.caste?.name ?? null,
      subCaste: p.subCaste?.name ?? null,
      motherTongue: p.motherTongue,
      maritalStatus: p.maritalStatus,
      isDifferentlyAbled: p.isDifferentlyAbled,
      phone: showContact ? p.user.phone : null,
      address: showContact ? p.address : null,
    })),
    canViewContact: showContact,
  });
}
