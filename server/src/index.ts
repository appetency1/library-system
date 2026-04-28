import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createApp } from "./app.js";
import { createDatabase } from "./db.js";
import { markExpiredReservations } from "./domain/reservation.service.js";

const port = Number(process.env.PORT ?? 3000);
const dbPath = process.env.DB_PATH ?? "data/library-seat-reservation.sqlite";

mkdirSync(dirname(dbPath), { recursive: true });

const db = createDatabase(dbPath);
markExpiredReservations(db);

const app = createApp({
  db,
  jwtSecret: process.env.JWT_SECRET
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
