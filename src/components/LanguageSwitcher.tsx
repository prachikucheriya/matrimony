"use client";

import { useLocale } from "@/components/LocaleProvider";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/types";

type LanguageSwitcherProps = {
  light?: boolean;
  compact?: boolean;
};

export function LanguageSwitcher({
  light = false,
  compact = false,
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();

  return (
    <label
      className={`lang-switcher ${light ? "light" : ""} ${compact ? "compact" : ""}`}
    >
      <span className="visually-hidden">{t("nav.language")}</span>
      <select
        aria-label={t("nav.language")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
