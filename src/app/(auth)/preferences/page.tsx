import { OnboardingLogout } from "@/components/OnboardingLogout";
import { redirect } from "next/navigation";
import { PreferencesForm } from "@/components/PreferencesForm";
import { PreferencesPageClient } from "@/components/PreferencesPageClient";
import { parsePreferredCategories } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  hasPartnerPreference,
  isProfileComplete,
} from "@/lib/validators";

export default async function PreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const isEdit = params.edit === "1";

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: { include: { partnerPreference: true } },
    },
  });

  if (!user) redirect("/login");
  if (!isProfileComplete(user.profile)) redirect("/onboarding");

  const profile = user.profile!;
  const alreadySaved = hasPartnerPreference(profile);

  if (alreadySaved && !isEdit) {
    redirect("/home");
  }

  const pref = profile.partnerPreference;
  let casteIds: string[] = [];
  try {
    casteIds = pref
      ? (JSON.parse(pref.preferredCasteIds || "[]") as string[])
      : [];
  } catch {
    casteIds = [];
  }

  return (
    <><div className="flex justify-end p-3"><OnboardingLogout /></div><PreferencesPageClient alreadySaved={alreadySaved}>
      <PreferencesForm
        gender={profile.gender === "GROOM" ? "GROOM" : "BRIDE"}
        religionId={profile.religionId}
        initial={{
          prefAgeMin: pref ? String(pref.ageMin) : "21",
          prefAgeMax: pref ? String(pref.ageMax) : "35",
          prefAnyCaste: pref?.anyCaste ?? false,
          prefCasteIds: casteIds,
          prefWorkType:
            (pref?.workType as "JOB" | "BUSINESS" | "HOMEMAKER" | "") || "",
          prefIncomeRange: pref?.incomeRange ?? "",
          prefKundali:
            (pref?.kundaliMatch as "COMPULSORY" | "OPTIONAL" | "") || "",
          prefCategories: pref
            ? parsePreferredCategories(pref.preferredCategories)
            : ["FRESH"],
        }}
      />
    </PreferencesPageClient></>
  );
}
