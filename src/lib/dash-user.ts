import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  hasPartnerPreference,
  isProfileComplete,
} from "@/lib/validators";

export async function requireDashUser() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: { include: { partnerPreference: true } } },
  });

  if (!user) redirect("/login");
  if (!isProfileComplete(user.profile)) redirect("/onboarding");
  if (!hasPartnerPreference(user.profile)) redirect("/preferences");

  return {
    user,
    profile: user.profile!,
    contact: user.phone ?? user.email ?? "",
  };
}
