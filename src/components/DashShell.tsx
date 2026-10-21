"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions/auth";
import {
  IconChats,
  IconDashboard,
  IconInterests,
  IconLogout,
  IconPlan,
  IconProfile,
  IconSettings,
} from "@/components/DashNavIcons";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useT } from "@/components/LocaleProvider";

export type DashNavKey =
  | "dashboard"
  | "profile"
  | "interests"
  | "chats"
  | "plan"
  | "settings";

type DashShellProps = {
  userName: string;
  contact: string;
  photoUrl: string | null;
  active: DashNavKey;
  children: ReactNode;
};

export function DashShell({
  userName,
  contact,
  photoUrl,
  active,
  children,
}: DashShellProps) {
  const t = useT();

  const nav: {
    key: DashNavKey;
    href: string;
    label: string;
    Icon: (props: { className?: string }) => ReactNode;
  }[] = [
    {
      key: "dashboard",
      href: "/home",
      label: t("nav.dashboard"),
      Icon: IconDashboard,
    },
    {
      key: "profile",
      href: "/profile/edit",
      label: t("nav.profile"),
      Icon: IconProfile,
    },
    {
      key: "interests",
      href: "/interests",
      label: t("nav.interests"),
      Icon: IconInterests,
    },
    { key: "chats", href: "/chats", label: t("nav.chats"), Icon: IconChats },
    { key: "plan", href: "/plan", label: t("nav.plan"), Icon: IconPlan },
    {
      key: "settings",
      href: "/settings",
      label: t("nav.settings"),
      Icon: IconSettings,
    },
  ];

  return (
    <div className="user-dashboard interests-layout">
      <aside className="dash-sidebar interests-sidebar">
        <div className="dash-sidebar-top">
          <LanguageSwitcher compact />
        </div>
        <div className="dash-user-card interests-user-card">
          <div className="dash-user-avatar">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={userName} />
            ) : (
              <span>{userName.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div>
            <strong>{userName}</strong>
            <p>{contact}</p>
          </div>
        </div>

        <nav className="dash-nav interests-nav">
          {nav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={item.key === active ? "active" : undefined}
            >
              <item.Icon className="nav-svg" />
              {item.label}
            </Link>
          ))}
          <form action={logoutAction}>
            <button type="submit">
              <IconLogout className="nav-svg" />
              {t("nav.logout")}
            </button>
          </form>
        </nav>
      </aside>

      <div className="dash-main interests-main">{children}</div>

      <nav className="dash-float-nav" aria-label="Quick menu">
        {nav.map((item) => (
          <Link
            key={`float-${item.key}`}
            href={item.href}
            className={item.key === active ? "active" : undefined}
            title={item.label}
          >
            <item.Icon className="nav-svg" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
