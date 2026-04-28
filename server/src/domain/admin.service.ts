import type { AppDatabase } from "../db.js";
import { todayDate } from "./time.js";
import type {
  AdminStats,
  NoticeRow,
  PublicUser,
  ReservationRow,
  RoomRow,
  SeatRow,
  UserRow,
  UserStatus
} from "./types.js";

function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    status: user.status,
    created_at: user.created_at
  };
}

export function listUsers(db: AppDatabase): PublicUser[] {
  return db
    .prepare(
      `
        SELECT id, username, password_hash, name, role, status, created_at
        FROM users
        ORDER BY id ASC
      `
    )
    .all()
    .map((row: UserRow) => toPublicUser(row));
}

export function setUserStatus(
  db: AppDatabase,
  userId: number,
  status: UserStatus
): PublicUser {
  db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, userId);
  const user = db
    .prepare(
      `
        SELECT id, username, password_hash, name, role, status, created_at
        FROM users
        WHERE id = ?
      `
    )
    .get(userId) as UserRow | undefined;

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  return toPublicUser(user);
}

export function listRooms(db: AppDatabase): RoomRow[] {
  return db
    .prepare(
      `
        SELECT id, name, location, description, status, created_at
        FROM rooms
        ORDER BY id ASC
      `
    )
    .all() as RoomRow[];
}

export function createRoom(
  db: AppDatabase,
  input: Pick<RoomRow, "name" | "location" | "description" | "status">
): RoomRow {
  const createdAt = new Date().toISOString();
  const result = db
    .prepare(
      `
        INSERT INTO rooms (name, location, description, status, created_at)
        VALUES (?, ?, ?, ?, ?)
      `
    )
    .run(input.name, input.location, input.description, input.status, createdAt);

  return db
    .prepare(
      `
        SELECT id, name, location, description, status, created_at
        FROM rooms
        WHERE id = ?
      `
    )
    .get(Number(result.lastInsertRowid)) as RoomRow;
}

export function updateRoom(
  db: AppDatabase,
  roomId: number,
  input: Pick<RoomRow, "name" | "location" | "description" | "status">
): RoomRow {
  db.prepare(
    `
      UPDATE rooms
      SET name = ?, location = ?, description = ?, status = ?
      WHERE id = ?
    `
  ).run(input.name, input.location, input.description, input.status, roomId);

  const room = db
    .prepare(
      `
        SELECT id, name, location, description, status, created_at
        FROM rooms
        WHERE id = ?
      `
    )
    .get(roomId) as RoomRow | undefined;

  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }
  return room;
}

export function listSeats(db: AppDatabase): Array<SeatRow & { room_name: string; room_status: string }> {
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
          rooms.name AS room_name,
          rooms.status AS room_status
        FROM seats
        JOIN rooms ON rooms.id = seats.room_id
        ORDER BY seats.id ASC
      `
    )
    .all() as Array<SeatRow & { room_name: string; room_status: string }>;
}

export function createSeat(
  db: AppDatabase,
  input: Pick<SeatRow, "room_id" | "seat_no" | "type" | "status">
): SeatRow {
  const createdAt = new Date().toISOString();
  const result = db
    .prepare(
      `
        INSERT INTO seats (room_id, seat_no, type, status, created_at)
        VALUES (?, ?, ?, ?, ?)
      `
    )
    .run(input.room_id, input.seat_no, input.type, input.status, createdAt);

  return db
    .prepare(
      `
        SELECT id, room_id, seat_no, type, status, created_at
        FROM seats
        WHERE id = ?
      `
    )
    .get(Number(result.lastInsertRowid)) as SeatRow;
}

export function updateSeat(
  db: AppDatabase,
  seatId: number,
  input: Pick<SeatRow, "room_id" | "seat_no" | "type" | "status">
): SeatRow {
  db.prepare(
    `
      UPDATE seats
      SET room_id = ?, seat_no = ?, type = ?, status = ?
      WHERE id = ?
    `
  ).run(input.room_id, input.seat_no, input.type, input.status, seatId);

  const seat = db
    .prepare(
      `
        SELECT id, room_id, seat_no, type, status, created_at
        FROM seats
        WHERE id = ?
      `
    )
    .get(seatId) as SeatRow | undefined;

  if (!seat) {
    throw new Error("SEAT_NOT_FOUND");
  }
  return seat;
}

export function listReservations(db: AppDatabase): ReservationRow[] {
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
        ORDER BY reserve_date DESC, start_time DESC, id DESC
      `
    )
    .all() as ReservationRow[];
}

export function listNotices(db: AppDatabase): NoticeRow[] {
  return db
    .prepare(
      `
        SELECT id, title, content, status, created_at
        FROM notices
        ORDER BY id ASC
      `
    )
    .all() as NoticeRow[];
}

export function createNotice(
  db: AppDatabase,
  input: Pick<NoticeRow, "title" | "content" | "status">
): NoticeRow {
  const createdAt = new Date().toISOString();
  const result = db
    .prepare(
      `
        INSERT INTO notices (title, content, status, created_at)
        VALUES (?, ?, ?, ?)
      `
    )
    .run(input.title, input.content, input.status, createdAt);

  return db
    .prepare(
      `
        SELECT id, title, content, status, created_at
        FROM notices
        WHERE id = ?
      `
    )
    .get(Number(result.lastInsertRowid)) as NoticeRow;
}

export function updateNotice(
  db: AppDatabase,
  noticeId: number,
  input: Pick<NoticeRow, "title" | "content" | "status">
): NoticeRow {
  db.prepare(
    `
      UPDATE notices
      SET title = ?, content = ?, status = ?
      WHERE id = ?
    `
  ).run(input.title, input.content, input.status, noticeId);

  const notice = db
    .prepare(
      `
        SELECT id, title, content, status, created_at
        FROM notices
        WHERE id = ?
      `
    )
    .get(noticeId) as NoticeRow | undefined;

  if (!notice) {
    throw new Error("NOTICE_NOT_FOUND");
  }
  return notice;
}

export function getAdminStats(db: AppDatabase): AdminStats {
  const today = todayDate();
  const todayReservations = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM reservations
        WHERE reserve_date = ?
          AND status IN ('reserved', 'checked_in', 'completed')
      `
    )
    .get(today) as { count: number };

  const todayCheckins = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM reservations
        WHERE reserve_date = ?
          AND status = 'checked_in'
      `
    )
    .get(today) as { count: number };

  const activeSeats = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM seats
        WHERE status = 'active'
      `
    )
    .get() as { count: number };

  const activeReservations = db
    .prepare(
      `
        SELECT COUNT(*) AS count
        FROM reservations
        WHERE reserve_date = ?
          AND status IN ('reserved', 'checked_in')
      `
    )
    .get(today) as { count: number };

  const topRooms = db
    .prepare(
      `
        SELECT
          rooms.id AS room_id,
          rooms.name AS room_name,
          COUNT(reservations.id) AS reservation_count
        FROM reservations
        JOIN rooms ON rooms.id = reservations.room_id
        WHERE reservations.reserve_date = ?
          AND reservations.status IN ('reserved', 'checked_in', 'completed')
        GROUP BY rooms.id, rooms.name
        ORDER BY reservation_count DESC, rooms.id ASC
        LIMIT 5
      `
    )
    .all(today) as AdminStats["topRooms"];

  const sevenDayTrend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return todayDate(date);
  }).map((date) => {
    const reservationCount = db
      .prepare(
        `
          SELECT COUNT(*) AS count
          FROM reservations
          WHERE reserve_date = ?
        `
      )
      .get(date) as { count: number };

    const checkinCount = db
      .prepare(
        `
          SELECT COUNT(*) AS count
          FROM reservations
          WHERE reserve_date = ?
            AND status = 'checked_in'
        `
      )
      .get(date) as { count: number };

    return {
      date,
      reservation_count: reservationCount.count,
      checkin_count: checkinCount.count
    };
  });

  const checkinRate =
    todayReservations.count === 0
      ? 0
      : Math.round((todayCheckins.count / todayReservations.count) * 1000) / 10;

  const seatUtilization =
    activeSeats.count === 0
      ? 0
      : Math.round((activeReservations.count / activeSeats.count) * 1000) / 10;

  return {
    todayReservations: todayReservations.count,
    checkinRate,
    seatUtilization,
    topRooms,
    sevenDayTrend
  };
}
