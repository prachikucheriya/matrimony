"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SearchBar } from "@/components/SearchBar";

type SearchProfile = {
  id: string;
  displayName: string | null;
  gender: string | null;
  dob: string | null;
  city: string | null;
  state: string | null;
  education: string | null;
  occupation: string | null;
  photoUrl: string | null;
  religion: string | null;
  caste: string | null;
  subCaste: string | null;
};

type SearchFilters = {
  gender?: string;
  ageMin?: string;
  ageMax?: string;
  religion?: string;
  motherTongue?: string;
};

function ageFromDob(dob: string | null) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export function SearchResults({
  query,
  filters = {},
}: {
  query: string;
  filters?: SearchFilters;
}) {
  const [profiles, setProfiles] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.ageMin) params.set("ageMin", filters.ageMin);
    if (filters.ageMax) params.set("ageMax", filters.ageMax);
    if (filters.religion) params.set("religion", filters.religion);
    if (filters.motherTongue) params.set("motherTongue", filters.motherTongue);

    const qs = params.toString();
    const url = qs ? `/api/search?${qs}` : "/api/search";

    fetch(url)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Search failed");
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
  }, [query, filterKey, filters.gender, filters.ageMin, filters.ageMax, filters.religion, filters.motherTongue]);

  const filterSummary = [
    filters.gender === "BRIDE" ? "Women" : filters.gender === "GROOM" ? "Men" : null,
    filters.ageMin && filters.ageMax ? `Age ${filters.ageMin}-${filters.ageMax}` : null,
    filters.religion || null,
    filters.motherTongue || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="search-page-body">
      <SearchBar initialQuery={query} />
      {filterSummary ? <p className="muted">Filters: {filterSummary}</p> : null}

      {loading ? <p className="muted">Searching…</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!loading && !error && profiles.length === 0 ? (
        <p className="muted">
          {query || filterSummary
            ? "No profiles found for your filters."
            : "No matching profiles yet. More members will appear as people register."}
        </p>
      ) : null}

      <div className="search-grid">
        {profiles.map((profile) => {
          const age = ageFromDob(profile.dob);
          return (
            <article key={profile.id} className="search-card">
              <div className="search-card-photo">
                {profile.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photoUrl} alt={profile.displayName ?? "Profile"} />
                ) : (
                  <span>No photo</span>
                )}
              </div>
              <div className="search-card-body">
                <h3>
                  {profile.displayName ?? "Member"}
                  {age ? `, ${age}` : ""}
                </h3>
                <p>
                  {[profile.religion, profile.caste, profile.subCaste]
                    .filter(Boolean)
                    .join(" · ") || "Community not set"}
                </p>
                <p>
                  {[profile.city, profile.state].filter(Boolean).join(", ") || "—"}
                </p>
                <p>
                  {[profile.education, profile.occupation].filter(Boolean).join(" · ")}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <p className="auth-switch">
        <Link href="/home">Back to home</Link>
      </p>
    </div>
  );
}
