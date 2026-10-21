import type { MaritalStatus, Prisma } from "@prisma/client";

export const PROFILE_CATEGORIES = [
  "FRESH",
  "DIVORCEE",
  "WIDOW",
  "HANDICAP",
] as const;

export type ProfileCategory = (typeof PROFILE_CATEGORIES)[number];

export const PROFILE_CATEGORY_OPTIONS: {
  value: ProfileCategory;
  label: string;
  hint: string;
}[] = [
  {
    value: "FRESH",
    label: "Fresh",
    hint: "Never married",
  },
  {
    value: "DIVORCEE",
    label: "Divorcee",
    hint: "Divorced or separated",
  },
  {
    value: "WIDOW",
    label: "Widow / Widower",
    hint: "Widowed",
  },
  {
    value: "HANDICAP",
    label: "Differently abled",
    hint: "Physical disability / handicap",
  },
];

export function isProfileCategory(value: string): value is ProfileCategory {
  return (PROFILE_CATEGORIES as readonly string[]).includes(value);
}

export function parsePreferredCategories(raw: string | null | undefined): ProfileCategory[] {
  try {
    const parsed = JSON.parse(raw || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ProfileCategory =>
      typeof item === "string" && isProfileCategory(item),
    );
  } catch {
    return [];
  }
}

/** Categories that apply to a profile (can be more than one, e.g. Divorcee + Handicap). */
export function categoriesForProfile(input: {
  maritalStatus: MaritalStatus | null | undefined;
  isDifferentlyAbled?: boolean | null;
}): ProfileCategory[] {
  const out: ProfileCategory[] = [];
  if (input.maritalStatus === "NEVER_MARRIED") out.push("FRESH");
  if (input.maritalStatus === "DIVORCED" || input.maritalStatus === "SEPARATED") {
    out.push("DIVORCEE");
  }
  if (input.maritalStatus === "WIDOWED") out.push("WIDOW");
  if (input.isDifferentlyAbled) out.push("HANDICAP");
  return out;
}

/** Prisma OR filter: profile matches if it fits ANY selected category. */
export function categoryMatchFilter(
  categories: ProfileCategory[],
): Prisma.ProfileWhereInput | undefined {
  if (categories.length === 0) return undefined;

  const ors: Prisma.ProfileWhereInput[] = [];
  for (const cat of categories) {
    if (cat === "FRESH") {
      ors.push({ maritalStatus: "NEVER_MARRIED" });
    } else if (cat === "DIVORCEE") {
      ors.push({ maritalStatus: { in: ["DIVORCED", "SEPARATED"] } });
    } else if (cat === "WIDOW") {
      ors.push({ maritalStatus: "WIDOWED" });
    } else if (cat === "HANDICAP") {
      ors.push({ isDifferentlyAbled: true });
    }
  }

  if (ors.length === 0) return undefined;
  return { OR: ors };
}
