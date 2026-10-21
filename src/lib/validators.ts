import { z } from "zod";

export const sendOtpSchema = z.object({
  channel: z.enum(["SMS", "EMAIL"]),
  identifier: z.string().min(5).max(120),
  intent: z.enum(["login", "register"]).default("login"),
});

export const verifyOtpSchema = z.object({
  channel: z.enum(["SMS", "EMAIL"]),
  identifier: z.string().min(5).max(120),
  code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  intent: z.enum(["login", "register"]).default("login"),
});

export const partnerPreferenceSchema = z
  .object({
    gender: z.enum(["BRIDE", "GROOM"]).optional(),
    prefAgeMin: z.coerce.number().int().min(18).max(80),
    prefAgeMax: z.coerce.number().int().min(18).max(80),
    prefAnyCaste: z.boolean().default(false),
    prefCasteIds: z.array(z.string().min(1)).default([]),
    prefWorkType: z.enum(["JOB", "BUSINESS", "HOMEMAKER"]).optional().nullable(),
    prefIncomeRange: z.string().max(80).optional().default(""),
    prefKundali: z.enum(["COMPULSORY", "OPTIONAL"]),
    prefCategories: z
      .array(z.enum(["FRESH", "DIVORCEE", "WIDOW", "HANDICAP"]))
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (data.prefAgeMin > data.prefAgeMax) {
      ctx.addIssue({
        code: "custom",
        message: "Minimum age cannot be greater than maximum age.",
        path: ["prefAgeMin"],
      });
    }
    if (!data.prefAnyCaste && data.prefCasteIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one caste, or choose Any caste.",
        path: ["prefCasteIds"],
      });
    }
    if (data.prefCategories.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one partner category (Fresh, Divorcee, Widow, or Differently abled).",
        path: ["prefCategories"],
      });
    }

    // User creating BRIDE profile is searching for GROOM, and vice versa.
    const searchingFor =
      data.gender === "BRIDE" ? "GROOM" : data.gender === "GROOM" ? "BRIDE" : null;

    if (searchingFor === "BRIDE") {
      if (
        data.prefWorkType !== "JOB" &&
        data.prefWorkType !== "BUSINESS" &&
        data.prefWorkType !== "HOMEMAKER"
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Select partner work type: Job, Business, or Homemaker.",
          path: ["prefWorkType"],
        });
      }
      if (
        (data.prefWorkType === "JOB" || data.prefWorkType === "BUSINESS") &&
        !data.prefIncomeRange?.trim()
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Select partner income range for working bride.",
          path: ["prefIncomeRange"],
        });
      }
    }

    if (searchingFor === "GROOM") {
      if (data.prefWorkType !== "JOB" && data.prefWorkType !== "BUSINESS") {
        ctx.addIssue({
          code: "custom",
          message: "Select partner work type: Job or Business.",
          path: ["prefWorkType"],
        });
      }
      if (!data.prefIncomeRange?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Select partner income range.",
          path: ["prefIncomeRange"],
        });
      }
    }
  });

export const onboardingSchema = z
  .object({
    gender: z.enum(["BRIDE", "GROOM"]),
    displayName: z.string().min(2).max(80),
    dob: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date"),
    motherTongue: z.string().min(2).max(40),
    height: z.string().min(1).max(20),
    birthPlace: z.string().min(2).max(80),
    birthTime: z.string().min(1).max(20),
    complexion: z.string().min(2).max(40),
    religionId: z.string().min(1),
    casteId: z.string().min(1),
    subCasteId: z.string().min(1),
    education: z.string().min(2).max(80),
    occupation: z.string().min(2).max(80),
    incomeRange: z.string().min(2).max(80),
    city: z.string().min(2).max(80),
    state: z.string().min(2).max(80),
    address: z.string().min(5).max(250),
    fatherName: z.string().min(2).max(80),
    fatherOccupation: z.string().min(2).max(80),
    motherName: z.string().min(2).max(80),
    motherOccupation: z.string().min(2).max(80),
    brothersCount: z.coerce.number().int().min(0).max(20),
    brothersNames: z.string().max(300).optional().default(""),
    sistersCount: z.coerce.number().int().min(0).max(20),
    sistersNames: z.string().max(300).optional().default(""),
    maritalStatus: z.enum([
      "NEVER_MARRIED",
      "DIVORCED",
      "WIDOWED",
      "SEPARATED",
      "MARRIED",
    ]),
    spouseName: z.string().max(80).optional().default(""),
    spouseOccupation: z.string().max(80).optional().default(""),
    isDifferentlyAbled: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.brothersCount > 0 && !data.brothersNames.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Enter brother name(s).",
        path: ["brothersNames"],
      });
    }
    if (data.sistersCount > 0 && !data.sistersNames.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Enter sister name(s).",
        path: ["sistersNames"],
      });
    }
    if (data.maritalStatus === "MARRIED") {
      if (!data.spouseName.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Enter spouse name.",
          path: ["spouseName"],
        });
      }
      if (!data.spouseOccupation.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Enter spouse occupation.",
          path: ["spouseOccupation"],
        });
      }
    }
  });

export function isProfileComplete(profile: {
  displayName: string | null;
  gender: string | null;
  dob: Date | null;
  motherTongue: string | null;
  religionId: string | null;
  casteId: string | null;
  subCasteId: string | null;
  education: string | null;
  occupation: string | null;
  incomeRange: string | null;
  city: string | null;
  state: string | null;
  status: string;
} | null): boolean {
  if (!profile) return false;
  if (profile.status === "INCOMPLETE") return false;
  return Boolean(
    profile.displayName &&
      profile.gender &&
      profile.dob &&
      profile.motherTongue &&
      profile.religionId &&
      profile.casteId &&
      profile.subCasteId &&
      profile.education &&
      profile.occupation &&
      profile.incomeRange &&
      profile.city &&
      profile.state,
  );
}

export function hasPartnerPreference(
  profile: { partnerPreference?: { id: string } | null } | null,
): boolean {
  return Boolean(profile?.partnerPreference?.id);
}

export function isOnboardingComplete(
  profile: Parameters<typeof isProfileComplete>[0] & {
    partnerPreference?: { id: string } | null;
  },
): boolean {
  return isProfileComplete(profile) && hasPartnerPreference(profile);
}
