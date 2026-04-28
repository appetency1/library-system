import { Router } from "express";
import {
  createNotice,
  createRoom,
  createSeat,
  getAdminStats,
  listNotices,
  listReservations,
  listRooms,
  listSeats,
  listUsers,
  setUserStatus,
  updateNotice,
  updateRoom,
  updateSeat
} from "../domain/admin.service.js";
import { cancelReservation } from "../domain/reservation.service.js";
import type { AppDatabase } from "../db.js";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth.js";
import type { NoticeStatus, RoomStatus, SeatStatus, UserStatus } from "../domain/types.js";

export function createAdminRouter(db: AppDatabase, jwtSecret?: string): Router {
  const router = Router();

  router.use(requireAuth(jwtSecret));
  router.use(requireRole("admin"));

  router.get("/stats", (_req, res) => {
    res.json(getAdminStats(db));
  });

  router.get("/users", (_req, res) => {
    res.json(listUsers(db));
  });

  router.patch("/users/:id/status", (req, res, next) => {
    try {
      res.json(
        setUserStatus(db, Number(req.params.id), req.body.status as UserStatus)
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/rooms", (_req, res) => {
    res.json(listRooms(db));
  });

  router.post("/rooms", (req, res, next) => {
    try {
      res.status(201).json(
        createRoom(db, {
          name: String(req.body.name),
          location: String(req.body.location),
          description: String(req.body.description),
          status: String(req.body.status) as RoomStatus
        })
      );
    } catch (error) {
      next(error);
    }
  });

  router.patch("/rooms/:id", (req, res, next) => {
    try {
      res.json(
        updateRoom(db, Number(req.params.id), {
          name: String(req.body.name),
          location: String(req.body.location),
          description: String(req.body.description),
          status: String(req.body.status) as RoomStatus
        })
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/seats", (_req, res) => {
    res.json(listSeats(db));
  });

  router.post("/seats", (req, res, next) => {
    try {
      res.status(201).json(
        createSeat(db, {
          room_id: Number(req.body.room_id),
          seat_no: String(req.body.seat_no),
          type: String(req.body.type),
          status: String(req.body.status) as SeatStatus
        })
      );
    } catch (error) {
      next(error);
    }
  });

  router.patch("/seats/:id", (req, res, next) => {
    try {
      res.json(
        updateSeat(db, Number(req.params.id), {
          room_id: Number(req.body.room_id),
          seat_no: String(req.body.seat_no),
          type: String(req.body.type),
          status: String(req.body.status) as SeatStatus
        })
      );
    } catch (error) {
      next(error);
    }
  });

  router.get("/reservations", (_req, res) => {
    res.json(listReservations(db));
  });

  router.post("/reservations/:id/cancel", (req, res, next) => {
    try {
      const auth = (req as AuthenticatedRequest).auth;
      if (!auth) {
        res.status(401).json({ message: "AUTH_REQUIRED" });
        return;
      }
      res.json(cancelReservation(db, Number(req.params.id), auth.userId, "admin"));
    } catch (error) {
      next(error);
    }
  });

  router.get("/notices", (_req, res) => {
    res.json(listNotices(db));
  });

  router.post("/notices", (req, res, next) => {
    try {
      res.status(201).json(
        createNotice(db, {
          title: String(req.body.title),
          content: String(req.body.content),
          status: String(req.body.status) as NoticeStatus
        })
      );
    } catch (error) {
      next(error);
    }
  });

  router.patch("/notices/:id", (req, res, next) => {
    try {
      res.json(
        updateNotice(db, Number(req.params.id), {
          title: String(req.body.title),
          content: String(req.body.content),
          status: String(req.body.status) as NoticeStatus
        })
      );
    } catch (error) {
      next(error);
    }
  });

  return router;
}
