import { beforeEach, describe, expect, it } from "vitest";
import { createDatabase } from "../src/db.js";
import { reserveSeat } from "../src/domain/reservation.service.js";

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
});
