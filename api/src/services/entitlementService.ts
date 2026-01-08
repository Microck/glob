import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type AccessLevel = {
  hasAccess: boolean;
  tier: string;
  status: string;
};

export async function getAccessLevel(userId: string): Promise<AccessLevel> {
  if (!userId) return { hasAccess: false, tier: "free", status: "none" };

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("tier, subscription_status")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { hasAccess: false, tier: "free", status: "none" };
  }

  const isValid = data.subscription_status === "active";

  return {
    hasAccess: isValid,
    tier: data.tier,
    status: data.subscription_status,
  };
}
