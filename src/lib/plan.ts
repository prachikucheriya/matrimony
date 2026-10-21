import { MembershipPlan } from "@prisma/client";

export function isPaidPlan(plan: MembershipPlan | string | null | undefined) {
  return plan === "GOLD" || plan === "PLATINUM";
}

export function canViewContactDetails(
  plan: MembershipPlan | string | null | undefined,
) {
  return isPaidPlan(plan);
}

export function canUseChat(plan: MembershipPlan | string | null | undefined) {
  return isPaidPlan(plan);
}

export function planLabel(plan: MembershipPlan | string | null | undefined) {
  if (plan === "GOLD") return "Gold";
  if (plan === "PLATINUM") return "Platinum";
  return "Free";
}

export function maskPhone(phone: string | null | undefined) {
  if (!phone) return "Hidden on Free plan";
  return "••••••••••";
}

export function maskAddress(address: string | null | undefined) {
  if (!address) return "Hidden on Free plan";
  return "Upgrade to view full address";
}
