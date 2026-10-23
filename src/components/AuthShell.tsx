"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { OnboardingLogout } from "@/components/OnboardingLogout";
import { usePathname } from "next/navigation";

export function AuthShell({
  title,
  subtitle,
  children,
  flowHint,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  flowHint?: string;
}) {
  const pathname = usePathname();
  return (
    <main className="auth-page">
      <div className="auth-backdrop" aria-hidden />
      <div className="auth-panel">
        <div className="auth-panel-top">
          <Link href="/" className="brand-mark">
            Bandhan<span>Mil</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            {(pathname === "/onboarding" || pathname === "/preferences") && <OnboardingLogout />}
          </div>
        </div>
        <h1>{title}</h1>
        <p className="lede">{subtitle}</p>
        {flowHint ? <p className="auth-flow-hint">{flowHint}</p> : null}
        {children}
      </div>
    </main>
  );
}
