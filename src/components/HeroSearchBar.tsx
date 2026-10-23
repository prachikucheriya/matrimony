"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MOTHER_TONGUES } from "@/lib/constants";
import { useT } from "@/components/LocaleProvider";

type ReligionOption = { id: string; name: string };

const AGES = Array.from({ length: 43 }, (_, i) => i + 18);

export function HeroSearchBar({ religions }: { religions: ReligionOption[] }) {
  const router = useRouter();
  const t = useT();
  const [lookingFor, setLookingFor] = useState<"BRIDE" | "GROOM">("BRIDE");
  const [ageMin, setAgeMin] = useState("22");
  const [ageMax, setAgeMax] = useState("27");
  const [motherTongue, setMotherTongue] = useState("");
  const [subCaste, setSubCaste] = useState("");

  const ageMaxOptions = useMemo(
    () => AGES.filter((age) => age >= Number(ageMin)),
    [ageMin],
  );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set("gender", lookingFor);
    params.set("ageMin", ageMin);
    params.set("ageMax", String(Math.max(Number(ageMin), Number(ageMax))));
    params.set("religion", "Jain");
    if (subCaste) params.set("subCaste", subCaste);
    if (motherTongue) params.set("motherTongue", motherTongue);

    sessionStorage.setItem(
      "matrimony_hero_search",
      JSON.stringify(Object.fromEntries(params.entries())),
    );

    router.push(`/profiles?${params.toString()}`);
  }

  return (
    <form className="hero-search" onSubmit={onSubmit}>
      <div className="hero-search-field">
        <label htmlFor="looking-for">{t("heroSearch.lookingFor")}</label>
        <select
          id="looking-for"
          value={lookingFor}
          onChange={(e) => setLookingFor(e.target.value as "BRIDE" | "GROOM")}
        >
          <option value="BRIDE">{t("heroSearch.woman")}</option>
          <option value="GROOM">{t("heroSearch.man")}</option>
        </select>
      </div>

      <div className="hero-search-field age-field">
        <span className="hero-search-label">{t("heroSearch.aged")}</span>
        <div className="age-range">
          <select
            aria-label={t("heroSearch.ageMin")}
            value={ageMin}
            onChange={(e) => {
              const nextMin = e.target.value;
              setAgeMin(nextMin);
              if (Number(ageMax) < Number(nextMin)) setAgeMax(nextMin);
            }}
          >
            {AGES.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
          <span>{t("heroSearch.to")}</span>
          <select
            aria-label={t("heroSearch.ageMax")}
            value={ageMax}
            onChange={(e) => setAgeMax(e.target.value)}
          >
            {ageMaxOptions.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hero-search-field">
        <label htmlFor="jain-community">Jain Sub-Caste</label>
        <select id="jain-community" value={subCaste} onChange={(e) => setSubCaste(e.target.value)}>
          <option value="">All Jain Sub-Castes</option>
          <option value="Digambar">Digambar</option>
          <option value="Shwetambar">Shwetambar</option>
          <option value="Murtipujak">Shwetambar Murtipujak</option>
          <option value="Sthanakvasi">Shwetambar Sthanakvasi</option>
          <option value="Terapanthi">Terapanthi</option>
          <option value="Bispanthi">Bispanthi</option>
          <option value="General">Other Jain</option>
        </select>
      </div>

      <div className="hero-search-field">
        <label htmlFor="mother-tongue">{t("heroSearch.motherTongue")}</label>
        <select
          id="mother-tongue"
          value={motherTongue}
          onChange={(e) => setMotherTongue(e.target.value)}
        >
          <option value="">{t("common.select")}</option>
          {MOTHER_TONGUES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="hero-search-btn">
        {t("heroSearch.begin")}
      </button>
    </form>
  );
}
