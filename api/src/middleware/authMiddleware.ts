import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";
import { getAccessLevel } from "../services/entitlementService.js";

async function verifyRequestToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) return null;

  try {
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return decoded.sub;
  } catch (err) {
    console.error("Auth error:", err);
    return null;
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const memberId = await verifyRequestToken(req);

  if (!memberId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  (req as any).memberId = memberId;
  next();
}

export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const memberId = await verifyRequestToken(req);
  
  if (memberId) {
    (req as any).memberId = memberId;
  }
  
  next();
}

export async function premiumMiddleware(req: Request, res: Response, next: NextFunction) {
  const memberId = (req as any).memberId;
  
  const access = await getAccessLevel(memberId);
  
  if (!access.hasAccess) {
    return res.status(403).json({ error: "Subscription required" });
  }

  (req as any).access = access;
  next();
}
