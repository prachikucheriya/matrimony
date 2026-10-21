"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useT } from "@/components/LocaleProvider";

type SiteHeaderProps = {
  active?: "home" | "plans" | "contact" | "login" | "register";
  light?: boolean;
};

export function SiteHeader({ active, light = false }: SiteHeaderProps) {
  const t = useT();

  return (
    <header className={`site-header ${light ? "light" : ""}`}>
      <Link href="/" className={`brand-mark ${light ? "light" : ""}`}>
        Bandhan<span>Mil</span>
      </Link>
      <nav className="site-nav">
        <Link href="/" className={active === "home" ? "active" : undefined}>
          {t("nav.home")}
        </Link>
        <Link href="/plans" className={active === "plans" ? "active" : undefined}>
          {t("nav.plan")}
        </Link>
        <Link
          href="/contact"
          className={active === "contact" ? "active" : undefined}
        >
          {t("nav.contact")}
        </Link>
        <LanguageSwitcher light={light} compact />
        <Link
          href="/login"
          className={`btn-ghost ${light ? "light" : ""} ${active === "login" ? "active" : ""}`}
        >
          {t("nav.login")}
        </Link>
        <Link
          href="/register"
          className={`btn-secondary ${light ? "light" : ""}`}
        >
          {t("nav.register")}
        </Link>
      </nav>
    </header>
  );
}
