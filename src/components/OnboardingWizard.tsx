"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  COMPLEXION_OPTIONS,
  EDUCATION_OPTIONS,
  HEIGHT_OPTIONS,
  INCOME_RANGES,
  INDIAN_STATES,
  MARITAL_STATUS_OPTIONS,
  MOTHER_TONGUES,
  OCCUPATION_OPTIONS,
} from "@/lib/constants";
import { AuthShell } from "@/components/AuthShell";
import { PendingPhotoPicker } from "@/components/PhotoUpload";
import { MicInput } from "@/components/MicInput";
import { useT } from "@/components/LocaleProvider";

type Option = { id: string; name: string };

type MaritalStatus =
  | "NEVER_MARRIED"
  | "DIVORCED"
  | "WIDOWED"
  | "SEPARATED"
  | "MARRIED"
  | "";

type FormState = {
  gender: "BRIDE" | "GROOM" | "";
  displayName: string;
  dob: string;
  motherTongue: string;
  height: string;
  birthPlace: string;
  birthTime: string;
  complexion: string;
  religionId: string;
  casteId: string;
  subCasteId: string;
  education: string;
  occupation: string;
  incomeRange: string;
  city: string;
  state: string;
  address: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  brothersCount: string;
  brothersNames: string;
  sistersCount: string;
  sistersNames: string;
    maritalStatus: MaritalStatus;
  spouseName: string;
  spouseOccupation: string;
  isDifferentlyAbled: boolean;
};

const STEP_KEYS = [
  "lookingFor",
  "identity",
  "community",
  "career",
  "family",
  "finish",
] as const;

const initialState: FormState = {
  gender: "",
  displayName: "",
  dob: "",
  motherTongue: "",
  height: "",
  birthPlace: "",
  birthTime: "",
  complexion: "",
  religionId: "",
  casteId: "",
  subCasteId: "",
  education: "",
  occupation: "",
  incomeRange: "",
  city: "",
  state: "",
  address: "",
  fatherName: "",
  fatherOccupation: "",
  motherName: "",
  motherOccupation: "",
  brothersCount: "0",
  brothersNames: "",
  sistersCount: "0",
  sistersNames: "",
  maritalStatus: "",
  spouseName: "",
  spouseOccupation: "",
  isDifferentlyAbled: false,
};

export function OnboardingWizard({ userId }: { userId: string }) {
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState(0);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const draftKey = `matrimony_onboarding_draft_${userId}`;
  const [form, setForm] = useState<FormState>(initialState);
  const [religions, setReligions] = useState<Option[]>([]);
  const [castes, setCastes] = useState<Option[]>([]);
  const [subCastes, setSubCastes] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/onboarding/draft", { cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error("load failed"); return r.json(); })
      .then(result => {
        if (!active) return;
        const saved = result.draft;
        if (saved?.form) setForm({ ...initialState, ...saved.form });
        if (typeof saved?.step === "number" && saved.step >= 0 && saved.step < STEP_KEYS.length) setStep(saved.step);
      })
      .catch(() => {
        if (!active) return;
        try {
          const raw = localStorage.getItem(draftKey);
          if (raw) {
            const saved = JSON.parse(raw);
            if (saved.form) setForm({ ...initialState, ...saved.form });
            if (typeof saved.step === "number" && saved.step >= 0 && saved.step < STEP_KEYS.length) setStep(saved.step);
          }
        } catch {}
      })
      .finally(() => { if (active) setDraftLoaded(true); });
    return () => { active = false; };
  }, [draftKey]);

  useEffect(() => {
    if (!draftLoaded) return;
    try { localStorage.setItem(draftKey, JSON.stringify({ step, form })); } catch {}
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch("/api/onboarding/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, form }),
        signal: controller.signal,
      }).catch(() => {});
    }, 1200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [draftLoaded, draftKey, step, form]);

  function onPhotoPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  useEffect(() => {
    fetch("/api/masters/religions")
      .then((r) => r.json())
      .then((data) => { const jain=(data.religions ?? []).find((item: Option)=>item.name==="Jain"); setReligions(jain?[jain]:[]); if(jain) setForm(prev=>({...prev,religionId:jain.id})); })
      .catch(() => setError("Could not load religions."));
  }, []);

  useEffect(() => {
    if (!form.religionId) {
      setCastes([]);
      return;
    }
    fetch(`/api/masters/castes?religionId=${form.religionId}`)
      .then((r) => r.json())
      .then((data) => setCastes((data.castes ?? []).filter((item: Option)=>["Jain Shwetambar Sthanakvasi","Jain Shwetambar Murtipujak","Terapanthi","Digambar"].includes(item.name))))
      .catch(() => setError("Could not load castes."));
  }, [form.religionId]);

  useEffect(() => {
    if (!form.casteId) {
      setSubCastes([]);
      return;
    }
    fetch(`/api/masters/sub-castes?casteId=${form.casteId}`)
      .then((r) => r.json())
      .then((data) => { const general=(data.subCastes ?? []).find((item: Option)=>item.name==="General"); setSubCastes(general?[general]:[]); if(general) setForm(prev=>({...prev,subCasteId:general.id})); })
      .catch(() => setError("Could not load sub-castes."));
  }, [form.casteId]);

  const progress = useMemo(
    () => ((step + 1) / STEP_KEYS.length) * 100,
    [step],
  );
  const brothersCount = Number(form.brothersCount || 0);
  const sistersCount = Number(form.sistersCount || 0);
  const needsSpouse = form.maritalStatus === "MARRIED";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "religionId") {
        next.casteId = "";
        next.subCasteId = "";
      }
      if (key === "casteId") {
        next.subCasteId = "";
      }
      if (key === "maritalStatus" && value !== "MARRIED") {
        next.spouseName = "";
        next.spouseOccupation = "";
      }
      if (key === "brothersCount" && Number(value) === 0) {
        next.brothersNames = "";
      }
      if (key === "sistersCount" && Number(value) === 0) {
        next.sistersNames = "";
      }
      return next;
    });
  }

  function validateStep(): string | null {
    if (step === 0 && !form.gender) return t("onboarding.errors.selectGender");
    if (step === 1) {
      if (!form.displayName.trim()) return t("onboarding.errors.fullName");
      if (!form.dob) return t("onboarding.errors.dob");
      if (!form.motherTongue) return t("onboarding.errors.motherTongue");
      if (!form.height) return t("onboarding.errors.height");
      if (!form.birthPlace.trim()) return t("onboarding.errors.birthPlace");
      if (!form.birthTime) return t("onboarding.errors.birthTime");
      if (!form.complexion) return t("onboarding.errors.complexion");
      const age =
        (Date.now() - new Date(form.dob).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) return t("onboarding.errors.age");
    }
    if (step === 2) {
      if (!form.religionId || !form.casteId || !form.subCasteId) {
        return t("onboarding.errors.community");
      }
    }
    if (step === 3) {
      if (
        !form.education ||
        !form.occupation ||
        !form.incomeRange ||
        !form.city.trim() ||
        !form.state ||
        !form.address.trim()
      ) {
        return t("onboarding.errors.career");
      }
    }
    if (step === 4) {
      if (!form.fatherName.trim() || !form.fatherOccupation.trim()) {
        return t("onboarding.errors.father");
      }
      if (!form.motherName.trim() || !form.motherOccupation.trim()) {
        return t("onboarding.errors.mother");
      }
      const bCount = Number(form.brothersCount);
      const sCount = Number(form.sistersCount);
      if (Number.isNaN(bCount) || bCount < 0) {
        return t("onboarding.errors.brothersCount");
      }
      if (bCount > 0 && !form.brothersNames.trim()) {
        return t("onboarding.errors.brothersNames");
      }
      if (Number.isNaN(sCount) || sCount < 0) {
        return t("onboarding.errors.sistersCount");
      }
      if (sCount > 0 && !form.sistersNames.trim()) {
        return t("onboarding.errors.sistersNames");
      }
      if (!form.maritalStatus) return t("onboarding.errors.marital");
      if (
        needsSpouse &&
        (!form.spouseName.trim() || !form.spouseOccupation.trim())
      ) {
        return t("onboarding.errors.spouse");
      }
    }
    return null;
  }

  function next() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEP_KEYS.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (step < STEP_KEYS.length - 1) {
      next();
      return;
    }

    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        brothersCount: Number(form.brothersCount || 0),
        sistersCount: Number(form.sistersCount || 0),
      };
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? t("onboarding.errors.saveFailed"));
        return;
      }

      if (photoFile) {
        const body = new FormData();
        body.append("photo", photoFile);
        const photoRes = await fetch("/api/profile/photo", {
          method: "POST",
          body,
        });
        const photoData = await photoRes.json();
        if (!photoRes.ok) {
          setError(photoData.error ?? "Profile saved, but photo upload failed.");
          return;
        }
      }

      localStorage.removeItem(draftKey);
      router.push(data.redirectTo ?? "/preferences");
      router.refresh();
    } catch {
      setError(t("onboarding.errors.saveProfileError"));
    } finally {
      setLoading(false);
    }
  }

  const stepName = t(`onboarding.steps.${STEP_KEYS[step]}`);

  return (
    <form onSubmit={onSubmit} className="onboarding-form">
      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="step-label">
        {t("onboarding.stepOf", {
          current: step + 1,
          total: STEP_KEYS.length,
          name: stepName,
        })}
      </p>

      {step === 0 && (
        <div className="choice-grid">
          {(["BRIDE", "GROOM"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={`choice-card ${form.gender === value ? "selected" : ""}`}
              onClick={() => update("gender", value)}
            >
              <span className="choice-title">
                {value === "BRIDE" ? t("onboarding.bride") : t("onboarding.groom")}
              </span>
              <span className="choice-sub">
                {value === "BRIDE"
                  ? t("onboarding.brideSub")
                  : t("onboarding.groomSub")}
              </span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="fields">
          <label className="field">
            <span>{t("onboarding.fullName")}</span>
            <MicInput
              value={form.displayName}
              onValueChange={(v) => update("displayName", v)}
              placeholder={t("onboarding.fullNamePh")}
              required
              showHint
            />
          </label>
          <label className="field">
            <span>{t("onboarding.dob")}</span>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => update("dob", e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>{t("onboarding.birthTime")}</span>
            <input
              type="time"
              value={form.birthTime}
              onChange={(e) => update("birthTime", e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>{t("onboarding.birthPlace")}</span>
            <MicInput
              value={form.birthPlace}
              onValueChange={(v) => update("birthPlace", v)}
              placeholder={t("onboarding.birthPlacePh")}
              required
            />
          </label>
          <label className="field">
            <span>{t("onboarding.height")}</span>
            <select
              value={form.height}
              onChange={(e) => update("height", e.target.value)}
              required
            >
              <option value="">{t("common.select")}</option>
              {HEIGHT_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("onboarding.complexion")}</span>
            <select
              value={form.complexion}
              onChange={(e) => update("complexion", e.target.value)}
              required
            >
              <option value="">{t("common.select")}</option>
              {COMPLEXION_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("onboarding.motherTongue")}</span>
            <select
              value={form.motherTongue}
              onChange={(e) => update("motherTongue", e.target.value)}
              required
            >
              <option value="">{t("common.select")}</option>
              {MOTHER_TONGUES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="fields">
          <label className="field">
            <span>Jain Community</span>
            <select value={form.casteId} onChange={(e)=>update("casteId",e.target.value)} required>
              <option value="">Select Jain Community</option>
              {castes.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="fields">
          <label className="field">
            <span>{t("onboarding.education")}</span>
            <select
              value={form.education}
              onChange={(e) => update("education", e.target.value)}
              required
            >
              <option value="">{t("common.select")}</option>
              {EDUCATION_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("onboarding.occupation")}</span>
            <select
              value={form.occupation}
              onChange={(e) => update("occupation", e.target.value)}
              required
            >
              <option value="">{t("common.select")}</option>
              {OCCUPATION_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("onboarding.incomeRange")}</span>
            <select
              value={form.incomeRange}
              onChange={(e) => update("incomeRange", e.target.value)}
              required
            >
              <option value="">{t("common.select")}</option>
              {INCOME_RANGES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("onboarding.city")}</span>
            <MicInput
              value={form.city}
              onValueChange={(v) => update("city", v)}
              placeholder={t("onboarding.cityPh")}
              required
            />
          </label>
          <label className="field">
            <span>{t("onboarding.state")}</span>
            <select
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              required
            >
              <option value="">{t("common.select")}</option>
              {INDIAN_STATES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t("onboarding.address")}</span>
            <MicInput
              multiline
              rows={3}
              value={form.address}
              onValueChange={(v) => update("address", v)}
              placeholder={t("onboarding.addressPh")}
              required
              showHint
            />
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="fields">
          <label className="field">
            <span>{t("onboarding.fatherName")}</span>
            <MicInput
              value={form.fatherName}
              onValueChange={(v) => update("fatherName", v)}
              required
            />
          </label>
          <label className="field">
            <span>{t("onboarding.fatherOccupation")}</span>
            <MicInput
              value={form.fatherOccupation}
              onValueChange={(v) => update("fatherOccupation", v)}
              required
            />
          </label>
          <label className="field">
            <span>{t("onboarding.motherName")}</span>
            <MicInput
              value={form.motherName}
              onValueChange={(v) => update("motherName", v)}
              required
            />
          </label>
          <label className="field">
            <span>{t("onboarding.motherOccupation")}</span>
            <MicInput
              value={form.motherOccupation}
              onValueChange={(v) => update("motherOccupation", v)}
              required
            />
          </label>
          <label className="field">
            <span>{t("onboarding.brothersCount")}</span>
            <input
              type="number"
              min={0}
              max={20}
              value={form.brothersCount}
              onChange={(e) => update("brothersCount", e.target.value)}
              required
            />
          </label>
          {brothersCount > 0 ? (
            <label className="field">
              <span>{t("onboarding.brothersNames")}</span>
              <MicInput
                value={form.brothersNames}
                onValueChange={(v) => update("brothersNames", v)}
                required
              />
            </label>
          ) : null}
          <label className="field">
            <span>{t("onboarding.sistersCount")}</span>
            <input
              type="number"
              min={0}
              max={20}
              value={form.sistersCount}
              onChange={(e) => update("sistersCount", e.target.value)}
              required
            />
          </label>
          {sistersCount > 0 ? (
            <label className="field">
              <span>{t("onboarding.sistersNames")}</span>
              <MicInput
                value={form.sistersNames}
                onValueChange={(v) => update("sistersNames", v)}
                required
              />
            </label>
          ) : null}
          <label className="field">
            <span>{t("onboarding.maritalStatus")}</span>
            <select
              value={form.maritalStatus}
              onChange={(e) =>
                update("maritalStatus", e.target.value as MaritalStatus)
              }
              required
            >
              <option value="">{t("common.select")}</option>
              {MARITAL_STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {needsSpouse ? (
            <>
              <label className="field">
                <span>{t("onboarding.spouseName")}</span>
                <MicInput
                  value={form.spouseName}
                  onValueChange={(v) => update("spouseName", v)}
                  required
                />
              </label>
              <label className="field">
                <span>{t("onboarding.spouseOccupation")}</span>
                <MicInput
                  value={form.spouseOccupation}
                  onValueChange={(v) => update("spouseOccupation", v)}
                  required
                />
              </label>
            </>
          ) : null}
          <fieldset className="partner-caste-box">
            <legend>Special category</legend>
            <label
              className={`settings-radio ${form.isDifferentlyAbled ? "selected" : ""}`}
            >
              <input
                type="checkbox"
                checked={form.isDifferentlyAbled}
                onChange={(e) => update("isDifferentlyAbled", e.target.checked)}
              />
              <span>
                Differently abled / Handicap
                <small style={{ display: "block", fontWeight: 400, opacity: 0.8 }}>
                  Tick if this applies to your profile (shown in Handicap category)
                </small>
              </span>
            </label>
            <p className="muted" style={{ marginBottom: 0 }}>
              Your marital status sets Fresh / Divorcee / Widow group automatically.
            </p>
          </fieldset>
        </div>
      )}

      {step === 5 && (
        <div className="finish-panel">
          <h2>{t("onboarding.steps.finish")}</h2>
          <p>{t("onboarding.finishHint")}</p>
          <PendingPhotoPicker preview={photoPreview} onPick={onPhotoPick} />
          <ul className="summary-list">
            <li>
              <strong>{t("onboarding.fullName")}:</strong>{" "}
              {form.displayName || "—"}
            </li>
            <li>
              <strong>{t("onboarding.city")}:</strong>{" "}
              {[form.city, form.state].filter(Boolean).join(", ") || "—"}
            </li>
          </ul>
        </div>
      )}

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <div className="wizard-actions">
        {step > 0 ? (
          <button type="button" className="btn-ghost" onClick={back}>
            {t("common.back")}
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {step === STEP_KEYS.length - 1
            ? loading
              ? t("onboarding.saving")
              : t("onboarding.saveContinue")
            : t("common.continue")}
        </button>
      </div>
    </form>
  );
}

export function OnboardingPageClient({ userId }: { userId: string }) {
  const t = useT();
  return (
    <AuthShell title={t("onboarding.title")} subtitle={t("onboarding.subtitle")}>
      <OnboardingWizard userId={userId} />
    </AuthShell>
  );
}
