import cors from "cors";
import express from "express";
import type { AppDatabase } from "./db.js";
import { JWT_SECRET } from "./domain/auth.service.js";
import { createAdminRouter } from "./routes/admin.routes.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createStudentRouter } from "./routes/student.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

export interface CreateAppOptions {
  db: AppDatabase;
  jwtSecret?: string;
}

export function createApp(options: CreateAppOptions): express.Express {
  const jwtSecret = options.jwtSecret ?? JWT_SECRET;
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", createAuthRouter(options.db, jwtSecret));
  app.use("/api", createStudentRouter(options.db, jwtSecret));
  app.use("/api/admin", createAdminRouter(options.db, jwtSecret));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

