"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/LocaleProvider";

const PLAN_META = [
  {
    id: "FREE",
    nameKey: "pricing.freeName",
    blurbKey: "pricing.freeBlurb",
    price: "₹0",
    period: "/mo",
    featured: false,
    features: [
      "Browse free user profiles",
      "Send interest requests",
      "Mobile number & address hidden",
      "Chat disabled",
      "Upgrade anytime for full access",
    ],
  },
  {
    id: "GOLD",
    nameKey: "pricing.goldName",
    blurbKey: "pricing.goldBlurb",
    price: "₹349",
    period: "/mo",
    featured: true,
    features: [
      "20 Premium profiles view /mo",
      "Browse free user profiles",
      "View mobile number & address",
      "Send unlimited interests",
      "Priority chat access",
    ],
  },
  {
    id: "PLATINUM",
    nameKey: "pricing.platinumName",
    blurbKey: "pricing.platinumBlurb",
    price: "₹549",
    period: "/mo",
    featured: false,
    features: [
      "50 Premium profiles view /mo",
      "Browse free user profiles",
      "View mobile number & address",
      "Send unlimited interests",
      "Priority support & chat",
    ],
  },
] as const;

type PricingPlansProps = {
  ctaHref?: string;
  showIntro?: boolean;
  compact?: boolean;
  upgradeMode?: boolean;
  currentPlan?: string;
};

export function PricingPlans({
  ctaHref = "/register",
  showIntro = true,
  compact = false,
  upgradeMode = false,
  currentPlan,
}: PricingPlansProps) {
  const router = useRouter();
  const t = useT();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function selectPlan(planId: string) {
    if (!upgradeMode) return;
    setBusyPlan(planId);
    setError(null);
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? t("common.somethingWrong"));
        return;
      }
      router.refresh();
      router.push(data.redirectTo ?? "/plan");
    } catch {
      setError(t("common.somethingWrong"));
    } finally {
      setBusyPlan(null);
    }
  }

  return (
    <section className={`pricing-section ${compact ? "compact" : ""}`}>
      {showIntro ? (
        <div className="pricing-intro">
          <p className="pricing-kicker">{t("pricing.eyebrow")}</p>
          <h2>
            {t("pricing.title")}
            <span>{t("pricing.titleSpan")}</span>
          </h2>
          <p>{t("pricing.subtitle")}</p>
          <p className="pricing-note">{t("pricing.noCard")}</p>
        </div>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <div className="pricing-grid">
        {PLAN_META.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
            <article
              key={plan.id}
              className={`pricing-card ${plan.featured ? "featured" : ""}`}
            >
              {plan.featured ? (
                <span className="pricing-badge">{t("pricing.mostPopular")}</span>
              ) : (
                <span className="pricing-badge ghost" aria-hidden>
                  &nbsp;
                </span>
              )}

              <div className="pricing-card-body">
                <h3>{t(plan.nameKey)}</h3>
                <p className="pricing-blurb">{t(plan.blurbKey)}</p>

                <div className="pricing-amount">
                  <strong>{plan.price}</strong>
                  <span>{plan.period}</span>
                </div>

                {upgradeMode ? (
                  <button
                    type="button"
                    className="pricing-cta"
                    disabled={isCurrent || busyPlan === plan.id}
                    onClick={() => selectPlan(plan.id)}
                  >
                    {isCurrent
                      ? t("pricing.currentPlan")
                      : busyPlan === plan.id
                        ? t("pricing.saving")
                        : plan.id === "FREE"
                          ? t("pricing.switchFree")
                          : t("pricing.getStarted")}
                  </button>
                ) : (
                  <Link href={ctaHref} className="pricing-cta">
                    {t("pricing.getStarted")}
                  </Link>
                )}

                <ul className="pricing-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
