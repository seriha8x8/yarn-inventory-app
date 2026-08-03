import type { Plan } from "@/lib/types";

// MVP has no payment processing. Free plan caps yarns/projects at one photo
// each; this is the single place a future Stripe entitlement check plugs in.
export const FREE_PLAN_PHOTO_LIMIT = 1;

export function canAddPhoto(plan: Plan, currentPhotoCount: number): boolean {
  if (plan === "premium") return true;
  return currentPhotoCount < FREE_PLAN_PHOTO_LIMIT;
}
