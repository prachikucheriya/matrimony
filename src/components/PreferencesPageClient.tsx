"use client";

import type { ReactNode } from "react";
import { AuthShell } from "@/components/AuthShell";
import { useT } from "@/components/LocaleProvider";

export function PreferencesPageClient({
  alreadySaved,
  children,
}: {
  alreadySaved: boolean;
  children: ReactNode;
}) {
  const t = useT();
  return (
    <AuthShell
      title={alreadySaved ? t("preferences.editTitle") : t("preferences.title")}
      subtitle={
        alreadySaved ? t("preferences.editSubtitle") : t("preferences.subtitle")
      }
    >
      {children}
    </AuthShell>
  );
}
