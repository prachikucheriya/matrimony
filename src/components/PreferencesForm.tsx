"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PartnerPreferenceFields,
  type PartnerPrefState,
} from "@/components/PartnerPreferenceFields";

type Option = { id: string; name: string };

export function PreferencesForm({
  gender,
  initial,
}: {
  gender: "BRIDE" | "GROOM";
  religionId?: string | null;
  initial?: Partial<PartnerPrefState> | null;
}) {
  const router = useRouter();
  const [castes, setCastes] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PartnerPrefState>({
    prefAgeMin: initial?.prefAgeMin ?? "21",
    prefAgeMax: initial?.prefAgeMax ?? "35",
    prefAnyCaste: initial?.prefAnyCaste ?? false,
    prefCasteIds: initial?.prefCasteIds ?? [],
    prefWorkType: initial?.prefWorkType ?? "",
    prefIncomeRange: initial?.prefIncomeRange ?? "",
    prefKundali: initial?.prefKundali ?? "",
    prefCategories: initial?.prefCategories ?? ["FRESH"],
  });

  useEffect(() => {
    // Partner preference shows the same master caste list used in personal forms.
    fetch("/api/masters/castes")
      .then((r) => r.json())
      .then((data) => setCastes(data.castes ?? []))
      .catch(() => setError("Could not load castes."));
  }, []);

  function onChange<K extends keyof PartnerPrefState>(
    key: K,
    next: PartnerPrefState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: next }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          prefAgeMin: Number(form.prefAgeMin),
          prefAgeMax: Number(form.prefAgeMax),
          prefCasteIds: form.prefAnyCaste ? [] : form.prefCasteIds,
          prefWorkType: form.prefWorkType || null,
          prefCategories: form.prefCategories,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not save requirements.");
        return;
      }
      router.push(data.redirectTo ?? "/home");
      router.refresh();
    } catch {
      setError("Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="onboarding-form" onSubmit={onSubmit}>
      <PartnerPreferenceFields
        gender={gender}
        castes={castes}
        value={form}
        onChange={onChange}
      />
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Saving…" : "Save & see suggestions"}
      </button>
    </form>
  );
}
