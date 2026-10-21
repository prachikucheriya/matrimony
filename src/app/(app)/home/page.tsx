import { redirect } from "next/navigation";
import { UserDashboard } from "@/components/UserDashboard";
import { ensureDemoInterests, getUserInterests } from "@/lib/interests";
import { getSuggestedProfiles } from "@/lib/matches";
import {
  canUseChat,
  canViewContactDetails,
  planLabel,
} from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  hasPartnerPreference,
  isProfileComplete,
} from "@/lib/validators";

function ageFromDob(dob: Date | null | undefined) {
  if (!dob) return null;
  return Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function calcCompletion(profile: {
  displayName: string | null;
  dob: Date | null;
  height: string | null;
  birthPlace: string | null;
  complexion: string | null;
  education: string | null;
  occupation: string | null;
  city: string | null;
  address: string | null;
  fatherName: string | null;
  motherName: string | null;
  photoUrl: string | null;
  religionId: string | null;
  casteId: string | null;
  partnerPreference?: { id: string } | null;
}) {
  const checks = [
    profile.displayName,
    profile.dob,
    profile.height,
    profile.birthPlace,
    profile.complexion,
    profile.education,
    profile.occupation,
    profile.city,
    profile.address,
    profile.fatherName,
    profile.motherName,
    profile.photoUrl,
    profile.religionId,
    profile.casteId,
    profile.partnerPreference?.id,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

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

  if (!user) redirect("/login");
  if (!isProfileComplete(user.profile)) redirect("/onboarding");
  if (!hasPartnerPreference(user.profile)) redirect("/preferences");

  const profile = user.profile!;
  const matches = await getSuggestedProfiles({
    userId: user.id,
    gender: profile.gender,
    preference: profile.partnerPreference,
    take: 8,
  });

  await ensureDemoInterests(
    user.id,
    matches.map((m) => m.userId),
  );
  const interests = await getUserInterests(user.id);

  return (
    <UserDashboard
      userName={profile.displayName || "Member"}
      contact={user.phone ?? user.email ?? ""}
      photoUrl={profile.photoUrl}
      completion={calcCompletion(profile)}
      planLabel={planLabel(user.plan)}
      canChat={canUseChat(user.plan)}
      canViewContact={canViewContactDetails(user.plan)}
      profileSummary={{
        gender: profile.gender === "BRIDE" ? "Bride" : "Groom",
        age: ageFromDob(profile.dob),
        city: profile.city,
        state: profile.state,
        community: [profile.religion?.name, profile.caste?.name]
          .filter(Boolean)
          .join(" · "),
        education: profile.education,
        occupation: profile.occupation,
      }}
      matches={matches.map((m) => ({
        ...m,
        age: ageFromDob(m.dob),
      }))}
      interests={interests}
      suggestionsBasedOnPrefs
    />
  );
}
