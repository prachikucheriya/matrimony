"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { INDIAN_STATES, MOTHER_TONGUES } from "@/lib/constants";
import {
  PROFILE_CATEGORY_OPTIONS,
  type ProfileCategory,
} from "@/lib/categories";

type ReligionOption = { id: string; name: string };

type ProfileItem = {
  id: string;
  displayName: string | null;
  gender: string | null;
  dob: string | null;
  height: string | null;
  city: string | null;
  state: string | null;
  education: string | null;
  occupation: string | null;
  photoUrl: string | null;
  religion: string | null;
  caste: string | null;
  motherTongue: string | null;
  phone?: string | null;
  address?: string | null;
};

type InitialFilters = {
  gender?: string;
  ageMin?: string;
  ageMax?: string;
  religion?: string;
  subCaste?: string;
  motherTongue?: string;
  location?: string;
  q?: string;
  sort?: string;
  category?: string;
};

const AGE_RANGES = [
  { label: "18 to 30", min: "18", max: "30" },
  { label: "31 to 40", min: "31", max: "40" },
  { label: "41 to 50", min: "41", max: "50" },
  { label: "51 to 60", min: "51", max: "60" },
];

function ageFromDob(dob: string | null) {
  if (!dob) return null;
  return Math.floor(
    (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

export function AllProfilesView({
  religions,
  initial,
  canChat = false,
  canViewContact = false,
}: {
  religions: ReligionOption[];
  initial: InitialFilters;
  canChat?: boolean;
  canViewContact?: boolean;
}) {
  const router = useRouter();
  const [gender, setGender] = useState(initial.gender || "");
  const [ageRange, setAgeRange] = useState(() => {
    if (initial.ageMin && initial.ageMax) {
      return `${initial.ageMin}-${initial.ageMax}`;
    }
    return "";
  });
  const [religion, setReligion] = useState(initial.religion || "");
  const subCaste = initial.subCaste || "";
  const [motherTongue, setMotherTongue] = useState(initial.motherTongue || "");
  const [location, setLocation] = useState(initial.location || "");
  const [sort, setSort] = useState(initial.sort || "newest");
  const [query, setQuery] = useState(initial.q || "");
  const [category, setCategory] = useState<ProfileCategory | "">(
    (PROFILE_CATEGORY_OPTIONS.some((o) => o.value === initial.category)
      ? (initial.category as ProfileCategory)
      : "") || "",
  );
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interestTarget, setInterestTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestMessage, setInterestMessage] = useState<string | null>(null);
  const [interestError, setInterestError] = useState<string | null>(null);

  const filters = useMemo(() => {
    const [ageMin, ageMax] = ageRange ? ageRange.split("-") : ["", ""];
    return {
      gender,
      ageMin,
      ageMax,
      religion,
      subCaste,
      motherTongue,
      location,
      sort,
      q: query,
      category,
    };
  }, [gender, ageRange, religion, subCaste, motherTongue, location, sort, query, category]);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.ageMin) params.set("ageMin", filters.ageMin);
    if (filters.ageMax) params.set("ageMax", filters.ageMax);
    if (filters.religion) params.set("religion", filters.religion);
    if (filters.subCaste) params.set("subCaste", filters.subCaste);
    if (filters.motherTongue) params.set("motherTongue", filters.motherTongue);
    if (filters.location) params.set("location", filters.location);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.category) params.set("category", filters.category);

    fetch(`/api/search?${params.toString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load profiles");
        if (!cancelled) setProfiles(data.profiles ?? []);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterKey, filters]);

  function applyFilters(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (gender) params.set("gender", gender);
    if (ageRange) {
      const [min, max] = ageRange.split("-");
      params.set("ageMin", min);
      params.set("ageMax", max);
    }
    if (religion) params.set("religion", religion);
    if (motherTongue) params.set("motherTongue", motherTongue);
    if (location) params.set("location", location);
    if (sort) params.set("sort", sort);
    if (category) params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    router.push(`/profiles?${params.toString()}`);
  }

  function resetFilters() {
    setGender("");
    setAgeRange("");
    setReligion("");
    setMotherTongue("");
    setLocation("");
    setSort("newest");
    setQuery("");
    setCategory("");
    router.push("/profiles");
  }

  return (
    <div className="all-profiles">
      <section className="profiles-hero">
        <div className="profiles-hero-media" aria-hidden />
        <div className="profiles-hero-content">
          <p className="profiles-hero-kicker">BandhanMil</p>
          <h1>Lakhs of Happy Marriages</h1>
          <p>Browse verified multi-caste profiles and find your right match.</p>
          <Link href="/register" className="btn-primary">
            Join now for Free
          </Link>
        </div>
      </section>

      <div className="profiles-layout">
        <aside className="profiles-filters">
          <div className="profiles-filters-head">
            <h2>Profile filters</h2>
            <button type="button" className="btn-ghost" onClick={resetFilters}>
              Reset
            </button>
          </div>

          <form onSubmit={applyFilters} className="profiles-filter-form">
            <div className="field">
              <span>Category</span>
              <div className="partner-caste-list" style={{ gap: "0.4rem" }}>
                <label className={`settings-radio ${category === "" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="profile-category"
                    checked={category === ""}
                    onChange={() => setCategory("")}
                  />
                  <span>From my preferences</span>
                </label>
                {PROFILE_CATEGORY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`settings-radio ${category === opt.value ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="profile-category"
                      checked={category === opt.value}
                      onChange={() => setCategory(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <label className="field">
              <span>I&apos;m looking for</span>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Any</option>
                <option value="BRIDE">Women</option>
                <option value="GROOM">Men</option>
              </select>
            </label>

            <label className="field">
              <span>Age</span>
              <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
                <option value="">Select age</option>
                {AGE_RANGES.map((range) => (
                  <option key={range.label} value={`${range.min}-${range.max}`}>
                    {range.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Religion</span>
              <select value={religion} onChange={(e) => setReligion(e.target.value)}>
                <option value="">Any</option>
                {religions.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Mother tongue</span>
              <select
                value={motherTongue}
                onChange={(e) => setMotherTongue(e.target.value)}
              >
                <option value="">Any</option>
                {MOTHER_TONGUES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Location</span>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Any location</option>
                {INDIAN_STATES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Keyword</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, city, caste…"
              />
            </label>

            <button type="submit" className="btn-primary profiles-filter-submit">
              Apply filters
            </button>
          </form>

          <div className="profiles-help-box">
            <h3>What are you looking for?</h3>
            <p>We help you arrange the best match with community-aware filters.</p>
            <Link href="/register" className="btn-secondary">
              Send your queries
            </Link>
          </div>
        </aside>

        <section className="profiles-main">
          <div className="profiles-toolbar">
            <p>
              Showing <strong>{profiles.length}</strong> profiles
            </p>
            <label>
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>

          {loading ? <p className="muted">Loading profiles…</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          {!loading && !error && profiles.length === 0 ? (
            <p className="muted">No profiles found for these filters.</p>
          ) : null}

          <div className="profiles-list">
            {profiles.map((profile) => {
              const age = ageFromDob(profile.dob);
              return (
                <article key={profile.id} className="profile-row">
                  <div className="profile-row-photo">
                    {profile.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.photoUrl}
                        alt={profile.displayName ?? "Profile"}
                      />
                    ) : (
                      <span>No photo</span>
                    )}
                    <em>Available Online</em>
                  </div>

                  <div className="profile-row-body">
                    <h3>{profile.displayName ?? "Member"}</h3>
                    <ul>
                      <li>{profile.education || "Education N/A"}</li>
                      <li>{profile.occupation || "Profession N/A"}</li>
                      <li>{age ? `${age} Years old` : "Age N/A"}</li>
                      <li>Height: {profile.height || "N/A"}</li>
                      <li>
                        {[profile.religion, profile.caste].filter(Boolean).join(" · ") ||
                          "Community N/A"}
                      </li>
                      <li>
                        {[profile.city, profile.state].filter(Boolean).join(", ") ||
                          "Location N/A"}
                      </li>
                      {canViewContact ? (
                        <>
                          <li>Mobile: {profile.phone || "Not shared"}</li>
                          <li>Address: {profile.address || "Not shared"}</li>
                        </>
                      ) : null}
                    </ul>

                    <div className="profile-row-actions">
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          setInterestError(null);
                          setInterestMessage(null);
                          setInterestTarget({
                            id: profile.id,
                            name: profile.displayName ?? "this member",
                          });
                        }}
                      >
                        Send interest
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        disabled={!canChat}
                        title={
                          canChat
                            ? "Open chat after interest is accepted"
                            : "Chat is disabled on Free plan"
                        }
                        onClick={() => {
                          if (!canChat) return;
                          router.push("/interests");
                        }}
                      >
                        Chat
                      </button>
                      {!canChat ? (
                        <Link href="/plan" className="profile-upgrade-hint">
                          Upgrade to chat
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {interestTarget ? (
        <div className="interest-modal" role="dialog" aria-modal="true">
          <div className="interest-modal-card">
            <h3>Send interest to {interestTarget.name}</h3>
            <p>
              Confirm to send an interest request. They can accept it from their
              dashboard Interests section.
            </p>
            {interestError ? <p className="form-error">{interestError}</p> : null}
            {interestMessage ? <p className="form-hint">{interestMessage}</p> : null}
            <div className="interest-modal-actions">
              <button
                type="button"
                className="btn-primary"
                disabled={sendingInterest || Boolean(interestMessage)}
                onClick={async () => {
                  setSendingInterest(true);
                  setInterestError(null);
                  try {
                    const response = await fetch("/api/interests", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ toProfileId: interestTarget.id }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                      setInterestError(data.error ?? "Could not send interest.");
                      return;
                    }
                    setInterestMessage(
                      data.message ?? "Interest sent successfully.",
                    );
                  } catch {
                    setInterestError("Something went wrong. Please try again.");
                  } finally {
                    setSendingInterest(false);
                  }
                }}
              >
                {sendingInterest ? "Sending…" : "Send interest"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setInterestTarget(null);
                  setInterestError(null);
                  setInterestMessage(null);
                }}
              >
                {interestMessage ? "Close" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
