import { OnboardingLogout } from "@/components/OnboardingLogout";
import { OnboardingPageClient } from "@/components/OnboardingWizard";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  hasPartnerPreference,
  isProfileComplete,
} from "@/lib/validators";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: { include: { partnerPreference: true } } },
  });

  if (!user) redirect("/login");
  if (isProfileComplete(user.profile)) {
    redirect(hasPartnerPreference(user.profile) ? "/home" : "/preferences");
  }

  return <><div className="flex justify-end p-3"><OnboardingLogout /></div><OnboardingPageClient userId={session.userId} /></>;
}
