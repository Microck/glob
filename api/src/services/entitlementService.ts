import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let supabaseAdmin: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null;
  }
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseAdmin;
}

export type AccessLevel = {
  hasAccess: boolean;
  tier: string;
  status: string;
};

export async function getAccessLevel(userId: string): Promise<AccessLevel> {
  if (!userId) return { hasAccess: false, tier: "free", status: "none" };

  const db = getSupabase();
  if (!db) {
    // No supabase configured - allow free tier access for local dev
    return { hasAccess: false, tier: "free", status: "none" };
  }

  const { data, error } = await db
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

export async function getStorageUsage(userId: string): Promise<number> {
  if (!userId) return 0;

  const db = getSupabase();
  if (!db) return 0;

  const { data, error } = await db
    .from("profiles")
    .select("storage_used_bytes")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return 0;
  }

  return data.storage_used_bytes || 0;
}

