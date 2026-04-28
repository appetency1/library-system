import { Router } from "express";
import { listNotices, listReservations, listRooms, listSeats } from "../domain/admin.service.js";
import {
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  listMyReservations,
  reserveSeat
} from "../domain/reservation.service.js";
import { slotsOverlap } from "../domain/time.js";
import type { AppDatabase } from "../db.js";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth.js";

function isSeatAvailable(
  db: AppDatabase,
  seatId: number,
  reserveDate: string,
  startTime: string,
  endTime: string
): boolean {
  const conflictingReservations = db
    .prepare(
      `
        SELECT start_time, end_time
        FROM reservations
        WHERE seat_id = ?
          AND reserve_date = ?
          AND status IN ('reserved', 'checked_in')
      `
    )
    .all(seatId, reserveDate) as Array<{ start_time: string; end_time: string }>;

  return !conflictingReservations.some((reservation) =>
    slotsOverlap(
      reservation.start_time,
      reservation.end_time,
      startTime,
      endTime
    )
  );
}

export function createStudentRouter(db: AppDatabase, jwtSecret?: string): Router {
  const router = Router();

  router.get("/notices", (_req, res) => {
    res.json(listNotices(db).filter((notice) => notice.status === "published"));
  });

  router.get("/rooms", (_req, res) => {
    res.json(listRooms(db).filter((room) => room.status === "active"));
  });

  router.get("/seats", (req, res) => {
    const roomId = req.query.roomId ? Number(req.query.roomId) : undefined;
    const reserveDate = typeof req.query.reserveDate === "string" ? req.query.reserveDate : "";
    const startTime = typeof req.query.startTime === "string" ? req.query.startTime : "";
    const endTime = typeof req.query.endTime === "string" ? req.query.endTime : "";

    const seats = listSeats(db)
      .filter((seat) => (roomId ? seat.room_id === roomId : true))
      .map((seat) => ({
        id: seat.id,
        roomId: seat.room_id,
        seatNo: seat.seat_no,
        type: seat.type,
        status: seat.status,
        roomName: seat.room_name,
        roomStatus: seat.room_status,
        available:
          seat.status === "active" &&
          seat.room_status === "active" &&
          (!reserveDate || !startTime || !endTime
            ? true
            : isSeatAvailable(db, seat.id, reserveDate, startTime, endTime))
      }));

    res.json(seats);
  });

  router.use(requireAuth(jwtSecret));

  router.post("/reservations", requireRole("student"), (req, res, next) => {
    try {
      const auth = (req as AuthenticatedRequest).auth;
      if (!auth) {
        res.status(401).json({ message: "AUTH_REQUIRED" });
        return;
      }

      const reservation = reserveSeat(db, {
        userId: auth.userId,
        seatId: Number(req.body.seatId),
        reserveDate: String(req.body.reserveDate),
        startTime: String(req.body.startTime),
        endTime: String(req.body.endTime)
      });

      res.status(201).json(reservation);
    } catch (error) {
      next(error);
    }
  });

  router.get("/my/reservations", (req, res) => {
    const auth = (req as AuthenticatedRequest).auth;
    if (!auth) {
      res.status(401).json({ message: "AUTH_REQUIRED" });
      return;
    }

    res.json(listMyReservations(db, auth.userId));
  });

  router.post("/reservations/:id/cancel", (req, res, next) => {
    try {
      const auth = (req as AuthenticatedRequest).auth;
      if (!auth) {
        res.status(401).json({ message: "AUTH_REQUIRED" });
        return;
      }

      const reservation = cancelReservation(db, Number(req.params.id), auth.userId, auth.role);
      res.json(reservation);
    } catch (error) {
      next(error);
    }
  });

  router.post("/reservations/:id/checkin", (req, res, next) => {
    try {
      const auth = (req as AuthenticatedRequest).auth;
      if (!auth) {
        res.status(401).json({ message: "AUTH_REQUIRED" });
        return;
      }

      const reservation = checkInReservation(db, Number(req.params.id), auth.userId);
      res.json(reservation);
    } catch (error) {
      next(error);
    }
  });

  router.post("/reservations/:id/checkout", (req, res, next) => {
    try {
      const auth = (req as AuthenticatedRequest).auth;
      if (!auth) {
        res.status(401).json({ message: "AUTH_REQUIRED" });
        return;
      }

      const reservation = checkOutReservation(db, Number(req.params.id), auth.userId);
      res.json(reservation);
    } catch (error) {
      next(error);
    }
  });

  router.get("/reservations", (_req, res) => {
    res.json(listReservations(db));
  });

  return router;
}

