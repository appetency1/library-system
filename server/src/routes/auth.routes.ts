import { Router } from "express";
import { authenticateUser, getAuthenticatedUser, registerStudent } from "../domain/auth.service.js";
import type { AppDatabase } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";

export function createAuthRouter(db: AppDatabase, jwtSecret?: string): Router {
  const router = Router();

  router.post("/register", (req, res, next) => {
    try {
      const user = registerStudent(db, req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", (req, res, next) => {
    try {
      const session = authenticateUser(db, req.body, jwtSecret);
      res.json(session);
    } catch (error) {
      next(error);
    }
  });

  router.get("/me", requireAuth(jwtSecret), (req, res, next) => {
    try {
      const auth = (req as AuthenticatedRequest).auth;
      if (!auth) {
        res.status(401).json({ message: "AUTH_REQUIRED" });
        return;
      }
      res.json(getAuthenticatedUser(db, auth.userId));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

