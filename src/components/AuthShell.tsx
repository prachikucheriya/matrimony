"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
  return (
    <main className="auth-page">
      <div className="auth-backdrop" aria-hidden />
      <div className="auth-panel">
        <div className="auth-panel-top">
          <Link href="/" className="brand-mark">
            Bandhan<span>Mil</span>
          </Link>
          <LanguageSwitcher compact />
        </div>
        <h1>{title}</h1>
        <p className="lede">{subtitle}</p>
        {flowHint ? <p className="auth-flow-hint">{flowHint}</p> : null}
        {children}
      </div>
    </main>
  );
}
