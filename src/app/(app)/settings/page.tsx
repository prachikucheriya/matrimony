import { DashShell } from "@/components/DashShell";
import { SettingsPageView } from "@/components/SettingsPageView";
import { requireDashUser } from "@/lib/dash-user";
import { planLabel } from "@/lib/plan";

export default async function SettingsPage() {
  const { user, profile, contact } = await requireDashUser();

  return (
    <DashShell
      userName={profile.displayName || "Member"}
      contact={contact}
      photoUrl={profile.photoUrl}
      active="settings"
    >
      <SettingsPageView
        userName={profile.displayName || "Member"}
        contact={contact}
        email={user.email}
        phone={user.phone}
        photoUrl={profile.photoUrl}
        city={profile.city}
        state={profile.state}
        planLabel={planLabel(user.plan)}
      />
    </DashShell>
  );
}
