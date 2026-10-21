"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { WelcomeVoice } from "@/components/WelcomeVoice";
import { useT } from "@/components/LocaleProvider";
import { logoutAction } from "@/app/actions/auth";
import { HeroSearchBar } from "@/components/HeroSearchBar";

type ReligionOption = { id: string; name: string };

export function LandingHero({
  isLoggedIn,
  religions,
}: {
  isLoggedIn: boolean;
  religions: ReligionOption[];
}) {
  const t = useT();

  return (
    <section className="landing-hero">
      <div className="landing-hero-media" aria-hidden />
      <div className="landing-hero-overlay" />

      <header className="landing-hero-top">
        <Link href="/" className="brand-mark light">
          Bandhan<span>Mil</span>
        </Link>
        <nav className="landing-hero-links">
          <LanguageSwitcher light compact />
          <Link href="/plans" className="landing-nav-link">
            {t("nav.plan")}
          </Link>
          <Link href="/contact" className="landing-nav-link">
            {t("nav.contact")}
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/home" className="btn-ghost light">
                {t("nav.dashboard")}
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="btn-secondary light">
                  {t("nav.logout")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost light">
                {t("nav.login")}
              </Link>
              <Link href="/register" className="btn-secondary light">
                {t("nav.register")}
              </Link>
            </>
          )}
        </nav>
      </header>

      <WelcomeVoice />

      <div className="landing-hero-center">
        <h1>{t("landing.heroTitle")}</h1>
        <p>{t("landing.heroSub")}</p>
        <HeroSearchBar religions={religions} />
      </div>
    </section>
  );
}
