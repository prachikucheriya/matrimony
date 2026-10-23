import Link from "next/link";
import { redirect } from "next/navigation";
import { AllProfilesView } from "@/components/AllProfilesView";
import { logoutAction } from "@/app/actions/auth";
import { canUseChat, canViewContactDetails } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function ProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    gender?: string;
    ageMin?: string;
    ageMax?: string;
    religion?: string;
    subCaste?: string;
    motherTongue?: string;
    location?: string;
    sort?: string;
    category?: string;
  }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const [religions, viewer] = await Promise.all([
    prisma.religion.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { plan: true },
    }),
  ]);

  return (
    <main className="profiles-page">
      <header className="profiles-topbar">
        <Link href="/" className="brand-mark">
          Bandhan<span>Mil</span>
        </Link>
        <nav className="profiles-topnav">
          <Link href="/home">Home</Link>
          <Link href="/profiles" className="active">
            All Profiles
          </Link>
          <Link href="/search">Quick Search</Link>
          <form action={logoutAction}>
            <button type="submit" className="btn-ghost">
              Logout
            </button>
          </form>
        </nav>
      </header>

      <AllProfilesView
        religions={religions}
        canChat={canUseChat(viewer?.plan)}
        canViewContact={canViewContactDetails(viewer?.plan)}
        initial={{
          q: params.q,
          gender: params.gender,
          ageMin: params.ageMin,
          ageMax: params.ageMax,
          religion: params.religion,
          subCaste: params.subCaste,
          motherTongue: params.motherTongue,
          location: params.location,
          sort: params.sort,
          category: params.category,
        }}
      />
    </main>
  );
}
