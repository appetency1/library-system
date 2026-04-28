import type { AppDatabase } from "../db.js";
import {
  currentTimestamp,
  assertTimeWindow,
  slotsOverlap,
  todayDate
} from "./time.js";
import type {
  ReservationRow,
  ReserveSeatInput,
  SeatRow,
  UserRow
} from "./types.js";

function getUser(db: AppDatabase, userId: number): UserRow | undefined {
  return db
    .prepare(
      `
        SELECT id, username, password_hash, name, role, status, created_at
        FROM users
        WHERE id = ?
      `
    )
    .get(userId) as UserRow | undefined;
}

function getSeatWithRoom(
  db: AppDatabase,
  seatId: number
): (SeatRow & { room_status: string; room_name: string }) | undefined {
  return db
    .prepare(
      `
        SELECT
          seats.id,
          seats.room_id,
          seats.seat_no,
          seats.type,
          seats.status,
          seats.created_at,
          rooms.status AS room_status,
          rooms.name AS room_name
        FROM seats
        JOIN rooms ON rooms.id = seats.room_id
        WHERE seats.id = ?
      `
    )
    .get(seatId) as
    | (SeatRow & { room_status: string; room_name: string })
    | undefined;
}

function getReservation(db: AppDatabase, reservationId: number): ReservationRow | undefined {
  return db
    .prepare(
      `
        SELECT
          id,
          user_id,
          room_id,
          seat_id,
          reserve_date,
          start_time,
          end_time,
          status,
          checkin_at,
          checkout_at,
          cancelled_at,
          created_at
        FROM reservations
        WHERE id = ?
      `
    )
    .get(reservationId) as ReservationRow | undefined;
}

function ensureNoConflict(
  db: AppDatabase,
  input: ReserveSeatInput
): void {
  const activeReservations = db
    .prepare(
      `
        SELECT
          id,
          user_id,
          seat_id,
          reserve_date,
          start_time,
          end_time,
          status
        FROM reservations
        WHERE reserve_date = ?
          AND status IN ('reserved', 'checked_in')
          AND (
            user_id = ?
            OR seat_id = ?
          )
      `
    )
    .all(input.reserveDate, input.userId, input.seatId) as Array<{
    id: number;
    user_id: number;
    seat_id: number;
    reserve_date: string;
    start_time: string;
    end_time: string;
    status: string;
  }>;

  for (const reservation of activeReservations) {
    if (
      slotsOverlap(
        reservation.start_time,
        reservation.end_time,
        input.startTime,
        input.endTime
      )
    ) {
      if (reservation.user_id === input.userId) {
        throw new Error("USER_SLOT_CONFLICT");
      }
      if (reservation.seat_id === input.seatId) {
        throw new Error("SEAT_SLOT_CONFLICT");
      }
    }
  }
}

export function reserveSeat(
  db: AppDatabase,
  input: ReserveSeatInput
): ReservationRow {
  assertTimeWindow(input.startTime, input.endTime);

  const user = getUser(db, input.userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  if (user.status !== "active") {
    throw new Error("USER_DISABLED");
  }

  const seat = getSeatWithRoom(db, input.seatId);
  if (!seat) {
    throw new Error("SEAT_NOT_FOUND");
  }
  if (seat.status !== "active" || seat.room_status !== "active") {
    throw new Error("SEAT_UNAVAILABLE");
  }

  ensureNoConflict(db, input);

  const createdAt = currentTimestamp();
  const insertResult = db
    .prepare(
      `
        INSERT INTO reservations (
          user_id,
          room_id,
          seat_id,
          reserve_date,
          start_time,
          end_time,
          status,
          checkin_at,
          checkout_at,
          cancelled_at,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 'reserved', NULL, NULL, NULL, ?)
      `
    )
    .run(
      input.userId,
      seat.room_id,
      input.seatId,
      input.reserveDate,
      input.startTime,
      input.endTime,
      createdAt
    );

  const created = getReservation(db, Number(insertResult.lastInsertRowid));
  if (!created) {
    throw new Error("RESERVATION_CREATE_FAILED");
  }
  return created;
}

export function cancelReservation(
  db: AppDatabase,
  reservationId: number,
  actorUserId: number,
  actorRole: "student" | "admin"
): ReservationRow {
  const reservation = getReservation(db, reservationId);
  if (!reservation) {
    throw new Error("RESERVATION_NOT_FOUND");
  }
  if (actorRole !== "admin" && reservation.user_id !== actorUserId) {
    throw new Error("FORBIDDEN");
  }
  if (reservation.status === "cancelled" || reservation.status === "completed") {
    throw new Error("RESERVATION_NOT_CANCELLABLE");
  }
  if (actorRole !== "admin" && reservation.status !== "reserved") {
    throw new Error("RESERVATION_NOT_CANCELLABLE");
  }
  if (actorRole !== "admin") {
    const current = new Date();
    const start = new Date(`${reservation.reserve_date}T${reservation.start_time}:00`);
    if (current >= start) {
      throw new Error("RESERVATION_NOT_CANCELLABLE");
    }
  }

  db.prepare(
    `
      UPDATE reservations
      SET status = 'cancelled',
          cancelled_at = ?
      WHERE id = ?
    `
  ).run(currentTimestamp(), reservationId);

  const updated = getReservation(db, reservationId);
  if (!updated) {
    throw new Error("RESERVATION_UPDATE_FAILED");
  }
  return updated;
}

export function checkInReservation(
  db: AppDatabase,
  reservationId: number,
  actorUserId: number
): ReservationRow {
  const reservation = getReservation(db, reservationId);
  if (!reservation) {
    throw new Error("RESERVATION_NOT_FOUND");
  }
  if (reservation.user_id !== actorUserId) {
    throw new Error("FORBIDDEN");
  }
  if (reservation.status !== "reserved") {
    throw new Error("RESERVATION_NOT_CHECKINABLE");
  }

  const now = new Date();
  const start = new Date(`${reservation.reserve_date}T${reservation.start_time}:00`);
  const end = new Date(`${reservation.reserve_date}T${reservation.end_time}:00`);
  if (now < start) {
    throw new Error("CHECKIN_TOO_EARLY");
  }
  if (now >= end) {
    throw new Error("RESERVATION_EXPIRED");
  }

  db.prepare(
    `
      UPDATE reservations
      SET status = 'checked_in',
          checkin_at = ?
      WHERE id = ?
    `
  ).run(currentTimestamp(now), reservationId);

  const updated = getReservation(db, reservationId);
  if (!updated) {
    throw new Error("RESERVATION_UPDATE_FAILED");
  }
  return updated;
}

export function checkOutReservation(
  db: AppDatabase,
  reservationId: number,
  actorUserId: number
): ReservationRow {
  const reservation = getReservation(db, reservationId);
  if (!reservation) {
    throw new Error("RESERVATION_NOT_FOUND");
  }
  if (reservation.user_id !== actorUserId) {
    throw new Error("FORBIDDEN");
  }
  if (reservation.status !== "checked_in") {
    throw new Error("RESERVATION_NOT_CHECKOUTABLE");
  }

  db.prepare(
    `
      UPDATE reservations
      SET status = 'completed',
          checkout_at = ?
      WHERE id = ?
    `
  ).run(currentTimestamp(), reservationId);

  const updated = getReservation(db, reservationId);
  if (!updated) {
    throw new Error("RESERVATION_UPDATE_FAILED");
  }
  return updated;
}

export function listMyReservations(db: AppDatabase, userId: number): ReservationRow[] {
  return db
    .prepare(
      `
        SELECT
          id,
          user_id,
          room_id,
          seat_id,
          reserve_date,
          start_time,
          end_time,
          status,
          checkin_at,
          checkout_at,
          cancelled_at,
          created_at
        FROM reservations
        WHERE user_id = ?
        ORDER BY reserve_date DESC, start_time DESC, id DESC
      `
    )
    .all(userId) as ReservationRow[];
}

export function markExpiredReservations(db: AppDatabase): number {
  const currentDate = todayDate();
  const result = db
    .prepare(
      `
        UPDATE reservations
        SET status = 'expired'
        WHERE status = 'reserved'
          AND (
            reserve_date < ?
            OR (reserve_date = ? AND end_time <= time('now'))
          )
      `
    )
    .run(currentDate, currentDate);
  return result.changes;
}
