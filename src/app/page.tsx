import { redirect } from "next/navigation";
import { HowItWorks } from "@/components/HowItWorks";
import { LandingHero } from "@/components/LandingHero";
import { RecentCouples } from "@/components/RecentCouples";
import { ServicesSlider } from "@/components/ServicesSlider";
import { SiteFooter } from "@/components/SiteFooter";
import { WelcomeAbout } from "@/components/WelcomeAbout";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  hasPartnerPreference,
  isProfileComplete,
} from "@/lib/validators";

export default async function LandingPage() {
  const session = await getSession();
  let isLoggedIn = false;

  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: { include: { partnerPreference: true } } },
    });
    if (user) {
      if (!isProfileComplete(user.profile)) redirect("/onboarding");
      if (!hasPartnerPreference(user.profile)) redirect("/preferences");
      isLoggedIn = true;
    }
  }

  const religions = await prisma.religion.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="landing-page">
      <LandingHero isLoggedIn={isLoggedIn} religions={religions} />
      <WelcomeAbout />
      <ServicesSlider />
      <HowItWorks />
      <RecentCouples />
      <SiteFooter />
    </main>
  );
}
