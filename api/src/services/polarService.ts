import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
});

export async function ingestOptimization(userId: string) {
  if (!process.env.POLAR_ACCESS_TOKEN) return;

  try {
    await polar.events.ingest({
      events: [{
        name: "optimization",
        customerId: userId,
        timestamp: new Date()
      }]
    });
  } catch (error) {
    console.error("Failed to ingest Polar event:", error);
  }
}
