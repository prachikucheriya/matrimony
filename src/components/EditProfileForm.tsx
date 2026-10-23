"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { PhotoUpload } from "@/components/PhotoUpload";
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

type ProfileForm = {
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

type InitialProfile = {
  gender?: string | null;
  displayName?: string | null;
  dob?: string | Date | null;
  motherTongue?: string | null;
  height?: string | null;
  birthPlace?: string | null;
  birthTime?: string | null;
  complexion?: string | null;
  religionId?: string | null;
  casteId?: string | null;
  subCasteId?: string | null;
  education?: string | null;
  occupation?: string | null;
  incomeRange?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  fatherName?: string | null;
  fatherOccupation?: string | null;
  motherName?: string | null;
  motherOccupation?: string | null;
  brothersCount?: number | null;
  brothersNames?: string | null;
  sistersCount?: number | null;
  sistersNames?: string | null;
  maritalStatus?: string | null;
  spouseName?: string | null;
  spouseOccupation?: string | null;
  isDifferentlyAbled?: boolean | null;
  photoUrl?: string | null;
};

function toDateInput(value?: string | Date | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function EditProfileForm({ initial }: { initial: InitialProfile }) {
  const router = useRouter();
  const t = useT();
  const [form, setForm] = useState<ProfileForm>({
    gender: (initial.gender as ProfileForm["gender"]) || "",
    displayName: initial.displayName || "",
    dob: toDateInput(initial.dob),
    motherTongue: initial.motherTongue || "",
    height: initial.height || "",
    birthPlace: initial.birthPlace || "",
    birthTime: initial.birthTime || "",
    complexion: initial.complexion || "",
    religionId: initial.religionId || "",
    casteId: initial.casteId || "",
    subCasteId: initial.subCasteId || "",
    education: initial.education || "",
    occupation: initial.occupation || "",
    incomeRange: initial.incomeRange || "",
    city: initial.city || "",
    state: initial.state || "",
    address: initial.address || "",
    fatherName: initial.fatherName || "",
    fatherOccupation: initial.fatherOccupation || "",
    motherName: initial.motherName || "",
    motherOccupation: initial.motherOccupation || "",
    brothersCount: String(initial.brothersCount ?? 0),
    brothersNames: initial.brothersNames || "",
    sistersCount: String(initial.sistersCount ?? 0),
    sistersNames: initial.sistersNames || "",
    maritalStatus: (initial.maritalStatus as MaritalStatus) || "",
    spouseName: initial.spouseName || "",
    spouseOccupation: initial.spouseOccupation || "",
    isDifferentlyAbled: Boolean(initial.isDifferentlyAbled),
  });
  const [religions, setReligions] = useState<Option[]>([]);
  const [castes, setCastes] = useState<Option[]>([]);
  const [subCastes, setSubCastes] = useState<Option[]>([]);
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const brothersCount = Number(form.brothersCount || 0);
  const sistersCount = Number(form.sistersCount || 0);
  const needsSpouse = form.maritalStatus === "MARRIED";

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
      .then((data) => setCastes(data.castes ?? []))
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

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "religionId") {
        next.casteId = "";
        next.subCasteId = "";
      }
      if (key === "casteId") next.subCasteId = "";
      if (key === "maritalStatus" && value !== "MARRIED") {
        next.spouseName = "";
        next.spouseOccupation = "";
      }
      if (key === "brothersCount" && Number(value) === 0) next.brothersNames = "";
      if (key === "sistersCount" && Number(value) === 0) next.sistersNames = "";
      return next;
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          brothersCount: Number(form.brothersCount || 0),
          sistersCount: Number(form.sistersCount || 0),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update profile");
        return;
      }
      setSuccess("Profile updated successfully.");
      router.refresh();
    } catch {
      setError("Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="edit-profile-form" onSubmit={onSubmit}>
      <section className="edit-section">
        <h2>Profile photo</h2>
        <PhotoUpload currentUrl={photoUrl} onUploaded={setPhotoUrl} />
      </section>

      <section className="edit-section">
        <h2>Personal details</h2>
        <div className="edit-grid">
          <label className="field">
            <span>Profile type</span>
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value as ProfileForm["gender"])}
              required
            >
              <option value="">Select</option>
              <option value="BRIDE">Bride</option>
              <option value="GROOM">Groom</option>
            </select>
          </label>
          <label className="field">
            <span>{t("onboarding.fullName")}</span>
            <MicInput
              value={form.displayName}
              onValueChange={(v) => update("displayName", v)}
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
              required
            />
          </label>
          <label className="field">
            <span>Height</span>
            <select
              value={form.height}
              onChange={(e) => update("height", e.target.value)}
              required
            >
              <option value="">Select</option>
              {HEIGHT_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Color / complexion</span>
            <select
              value={form.complexion}
              onChange={(e) => update("complexion", e.target.value)}
              required
            >
              <option value="">Select</option>
              {COMPLEXION_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Mother tongue</span>
            <select
              value={form.motherTongue}
              onChange={(e) => update("motherTongue", e.target.value)}
              required
            >
              <option value="">Select</option>
              {MOTHER_TONGUES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="edit-section">
        <h2>Community</h2>
        <div className="edit-grid">
          <label className="field">
            <span>Jain Community</span>
            <select value={form.casteId} onChange={(e)=>update("casteId",e.target.value)} required>
              <option value="">Select Jain Community</option>
              {castes.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="edit-section">
        <h2>Career & address</h2>
        <div className="edit-grid">
          <label className="field">
            <span>Education</span>
            <select
              value={form.education}
              onChange={(e) => update("education", e.target.value)}
              required
            >
              <option value="">Select</option>
              {EDUCATION_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Occupation</span>
            <select
              value={form.occupation}
              onChange={(e) => update("occupation", e.target.value)}
              required
            >
              <option value="">Select</option>
              {OCCUPATION_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Income range</span>
            <select
              value={form.incomeRange}
              onChange={(e) => update("incomeRange", e.target.value)}
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
          <label className="field">
            <span>{t("onboarding.city")}</span>
            <MicInput
              value={form.city}
              onValueChange={(v) => update("city", v)}
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
              <option value="">Select</option>
              {INDIAN_STATES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="field edit-span-2">
            <span>{t("onboarding.address")}</span>
            <MicInput
              multiline
              value={form.address}
              onValueChange={(v) => update("address", v)}
              rows={3}
              required
              showHint
            />
          </label>
        </div>
      </section>

      <section className="edit-section">
        <h2>Family details</h2>
        <div className="edit-grid">
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
              <option value="">Select</option>
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
          <fieldset className="partner-caste-box edit-span-2">
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
                  Tick if this applies (Handicap category)
                </small>
              </span>
            </label>
          </fieldset>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="form-hint">{success}</p> : null}

      <div className="edit-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save profile"}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => router.push("/home")}
        >
          Dashboard
        </button>
      </div>
    </form>
  );
}
