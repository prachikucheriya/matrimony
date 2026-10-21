"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";

type SettingsPageViewProps = {
  userName: string;
  contact: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  city: string | null;
  state: string | null;
  planLabel: string;
};

type Visibility = "all" | "premium" | "free" | "hidden";
type InterestWho = "all" | "premium" | "free";

type Prefs = {
  visibility: Visibility;
  interestWho: InterestWho;
  notifyInterest: boolean;
  notifyChat: boolean;
  notifyViews: boolean;
  notifyMatch: boolean;
};

const DEFAULT_PREFS: Prefs = {
  visibility: "all",
  interestWho: "all",
  notifyInterest: true,
  notifyChat: true,
  notifyViews: true,
  notifyMatch: true,
};

const STORAGE_KEY = "bandhanmil_settings_prefs";

export function SettingsPageView({
  userName,
  contact,
  email,
  phone,
  photoUrl,
  city,
  state,
  planLabel,
}: SettingsPageViewProps) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(userName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const location = [city, state].filter(Boolean).join(", ") || "India";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // ignore bad local prefs
    }
  }, []);

  function updatePrefs(next: Partial<Prefs>) {
    setPrefs((prev) => {
      const merged = { ...prev, ...next };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  }

  async function onSaveAccount(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      if (!profileRes.ok || !profileData.profile) {
        setError("Could not load current profile for update.");
        return;
      }

      const p = profileData.profile;
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: p.gender,
          displayName: fullName.trim(),
          dob: p.dob ? new Date(p.dob).toISOString().slice(0, 10) : "",
          motherTongue: p.motherTongue ?? "",
          height: p.height ?? "",
          birthPlace: p.birthPlace ?? "",
          birthTime: p.birthTime ?? "",
          complexion: p.complexion ?? "",
          religionId: p.religionId ?? "",
          casteId: p.casteId ?? "",
          subCasteId: p.subCasteId ?? "",
          education: p.education ?? "",
          occupation: p.occupation ?? "",
          incomeRange: p.incomeRange ?? "",
          city: p.city ?? "",
          state: p.state ?? "",
          address: p.address ?? "",
          fatherName: p.fatherName ?? "",
          fatherOccupation: p.fatherOccupation ?? "",
          motherName: p.motherName ?? "",
          motherOccupation: p.motherOccupation ?? "",
          brothersCount: p.brothersCount ?? 0,
          brothersNames: p.brothersNames ?? "",
          sistersCount: p.sistersCount ?? 0,
          sistersNames: p.sistersNames ?? "",
          maritalStatus: p.maritalStatus ?? "NEVER_MARRIED",
          spouseName: p.spouseName ?? "",
          spouseOccupation: p.spouseOccupation ?? "",
          isDifferentlyAbled: Boolean(p.isDifferentlyAbled),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update account.");
        return;
      }
      setMessage("Account details updated.");
      setEditing(false);
    } catch {
      setError("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="settings-page">
      <header className="interest-page-head">
        <h1>Profile settings</h1>
      </header>

      <div className="settings-stack">
        <section className="settings-card">
          <h2>Profile</h2>

          <div className="settings-user-row">
            <div className="settings-user-main">
              <div className="settings-avatar">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt={userName} />
                ) : (
                  <span>{userName.slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h3>{fullName || userName}</h3>
                <p>
                  {planLabel} user | {location}
                </p>
              </div>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="settings-signout">
                Sign Out
              </button>
            </form>
          </div>

          <div className="settings-block">
            <h4>Profile visible</h4>
            <p>You can set-up who can able to view your profile.</p>
            <div className="settings-options">
              {(
                [
                  ["all", "All users"],
                  ["premium", "Premium"],
                  ["free", "Free"],
                  ["hidden", "No-more visible"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="settings-radio">
                  <input
                    type="radio"
                    name="visibility"
                    checked={prefs.visibility === value}
                    onChange={() => updatePrefs({ visibility: value })}
                  />
                  <span>
                    {label}
                    {value === "hidden"
                      ? " (You can't visible, so no one can view your profile)"
                      : ""}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="settings-block">
            <h4>Who can send you Interest requests?</h4>
            <p>You can set-up who can able to make Interest request here.</p>
            <div className="settings-options">
              {(
                [
                  ["all", "All users"],
                  ["premium", "Premium"],
                  ["free", "Free"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="settings-radio">
                  <input
                    type="radio"
                    name="interestWho"
                    checked={prefs.interestWho === value}
                    onChange={() => updatePrefs({ interestWho: value })}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <h2>Account</h2>
            {!editing ? (
              <button
                type="button"
                className="settings-edit-btn"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                className="settings-edit-btn ghost"
                onClick={() => {
                  setEditing(false);
                  setFullName(userName);
                  setError(null);
                  setMessage(null);
                }}
              >
                Cancel
              </button>
            )}
          </div>

          {!editing ? (
            <ul className="settings-account-list">
              <li>
                <span>Full name</span>
                <strong>{fullName || userName}</strong>
              </li>
              <li>
                <span>Mobile</span>
                <strong>{phone || contact || "—"}</strong>
              </li>
              <li>
                <span>Email id</span>
                <strong>{email || "Not added"}</strong>
              </li>
              <li>
                <span>Login type</span>
                <strong>OTP</strong>
              </li>
              <li>
                <span>Profile type</span>
                <strong>{planLabel}</strong>
              </li>
            </ul>
          ) : (
            <form className="settings-edit-form" onSubmit={onSaveAccount}>
              <label className="field">
                <span>Full name</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  minLength={2}
                />
              </label>
              <label className="field">
                <span>Mobile (registered — cannot change)</span>
                <input value={phone || contact || ""} disabled />
              </label>
              <label className="field">
                <span>Email id (registered — cannot change)</span>
                <input value={email || ""} disabled />
              </label>
              <label className="field">
                <span>Login type</span>
                <input value="OTP verified" disabled />
              </label>
              <label className="field">
                <span>Profile type</span>
                <select defaultValue={planLabel} disabled>
                  <option value="Free">Free</option>
                  <option value="Premium">Premium</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </label>
              {error ? <p className="form-error">{error}</p> : null}
              {message ? <p className="form-hint">{message}</p> : null}
              <div className="settings-edit-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <Link href="/profile/edit" className="btn-ghost">
                  Edit full profile
                </Link>
              </div>
            </form>
          )}

          {!editing && message ? <p className="form-hint">{message}</p> : null}
          {!editing && error ? <p className="form-error">{error}</p> : null}
        </section>

        <section className="settings-card">
          <h2>Notifications</h2>
          <div className="settings-notify-list">
            <label className="settings-toggle-row">
              <div>
                <h4>Interest request</h4>
                <p>Interest request email notifications</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.notifyInterest}
                onChange={(e) =>
                  updatePrefs({ notifyInterest: e.target.checked })
                }
              />
            </label>
            <label className="settings-toggle-row">
              <div>
                <h4>Chat</h4>
                <p>New chat notifications</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.notifyChat}
                onChange={(e) => updatePrefs({ notifyChat: e.target.checked })}
              />
            </label>
            <label className="settings-toggle-row">
              <div>
                <h4>Profile views</h4>
                <p>
                  If any one view your profile means you get the notifications
                  at end of the day
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.notifyViews}
                onChange={(e) => updatePrefs({ notifyViews: e.target.checked })}
              />
            </label>
            <label className="settings-toggle-row">
              <div>
                <h4>New profile match</h4>
                <p>You get the profile match emails</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.notifyMatch}
                onChange={(e) => updatePrefs({ notifyMatch: e.target.checked })}
              />
            </label>
          </div>
        </section>
      </div>
    </section>
  );
}
