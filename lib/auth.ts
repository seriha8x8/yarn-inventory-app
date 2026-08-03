import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/types";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function getUserPlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<Plan> {
  const { data } = await supabase
    .from("user_profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  return (data?.plan as Plan | undefined) ?? "free";
}
