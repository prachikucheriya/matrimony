"use client";

import { INCOME_RANGES } from "@/lib/constants";
import {
  PROFILE_CATEGORY_OPTIONS,
  type ProfileCategory,
} from "@/lib/categories";

type Option = { id: string; name: string };

export type PartnerPrefState = {
  prefAgeMin: string;
  prefAgeMax: string;
  prefAnyCaste: boolean;
  prefCasteIds: string[];
  prefWorkType: "JOB" | "BUSINESS" | "HOMEMAKER" | "";
  prefIncomeRange: string;
  prefKundali: "COMPULSORY" | "OPTIONAL" | "";
  prefCategories: ProfileCategory[];
};

type Props = {
  gender: "BRIDE" | "GROOM" | "";
  castes: Option[];
  value: PartnerPrefState;
  onChange: <K extends keyof PartnerPrefState>(
    key: K,
    next: PartnerPrefState[K],
  ) => void;
};

export function PartnerPreferenceFields({
  gender,
  castes,
  value,
  onChange,
}: Props) {
  const searchingFor =
    gender === "BRIDE" ? "GROOM" : gender === "GROOM" ? "BRIDE" : null;
  const needsIncome =
    searchingFor === "GROOM" ||
    (searchingFor === "BRIDE" &&
      (value.prefWorkType === "JOB" || value.prefWorkType === "BUSINESS"));

  function toggleCaste(id: string) {
    const exists = value.prefCasteIds.includes(id);
    onChange(
      "prefCasteIds",
      exists
        ? value.prefCasteIds.filter((item) => item !== id)
        : [...value.prefCasteIds, id],
    );
  }

  function toggleCategory(cat: ProfileCategory) {
    const exists = value.prefCategories.includes(cat);
    onChange(
      "prefCategories",
      exists
        ? value.prefCategories.filter((item) => item !== cat)
        : [...value.prefCategories, cat],
    );
  }

  return (
    <div className="fields partner-pref-fields">
      <p className="lede" style={{ marginTop: 0 }}>
        Tell us your partner requirements. Profiles will show based on the
        categories you select (Fresh, Divorcee, Widow, Differently abled).
      </p>

      <fieldset className="partner-caste-box">
        <legend>Partner category</legend>
        <p className="muted" style={{ marginTop: 0 }}>
          Select one or more. Matching profiles from these groups will be shown.
        </p>
        <div className="partner-caste-list">
          {PROFILE_CATEGORY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`settings-radio ${value.prefCategories.includes(opt.value) ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={value.prefCategories.includes(opt.value)}
                onChange={() => toggleCategory(opt.value)}
              />
              <span>
                {opt.label}
                <small style={{ display: "block", fontWeight: 400, opacity: 0.8 }}>
                  {opt.hint}
                </small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="edit-grid">
        <label className="field">
          <span>Partner age from</span>
          <input
            type="number"
            min={18}
            max={80}
            value={value.prefAgeMin}
            onChange={(e) => onChange("prefAgeMin", e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Partner age to</span>
          <input
            type="number"
            min={18}
            max={80}
            value={value.prefAgeMax}
            onChange={(e) => onChange("prefAgeMax", e.target.value)}
            required
          />
        </label>
      </div>

      <fieldset className="partner-caste-box">
        <legend>Caste preference</legend>
        <div className="partner-caste-list">
          <label
            className={`settings-radio partner-any-caste ${value.prefAnyCaste ? "selected" : ""}`}
          >
            <input
              type="checkbox"
              checked={value.prefAnyCaste}
              onChange={(e) => {
                onChange("prefAnyCaste", e.target.checked);
                if (e.target.checked) onChange("prefCasteIds", []);
              }}
            />
            <span>Any caste</span>
          </label>

          {!value.prefAnyCaste ? (
            castes.length === 0 ? (
              <p className="muted partner-caste-loading">Loading castes…</p>
            ) : (
              castes.map((caste) => (
                <label key={caste.id} className="settings-radio">
                  <input
                    type="checkbox"
                    checked={value.prefCasteIds.includes(caste.id)}
                    onChange={() => toggleCaste(caste.id)}
                  />
                  <span>{caste.name}</span>
                </label>
              ))
            )
          ) : (
            <p className="muted partner-caste-note">
              Any caste selected — all castes are welcome.
            </p>
          )}
        </div>
      </fieldset>

      {searchingFor === "BRIDE" ? (
        <label className="field">
          <span>Partner work preference</span>
          <select
            value={value.prefWorkType}
            onChange={(e) => {
              const next = e.target.value as PartnerPrefState["prefWorkType"];
              onChange("prefWorkType", next);
              if (next === "HOMEMAKER") onChange("prefIncomeRange", "");
            }}
            required
          >
            <option value="">Select</option>
            <option value="JOB">Job</option>
            <option value="BUSINESS">Business</option>
            <option value="HOMEMAKER">Homemaker</option>
          </select>
        </label>
      ) : null}

      {searchingFor === "GROOM" ? (
        <label className="field">
          <span>Partner work preference</span>
          <select
            value={value.prefWorkType}
            onChange={(e) =>
              onChange(
                "prefWorkType",
                e.target.value as PartnerPrefState["prefWorkType"],
              )
            }
            required
          >
            <option value="">Select</option>
            <option value="JOB">Job</option>
            <option value="BUSINESS">Business</option>
          </select>
        </label>
      ) : null}

      {needsIncome ? (
        <label className="field">
          <span>Partner income range</span>
          <select
            value={value.prefIncomeRange}
            onChange={(e) => onChange("prefIncomeRange", e.target.value)}
            required
          >
            <option value="">Select</option>
            {INCOME_RANGES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="field">
        <span>Kundali match</span>
        <select
          value={value.prefKundali}
          onChange={(e) =>
            onChange(
              "prefKundali",
              e.target.value as PartnerPrefState["prefKundali"],
            )
          }
          required
        >
          <option value="">Select</option>
          <option value="COMPULSORY">Compulsory</option>
          <option value="OPTIONAL">Optional</option>
        </select>
      </label>
    </div>
  );
}
