# Library Seat Reservation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working front-end/back-end separated library seat reservation system with student and admin workflows, SQLite persistence, and a polished demo UI.

**Architecture:** Use a single TypeScript monorepo-style workspace with `client/` for a Vue 3 SPA and `server/` for an Express API. Keep business rules in backend service modules so reservation conflicts, check-in/out state transitions, and role checks are testable without the UI. Persist data in SQLite, seed demo users/rooms/seats/notices on first run, and expose REST endpoints consumed by the frontend through a thin API client.

**Tech Stack:** Vue 3, Vite, TypeScript, Pinia, Vue Router, Axios, ECharts, Express, better-sqlite3, JSON Web Token, bcryptjs, Vitest, Supertest, tsx

---

### Task 1: Bootstrap the repo and shared runtime

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `README.md`
- Create: `client/index.html`
- Create: `client/vite.config.ts`
- Create: `client/tsconfig.json`
- Create: `client/src/main.ts`
- Create: `client/src/App.vue`
- Create: `server/tsconfig.json`

- [ ] **Step 1: Add workspace scripts and dependencies**

```json
{
  "name": "library-seat-reservation-system",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently -k \"npm:dev:web\" \"npm:dev:api\"",
    "dev:web": "vite --config client/vite.config.ts",
    "dev:api": "tsx watch server/src/index.ts",
    "build": "npm run build:web && npm run build:api",
    "build:web": "vite build --config client/vite.config.ts",
    "build:api": "tsc -p server/tsconfig.json",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Add the root TypeScript and app shell configs**

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": "."
  }
}
```

- [ ] **Step 3: Verify the empty app builds**

Run:
`npm run build`

Expected:
Both `build:web` and `build:api` complete once the minimal client and server entry files exist.

- [ ] **Step 4: Commit the bootstrap**

```bash
git add package.json tsconfig.base.json .gitignore README.md client server
git commit -m "chore: bootstrap library seat reservation system"
```

### Task 2: Implement SQLite storage and reservation rules

**Files:**
- Create: `server/src/db.ts`
- Create: `server/src/seed.ts`
- Create: `server/src/domain/types.ts`
- Create: `server/src/domain/time.ts`
- Create: `server/src/domain/reservation.service.ts`
- Create: `server/src/domain/auth.service.ts`
- Create: `server/src/domain/admin.service.ts`
- Create: `server/test/reservation.service.test.ts`
- Create: `server/test/auth.service.test.ts`

- [ ] **Step 1: Write failing tests for the business rules**

```ts
import { describe, expect, it } from "vitest";
import { reserveSeat } from "../src/domain/reservation.service.js";

describe("reservation.service", () => {
  it("rejects two active reservations for the same user and time slot", () => {
    const input = {
      userId: 1,
      seatId: 10,
      reserveDate: "2026-05-01",
      startTime: "09:00",
      endTime: "11:00",
      user: { id: 1, role: "student", status: "active" },
      seat: { id: 10, status: "active", roomStatus: "active" }
    };

    expect(() => reserveSeat(input)).toThrow("USER_SLOT_CONFLICT");
  });

  it("rejects two active reservations for the same seat and time slot", () => {
    const input = {
      userId: 2,
      seatId: 10,
      reserveDate: "2026-05-01",
      startTime: "09:00",
      endTime: "11:00",
      user: { id: 2, role: "student", status: "active" },
      seat: { id: 10, status: "active", roomStatus: "active" }
    };

    expect(() => reserveSeat(input)).toThrow("SEAT_SLOT_CONFLICT");
  });
});
```

- [ ] **Step 2: Implement the database wrapper and seed data**

```ts
// server/src/db.ts
import Database from "better-sqlite3";

export function openDb(filePath: string) {
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  return db;
}
```

Seed the first run with these demo accounts so the UI and API can be exercised immediately:

- Student: `student1` / `Password123!`
- Admin: `admin` / `Admin123!`

- [ ] **Step 3: Implement reservation and auth domain services**

```ts
// server/src/domain/reservation.service.ts
export function reserveSeat(input: ReserveSeatInput): ReservationRecord {
  assertUserIsActive(input.user);
  assertSeatIsBookable(input.seat);
  assertNoUserConflict(input.userId, input.reserveDate, input.startTime, input.endTime);
  assertNoSeatConflict(input.seatId, input.reserveDate, input.startTime, input.endTime);
  return insertReservation(input);
}
```

- [ ] **Step 4: Run the backend tests until they pass**

Run:
`npm test`

Expected:
The new reservation and auth tests pass, proving the conflict rules and password handling are wired correctly.

- [ ] **Step 5: Commit the data layer**

```bash
git add server/src server/test
git commit -m "feat: add reservation domain and sqlite storage"
```

### Task 3: Expose the REST API and role-based middleware

**Files:**
- Create: `server/src/app.ts`
- Create: `server/src/index.ts`
- Create: `server/src/middleware/auth.ts`
- Create: `server/src/middleware/error.ts`
- Create: `server/src/routes/auth.routes.ts`
- Create: `server/src/routes/student.routes.ts`
- Create: `server/src/routes/admin.routes.ts`
- Create: `server/test/api.integration.test.ts`

- [ ] **Step 1: Write integration tests for login and protected routes**

```ts
import request from "supertest";

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
```

- [ ] **Step 2: Implement the Express app, middleware, and routes**

```ts
// server/src/app.ts
import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import { studentRouter } from "./routes/student.routes.js";
import { adminRouter } from "./routes/admin.routes.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRouter);
  app.use("/api", studentRouter);
  app.use("/api/admin", adminRouter);
  return app;
}
```

- [ ] **Step 3: Verify the API responds with the right status codes**

Run:
`npm test`

Expected:
Auth, role guards, and reservation endpoints return the expected 200/201/401/403/409 responses.

- [ ] **Step 4: Commit the API layer**

```bash
git add server/src server/test
git commit -m "feat: expose reservation api with auth guards"
```

### Task 4: Build the Vue student experience

**Files:**
- Create: `client/src/router/index.ts`
- Create: `client/src/api/http.ts`
- Create: `client/src/api/auth.ts`
- Create: `client/src/api/library.ts`
- Create: `client/src/stores/auth.ts`
- Create: `client/src/layouts/StudentLayout.vue`
- Create: `client/src/views/LoginView.vue`
- Create: `client/src/views/RegisterView.vue`
- Create: `client/src/views/StudentDashboardView.vue`
- Create: `client/src/views/SeatReservationView.vue`
- Create: `client/src/views/MyReservationsView.vue`
- Create: `client/src/views/NoticeCenterView.vue`
- Create: `client/src/components/SeatGrid.vue`
- Create: `client/src/styles/main.css`

- [ ] **Step 1: Write a frontend smoke test in the form of a build target**

```ts
// client/vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: { port: 5173 }
});
```

- [ ] **Step 2: Implement router guards and the API client**

```ts
// client/src/api/http.ts
import axios from "axios";

export const http = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api" });
```

- [ ] **Step 3: Implement the student pages and seat grid**

```vue
<!-- client/src/components/SeatGrid.vue -->
<template>
  <div class="seat-grid">
    <button v-for="seat in seats" :key="seat.id" :disabled="!seat.available">
      {{ seat.seatNo }}
    </button>
  </div>
</template>
```

- [ ] **Step 4: Build and fix any type or template errors**

Run:
`npm run build:web`

Expected:
The SPA compiles cleanly, and the student pages render with route navigation, reservation creation, and reservation history.

- [ ] **Step 5: Commit the student experience**

```bash
git add client/src client/vite.config.ts
git commit -m "feat: add student reservation frontend"
```

### Task 5: Build the admin dashboard and analytics

**Files:**
- Create: `client/src/views/admin/AdminDashboardView.vue`
- Create: `client/src/views/admin/RoomManagementView.vue`
- Create: `client/src/views/admin/SeatManagementView.vue`
- Create: `client/src/views/admin/ReservationManagementView.vue`
- Create: `client/src/views/admin/UserManagementView.vue`
- Create: `client/src/views/admin/NoticeManagementView.vue`
- Create: `client/src/components/StatCard.vue`
- Create: `client/src/components/TrendChart.vue`
- Modify: `server/src/domain/admin.service.ts`

- [ ] **Step 1: Add admin stats and management endpoints to the backend**

```ts
export function getAdminStats() {
  return {
    todayReservations: 0,
    checkinRate: 0,
    seatUtilization: 0,
    topRooms: [],
    sevenDayTrend: []
  };
}
```

- [ ] **Step 2: Implement the admin views and charts**

```vue
<!-- client/src/components/StatCard.vue -->
<template>
  <section class="stat-card">
    <div class="label">{{ label }}</div>
    <div class="value">{{ value }}</div>
  </section>
</template>
```

- [ ] **Step 3: Verify admin routing and dashboard rendering**

Run:
`npm run build`

Expected:
Both the API build and web build succeed, and the admin dashboard renders the stats cards, filters, and charts.

- [ ] **Step 4: Commit the admin tools**

```bash
git add client/src server/src
git commit -m "feat: add admin dashboard and management views"
```

### Task 6: Polish docs and final verification

**Files:**
- Modify: `README.md`
- Create: `docs/runbook.md`
- Modify: `server/src/seed.ts`
- Modify: `client/src/styles/main.css`

- [ ] **Step 1: Document how to install, seed, and run the app**

```md
# Run locally
npm install
npm run dev
```

- [ ] **Step 2: Add final seed data and visual polish**

Add realistic demo users, rooms, seat ranges, notices, and a calmer dashboard palette so the system reads well in screenshots and on a projector.

- [ ] **Step 3: Run the final verification matrix**

Run:
`npm test`
`npm run build`

Expected:
The backend tests pass, the API build passes, and the frontend build passes.

- [ ] **Step 4: Commit the finished project**

```bash
git add README.md docs/runbook.md client/src server/src package.json tsconfig.base.json
git commit -m "chore: finish library seat reservation system"
```
