import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function saveOptimization(data: {
  userId: string;
  originalName: string;
  originalSize: number;
  optimizedSize: number;
  stats: any;
  downloadUrl: string;
}) {
  const { error } = await supabaseAdmin
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
}

export async function getOptimizations(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("optimizations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
