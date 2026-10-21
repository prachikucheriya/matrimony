import { redirect } from "next/navigation";
import { DashShell } from "@/components/DashShell";
import { EditProfileForm } from "@/components/EditProfileForm";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  hasPartnerPreference,
  isProfileComplete,
} from "@/lib/validators";

export default async function EditProfilePage() {
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

  return (
    <DashShell
      userName={profile.displayName || "Member"}
      contact={user.phone ?? user.email ?? ""}
      photoUrl={profile.photoUrl}
      active="profile"
    >
      <section className="dash-page-panel">
        <header className="interest-page-head">
          <h1>Profile</h1>
        </header>
        <p className="lede" style={{ marginTop: 0, marginBottom: "1rem" }}>
          Update your personal, community, career and family details anytime.
        </p>
        <EditProfileForm initial={profile} />
      </section>
    </DashShell>
  );
}
