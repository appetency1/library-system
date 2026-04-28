import type { Request, RequestHandler } from "express";
import { JWT_SECRET, verifyToken } from "../domain/auth.service.js";
import type { UserRole } from "../domain/types.js";

export interface AuthContext {
  userId: number;
  username: string;
  role: UserRole;
}

export type AuthenticatedRequest = Request & {
  auth?: AuthContext;
};

export function requireAuth(jwtSecret = JWT_SECRET): RequestHandler {
  return (req, res, next) => {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ message: "AUTH_REQUIRED" });
      return;
    }

    try {
      const token = header.slice("Bearer ".length);
      const payload = verifyToken(token, jwtSecret);
      (req as AuthenticatedRequest).auth = {
        userId: payload.sub,
        username: payload.username,
        role: payload.role as UserRole
      };
      next();
    } catch {
      res.status(401).json({ message: "AUTH_REQUIRED" });
    }
  };
}

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth || !roles.includes(auth.role)) {
      res.status(403).json({ message: "FORBIDDEN" });
      return;
    }
    next();
  };
}

