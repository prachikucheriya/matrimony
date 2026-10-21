import { Gender, PartnerWorkType, Prisma } from "@prisma/client";
import {
  categoryMatchFilter,
  parsePreferredCategories,
  type ProfileCategory,
} from "@/lib/categories";
import { prisma } from "@/lib/prisma";

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

function occupationFilter(workType: PartnerWorkType | null | undefined) {
  if (!workType) return undefined;
  if (workType === "HOMEMAKER") {
    return { contains: "Homemaker" };
  }
  if (workType === "BUSINESS") {
    return { in: ["Business", "Self Employed"] };
  }
  // JOB
  return {
    notIn: ["Homemaker", "Business", "Self Employed", "Student"],
  };
}

export async function getSuggestedProfiles(input: {
  userId: string;
  gender: Gender | null | undefined;
  preference: {
    ageMin: number;
    ageMax: number;
    anyCaste: boolean;
    preferredCasteIds: string;
    workType: PartnerWorkType | null;
    incomeRange: string | null;
    preferredCategories?: string | null;
  } | null;
  take?: number;
  /** Optional override for browse filters (same category keys). */
  categoriesOverride?: ProfileCategory[];
}) {
  const opposite: Gender | undefined =
    input.gender === "BRIDE"
      ? "GROOM"
      : input.gender === "GROOM"
        ? "BRIDE"
        : undefined;

  const where: Prisma.ProfileWhereInput = {
    status: "ACTIVE",
    userId: { not: input.userId },
    ...(opposite ? { gender: opposite } : {}),
  };

  const pref = input.preference;
  if (pref) {
    const ageMin = Math.min(pref.ageMin, pref.ageMax);
    const ageMax = Math.max(pref.ageMin, pref.ageMax);
    const { oldest, youngest } = ageBoundsToDates(ageMin, ageMax);
    where.dob = { gte: oldest, lte: youngest };

    if (!pref.anyCaste) {
      try {
        const casteIds = JSON.parse(pref.preferredCasteIds || "[]") as string[];
        if (Array.isArray(casteIds) && casteIds.length > 0) {
          where.casteId = { in: casteIds };
        }
      } catch {
        // ignore bad json
      }
    }

    const occ = occupationFilter(pref.workType);
    if (occ) where.occupation = occ;

    if (pref.incomeRange && pref.workType !== "HOMEMAKER") {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { incomeRange: pref.incomeRange },
            { incomeRange: "Prefer not to say" },
          ],
        },
      ];
    }

    const categories =
      input.categoriesOverride && input.categoriesOverride.length > 0
        ? input.categoriesOverride
        : parsePreferredCategories(pref.preferredCategories);
    const catFilter = categoryMatchFilter(categories);
    if (catFilter) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        catFilter,
      ];
    }
  } else if (input.categoriesOverride && input.categoriesOverride.length > 0) {
    const catFilter = categoryMatchFilter(input.categoriesOverride);
    if (catFilter) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        catFilter,
      ];
    }
  }

  return prisma.profile.findMany({
    where,
    take: input.take ?? 8,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      userId: true,
      displayName: true,
      city: true,
      state: true,
      photoUrl: true,
      dob: true,
      occupation: true,
      height: true,
      incomeRange: true,
      maritalStatus: true,
      isDifferentlyAbled: true,
      caste: { select: { name: true } },
    },
  });
}
