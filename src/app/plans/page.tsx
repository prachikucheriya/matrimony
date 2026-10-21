"use client";

import { PricingPlans } from "@/components/PricingPlans";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useT } from "@/components/LocaleProvider";

export default function PlansPage() {
  const t = useT();

  return (
    <main className="plans-page">
      <section className="plans-banner">
        <div className="plans-banner-media" aria-hidden />
        <div className="plans-banner-overlay" />
        <div className="plans-banner-inner">
          <SiteHeader active="plans" light />
          <div className="plans-banner-title">
            <p>{t("pricing.eyebrow")}</p>
            <h1>
              {t("pricing.title")}
              <span>{t("pricing.titleSpan")}</span>
            </h1>
            <p className="plans-banner-sub">{t("pricing.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="plans-body">
        <p className="plans-assurance">{t("pricing.noCard")}</p>
        <PricingPlans ctaHref="/register" showIntro={false} />
      </section>

      <SiteFooter />
    </main>
  );
}
