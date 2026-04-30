import test from "node:test";
import assert from "node:assert/strict";
import { isReservationWindowInPast } from "../src/utils/reservation-window.js";

test("treats today with an earlier start time as past", () => {
  const reference = new Date(2026, 3, 30, 20, 0, 0);
  assert.equal(isReservationWindowInPast("2026-04-30", "19:00", reference), true);
});

test("treats a future day as allowed", () => {
  const reference = new Date(2026, 3, 30, 20, 0, 0);
  assert.equal(isReservationWindowInPast("2026-05-01", "09:00", reference), false);
});
