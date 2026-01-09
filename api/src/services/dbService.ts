import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getStorageUsage } from "./entitlementService.js";

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

export async function saveOptimization(data: {
  userId: string;
  originalName: string;
  originalSize: number;
  optimizedSize: number;
  stats: any;
  downloadUrl: string;
}) {
  const db = getSupabase();
  if (!db) return;

  const { error } = await db
    .from("optimizations")
    .insert({
      user_id: data.userId,
      original_name: data.originalName,
      original_size: data.originalSize,
      optimized_size: data.optimizedSize,
      stats: data.stats,
      download_url: data.downloadUrl
    });

  if (error) {
    console.error("Failed to save optimization to DB:", error);
  }

  try {
    const currentUsage = await getStorageUsage(data.userId);
    const newUsage = currentUsage + data.optimizedSize;
    
    await db
      .from("profiles")
      .update({ storage_used_bytes: newUsage })
      .eq("id", data.userId);
  } catch (err) {
    console.error("Failed to update storage usage:", err);
  }
}


export async function getOptimizations(userId: string) {
  const db = getSupabase();
  if (!db) return [];

  const { data, error } = await db
    .from("optimizations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
  
  export async function deleteOptimization(id: string, userId: string) {
    const db = getSupabase();
    if (!db) throw new Error("Database not configured");

    const { data, error } = await db
      .from("optimizations")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
  
    if (error) throw error;
    return data;
  }
  
  export async function decrementStorageUsage(userId: string, amount: number) {
    const db = getSupabase();
    if (!db) return;

    try {
      const currentUsage = await getStorageUsage(userId);
      const newUsage = Math.max(0, currentUsage - amount);
      
      await db
        .from("profiles")
        .update({ storage_used_bytes: newUsage })
        .eq("id", userId);
    } catch (err) {
      console.error("Failed to decrement storage usage:", err);
    }
  }
