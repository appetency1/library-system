import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createDatabase } from "../src/db.js";

describe("api integration", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp({ db: createDatabase(":memory:") });
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
});
