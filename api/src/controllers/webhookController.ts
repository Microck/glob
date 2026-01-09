import { Request, Response, Router } from "express";
import { Webhook } from "standardwebhooks";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let supabaseAdmin: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null;
  }
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}

export const webhookRouter = Router();

webhookRouter.post("/polar", async (req: Request, res: Response) => {
  const payload = req.body;
  const webhookSignature = req.headers["webhook-signature"] as string;
  const webhookTimestamp = req.headers["webhook-timestamp"] as string;
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSignature || !webhookSecret) {
    return res.status(400).json({ error: "Missing signature or secret" });
  }

  const db = getSupabase();
  if (!db) {
    return res.status(503).json({ error: "Database not configured" });
  }

  const wh = new Webhook(webhookSecret);
  let event: any;
  
  try {
    event = wh.verify(payload, {
        "webhook-signature": webhookSignature,
        "webhook-timestamp": webhookTimestamp || "",
    });
  } catch (err) {
    console.error("Webhook verification failed", err);
    return res.status(401).json({ error: "Invalid signature" });
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "subscription.created":
      case "subscription.updated":
        const userId = data.user_metadata?.user_id || data.metadata?.userId;
        const status = data.status === 'active' ? 'active' : 'past_due';
        
        if (!userId) {
            console.error("No User ID found in Polar metadata");
            return res.status(400).json({ error: "No User ID attached" });
        }

        const { error } = await db
          .from("profiles")
          .upsert({
            id: userId,
            polar_customer_id: data.customer_id,
            polar_subscription_id: data.id,
            subscription_status: status,
            tier: data.product?.name || "pro",
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        break;

      default:
        console.log(`Unhandled event type: ${type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Database update failed", error);
    return res.status(500).json({ error: "Database error" });
  }
});
