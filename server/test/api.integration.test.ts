import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createDatabase } from "../src/db.js";

describe("api integration", () => {
  let db: ReturnType<typeof createDatabase>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    db = createDatabase(":memory:");
    app = createApp({ db });
  });

  it("rejects reservation creation without a token", async () => {
    await request(app).post("/api/reservations").expect(401);
  });

  it("allows a logged-in student to create a reservation", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ username: "student1", password: "Password123!" })
      .expect(200);

    const token = loginResponse.body.token as string;

    await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({
        seatId: 10,
        reserveDate: "2026-05-01",
        startTime: "09:00",
        endTime: "11:00"
      })
      .expect(201);
  });

  it("refreshes expired reservations before returning student reservations", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const reserveDate = yesterday.toISOString().slice(0, 10);
    const createdAt = new Date().toISOString();

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
    ).run(1, 1, 10, reserveDate, "08:00", "09:00", createdAt);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ username: "student1", password: "Password123!" })
      .expect(200);

    const token = loginResponse.body.token as string;

    const response = await request(app)
      .get("/api/my/reservations")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe("expired");
    expect(response.body[0].room_name).toBe("第一阅览室");
    expect(response.body[0].seat_no).toBe("A-01");
  });
});
