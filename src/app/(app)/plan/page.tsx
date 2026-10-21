import Link from "next/link";
import { DashShell } from "@/components/DashShell";
import { PricingPlans } from "@/components/PricingPlans";
import { requireDashUser } from "@/lib/dash-user";
import { canUseChat, canViewContactDetails, planLabel } from "@/lib/plan";

export default async function PlanPage() {
  const { user, profile, contact } = await requireDashUser();
  const label = planLabel(user.plan);
  const chatEnabled = canUseChat(user.plan);
  const contactVisible = canViewContactDetails(user.plan);

  return (
    <DashShell
      userName={profile.displayName || "Member"}
      contact={contact}
      photoUrl={profile.photoUrl}
      active="plan"
    >
      <section className="dash-page-panel">
        <div className="dash-panel soft" style={{ marginBottom: "1rem" }}>
          <div className="dash-panel-head">
            <h2>Current plan</h2>
            <span className="dash-plan-badge">{label}</span>
          </div>
          <ul className="dash-plan-list">
            <li>
              <span>Plan name</span>
              <strong>{label}</strong>
            </li>
            <li>
              <span>Mobile & address</span>
              <strong>{contactVisible ? "Visible" : "Hidden"}</strong>
            </li>
            <li>
              <span>Send interest</span>
              <strong>Included</strong>
            </li>
            <li>
              <span>Chat</span>
              <strong>{chatEnabled ? "Enabled" : "Disabled"}</strong>
            </li>
          </ul>
          <div className="dash-mini-links" style={{ marginTop: "1rem" }}>
            <Link href="/profiles">Browse profiles</Link>
            <Link href="/contact">Need help? Contact us</Link>
          </div>
        </div>

        <PricingPlans
          upgradeMode
          currentPlan={user.plan}
          showIntro
          compact
        />
      </section>
    </DashShell>
  );
}
