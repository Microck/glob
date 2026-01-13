import { Router, Request, Response } from "express";
import { Polar } from "@polar-sh/sdk";

export const checkoutRouter = Router();

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
});

checkoutRouter.get("/", async (req: Request, res: Response) => {
  const priceId = req.query.priceId as string;

  if (!priceId) {
    return res.status(400).json({ error: "Missing priceId query parameter" });
  }

  if (!process.env.POLAR_ACCESS_TOKEN) {
    console.error("POLAR_ACCESS_TOKEN is missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const successUrl = process.env.POLAR_SUCCESS_URL || `${req.protocol}://${req.get("host")}/success?checkout_id={CHECKOUT_ID}`;
    
    const result = await polar.checkouts.create({
      products: [priceId],
      successUrl: successUrl,
    });

    if (result) {
      return res.redirect(result.url);
    } else {
        throw new Error("Failed to create checkout session");
    }
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});
