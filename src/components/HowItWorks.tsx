"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useT } from "@/components/LocaleProvider";

type StepIconType =
  | "register"
  | "match"
  | "interest"
  | "profile"
  | "meetup"
  | "marriage";

function IconShell({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const disc = `hiw-disc-${id}`;
  const ring = `hiw-ring-${id}`;
  return (
    <svg viewBox="0 0 72 72" fill="none" aria-hidden>
      <defs>
        <linearGradient id={disc} x1="18" y1="10" x2="56" y2="64">
          <stop offset="0%" stopColor="#fff8ef" />
          <stop offset="100%" stopColor="#f3e2cf" />
        </linearGradient>
        <linearGradient id={ring} x1="12" y1="12" x2="60" y2="60">
          <stop offset="0%" stopColor="#d8b56a" />
          <stop offset="100%" stopColor="#9b3d4a" />
        </linearGradient>
      </defs>
      <circle cx="36" cy="36" r="30" fill={`url(#${disc})`} />
      <circle
        cx="36"
        cy="36"
        r="30"
        stroke={`url(#${ring})`}
        strokeWidth="2.2"
        opacity="0.85"
      />
      <circle cx="36" cy="36" r="24.5" stroke="#e8d2b4" strokeWidth="1" />
      {children}
    </svg>
  );
}

function StepIcon({ type }: { type: StepIconType }) {
  switch (type) {
    case "register":
      return (
        <IconShell id="register">
          <circle cx="36" cy="28" r="7" stroke="#9b3d4a" strokeWidth="2.4" />
          <path
            d="M24.5 47.5c1.8-7.2 6.6-10.8 11.5-10.8s9.7 3.6 11.5 10.8"
            stroke="#9b3d4a"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="49" cy="24" r="7.5" fill="#c4a35a" />
          <path
            d="M49 20.8v6.4M45.8 24h6.4"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </IconShell>
      );
    case "match":
      return (
        <IconShell id="match">
          <circle cx="31" cy="31" r="9.5" stroke="#9b3d4a" strokeWidth="2.6" />
          <path
            d="M38 38.5l8.8 8.8"
            stroke="#9b3d4a"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M31 26.2c-1.8-2.2-5-2.1-6.5-.2-1.4 1.8-.8 4.3 1.2 5.6L31 35.2l5.3-3.6c2-1.3 2.6-3.8 1.2-5.6-1.5-1.9-4.7-2-6.5.2z"
            fill="#c4a35a"
          />
        </IconShell>
      );
    case "interest":
      return (
        <IconShell id="interest">
          <path
            d="M22 34.5c0-5.4 4-8.8 8.5-8.8 2.2 0 4.1 1 5.5 2.5 1.4-1.5 3.3-2.5 5.5-2.5 4.5 0 8.5 3.4 8.5 8.8 0 7.2-9.4 14-14 17.2-4.6-3.2-14-10-14-17.2z"
            fill="#9b3d4a"
          />
          <path
            d="M42.5 22.5l12.5 4.2-12.5 4.2-1.8-8.4z"
            fill="#c4a35a"
          />
          <path
            d="M44.2 26.7h8.2"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </IconShell>
      );
    case "profile":
      return (
        <IconShell id="profile">
          <rect
            x="21"
            y="18"
            width="30"
            height="36"
            rx="5"
            stroke="#9b3d4a"
            strokeWidth="2.4"
          />
          <rect x="25" y="22" width="22" height="10" rx="2.5" fill="#f7e7d4" />
          <circle cx="36" cy="27" r="3.4" fill="#c4a35a" />
          <path
            d="M30.5 33.5c1.1-2.2 3-3.2 5.5-3.2s4.4 1 5.5 3.2"
            stroke="#9b3d4a"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M26 40h20M26 45.5h14"
            stroke="#c4a35a"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </IconShell>
      );
    case "meetup":
      return (
        <IconShell id="meetup">
          <path
            d="M18.5 28.5c0-4.2 3.3-7.5 7.5-7.5h8c4.2 0 7.5 3.3 7.5 7.5v8.2c0 4.2-3.3 7.5-7.5 7.5H30l-5.8 4.6v-4.6h-1.2c-4.2 0-7.5-3.3-7.5-7.5v-8.2z"
            fill="#9b3d4a"
          />
          <path
            d="M33 34.8c0-3.5 2.8-6.3 6.3-6.3h6.4c3.5 0 6.3 2.8 6.3 6.3v6.5c0 3.5-2.8 6.3-6.3 6.3h-.8l-4.5 3.5v-3.5h-1.1c-3.5 0-6.3-2.8-6.3-6.3v-6.5z"
            fill="#c4a35a"
          />
          <circle cx="27" cy="29.5" r="1.7" fill="#fff" />
          <circle cx="33.2" cy="29.5" r="1.7" fill="#fff" />
          <circle cx="42.5" cy="36.2" r="1.5" fill="#fff" />
        </IconShell>
      );
    default:
      return (
        <IconShell id="marriage">
          <circle cx="28" cy="38" r="8.5" stroke="#c4a35a" strokeWidth="2.6" />
          <circle cx="44" cy="38" r="8.5" stroke="#9b3d4a" strokeWidth="2.6" />
          <path
            d="M28 29.5V24.8M44 29.5V24.8"
            stroke="#9b3d4a"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M36 18.5l1.6 3.4h3.7l-3 2.4 1.1 3.6L36 25.6l-3.4 2.3 1.1-3.6-3-2.4h3.7z"
            fill="#c4a35a"
          />
          <path
            d="M32.5 38.5c.8 2.4 2.2 3.8 3.5 3.8s2.7-1.4 3.5-3.8"
            stroke="#5c4a3d"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </IconShell>
      );
  }
}

export function HowItWorks() {
  const t = useT();
  const steps: { icon: StepIconType; title: string; label: string; description: string }[] = [
    {
      icon: "register",
      title: t("howItWorks.s1Title"),
      label: t("howItWorks.s1Label"),
      description: t("howItWorks.s1Desc"),
    },
    {
      icon: "match",
      title: t("howItWorks.s2Title"),
      label: t("howItWorks.s2Label"),
      description: t("howItWorks.s2Desc"),
    },
    {
      icon: "interest",
      title: t("howItWorks.s3Title"),
      label: t("howItWorks.s3Label"),
      description: t("howItWorks.s3Desc"),
    },
    {
      icon: "profile",
      title: t("howItWorks.s4Title"),
      label: t("howItWorks.s4Label"),
      description: t("howItWorks.s4Desc"),
    },
    {
      icon: "meetup",
      title: t("howItWorks.s5Title"),
      label: t("howItWorks.s5Label"),
      description: t("howItWorks.s5Desc"),
    },
    {
      icon: "marriage",
      title: t("howItWorks.s6Title"),
      label: t("howItWorks.s6Label"),
      description: t("howItWorks.s6Desc"),
    },
  ];

  return (
    <section className="how-works">
      <div className="how-works-header">
        <p className="how-works-kicker">{t("howItWorks.title")}</p>
        <h2>{t("howItWorks.title")}</h2>
        <p className="how-works-lede">{t("howItWorks.subtitle")}</p>
      </div>

      <div className="how-works-timeline">
        <div className="how-works-line" aria-hidden />

        {steps.map((step, index) => {
          const side = index % 2 === 0 ? "left" : "right";
          return (
            <article key={step.icon} className={`how-works-item ${side}`}>
              <div className="how-works-icon">
                <StepIcon type={step.icon} />
              </div>

              <div className="how-works-dot" aria-hidden />

              <div className="how-works-copy">
                <h3>{step.title}</h3>
                <p className="how-works-label">{step.label}</p>
                <p>{step.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="how-works-cta">
        <Link href="/register" className="btn-primary">
          {t("howItWorks.start")}
        </Link>
      </div>
    </section>
  );
}
