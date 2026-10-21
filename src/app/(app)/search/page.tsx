import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchResults } from "@/components/SearchResults";
import { getSession } from "@/lib/session";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    gender?: string;
    ageMin?: string;
    ageMax?: string;
    religion?: string;
    motherTongue?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const query = (params.q || "").trim();

  return (
    <main className="home-page">
      <header className="home-header">
        <Link href="/home" className="brand-mark">
          Bandhan<span>Mil</span>
        </Link>
        <Link href="/home" className="btn-ghost">
          Home
        </Link>
      </header>

      <section className="home-hero">
        <p className="eyebrow">Discover</p>
        <h1>Search profiles</h1>
        <p className="lede">
          Find matches by name, city, religion, caste, education, or occupation.
        </p>
      </section>

      <SearchResults
        query={query}
        filters={{
          gender: params.gender,
          ageMin: params.ageMin,
          ageMax: params.ageMax,
          religion: params.religion,
          motherTongue: params.motherTongue,
        }}
      />
    </main>
  );
}
