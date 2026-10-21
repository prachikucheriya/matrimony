import { redirect } from "next/navigation";
import { DashShell } from "@/components/DashShell";
import { InterestsPageView } from "@/components/InterestsPageView";
import { toOppositeGender } from "@/components/UserDashboard";
import { ensureDemoInterests, getUserInterests } from "@/lib/interests";
import { canUseChat } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  hasPartnerPreference,
  isProfileComplete,
} from "@/lib/validators";

export default async function InterestsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: { include: { partnerPreference: true } } },
  });

  if (!user) redirect("/login");
  if (!isProfileComplete(user.profile)) redirect("/onboarding");
  if (!hasPartnerPreference(user.profile)) redirect("/preferences");

  const profile = user.profile!;
  const opposite = toOppositeGender(profile.gender);

  const matches = await prisma.profile.findMany({
    where: {
      status: "ACTIVE",
      userId: { not: user.id },
      ...(opposite ? { gender: opposite } : {}),
    },
    take: 8,
    select: { userId: true },
  });

  await ensureDemoInterests(
    user.id,
    matches.map((m) => m.userId),
  );

  const interests = await getUserInterests(user.id);

  return (
    <DashShell
      userName={profile.displayName || "Member"}
      contact={user.phone ?? user.email ?? ""}
      photoUrl={profile.photoUrl}
      active="interests"
    >
      <InterestsPageView
        interests={interests}
        canChat={canUseChat(user.plan)}
      />
    </DashShell>
  );
}
