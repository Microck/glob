import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";
import { getAccessLevel } from "../services/entitlementService.js";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.headers["x-member-id"] as string;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (token.includes('.')) {
      const decoded = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      (req as any).memberId = decoded.sub;
    } else {
      (req as any).memberId = token;
    }
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
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
