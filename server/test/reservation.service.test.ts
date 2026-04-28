import { beforeEach, describe, expect, it } from "vitest";
import { createDatabase } from "../src/db.js";
import { markExpiredReservations, reserveSeat } from "../src/domain/reservation.service.js";

describe("reservation.service", () => {
  let db: ReturnType<typeof createDatabase>;

  beforeEach(() => {
    db = createDatabase(":memory:");
  });

  it("rejects two active reservations for the same user and time slot", () => {
    reserveSeat(db, {
      userId: 1,
      seatId: 10,
      reserveDate: "2026-05-01",
      startTime: "09:00",
      endTime: "11:00"
    });

    expect(() =>
      reserveSeat(db, {
        userId: 1,
        seatId: 11,
        reserveDate: "2026-05-01",
        startTime: "09:00",
        endTime: "11:00"
      })
    ).toThrowError("USER_SLOT_CONFLICT");
  });

  it("rejects two active reservations for the same seat and time slot", () => {
    reserveSeat(db, {
      userId: 1,
      seatId: 10,
      reserveDate: "2026-05-01",
      startTime: "09:00",
      endTime: "11:00"
    });

    expect(() =>
      reserveSeat(db, {
        userId: 3,
        seatId: 10,
        reserveDate: "2026-05-01",
        startTime: "09:00",
        endTime: "11:00"
      })
    ).toThrowError("SEAT_SLOT_CONFLICT");
  });

  it("marks past reserved rows as expired", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const reserveDate = yesterday.toISOString().slice(0, 10);

    db.prepare(
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
    ).run(1, 1, 10, reserveDate, "08:00", "09:00", new Date().toISOString());

    const changes = markExpiredReservations(db);

    expect(changes).toBe(1);

    const reservation = db
      .prepare("SELECT status FROM reservations WHERE seat_id = ?")
      .get(10) as { status: string };
    expect(reservation.status).toBe("expired");
  });
});
