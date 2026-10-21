"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <form className="search-bar" onSubmit={onSubmit} role="search">
      <label className="sr-only" htmlFor="profile-search">
        Search profiles
      </label>
      <input
        id="profile-search"
        type="search"
        placeholder="Search by name, city, caste, religion…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="btn-primary">
        Search
      </button>
    </form>
  );
}
