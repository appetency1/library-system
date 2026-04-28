import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

export type AppDatabase = any;

export function openDb(filePath: string): AppDatabase {
  const db = new Database(filePath);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  return db;
}

export function initializeSchema(db: AppDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
      status TEXT NOT NULL CHECK (status IN ('active', 'disabled')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active', 'disabled')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seats (
      id INTEGER PRIMARY KEY,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      seat_no TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active', 'disabled')),
      created_at TEXT NOT NULL,
      UNIQUE (room_id, seat_no)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      seat_id INTEGER NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
      reserve_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT NOT NULL CHECK (
        status IN ('reserved', 'checked_in', 'completed', 'cancelled', 'expired')
      ),
      checkin_at TEXT,
      checkout_at TEXT,
      cancelled_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_user_date
      ON reservations(user_id, reserve_date);

    CREATE INDEX IF NOT EXISTS idx_reservations_seat_date
      ON reservations(seat_id, reserve_date);

    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('published', 'draft')),
      created_at TEXT NOT NULL
    );
  `);
}

export function seedDatabase(db: AppDatabase): void {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get() as {
    count: number;
  };
  if (userCount.count > 0) {
    return;
  }

  const now = new Date().toISOString();
  const studentHash = bcrypt.hashSync("Password123!", 10);
  const adminHash = bcrypt.hashSync("Admin123!", 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password_hash, name, role, status, created_at)
    VALUES (@id, @username, @password_hash, @name, @role, @status, @created_at)
  `);

  insertUser.run({
    id: 1,
    username: "student1",
    password_hash: studentHash,
    name: "学生一号",
    role: "student",
    status: "active",
    created_at: now
  });

  insertUser.run({
    id: 2,
    username: "admin",
    password_hash: adminHash,
    name: "管理员",
    role: "admin",
    status: "active",
    created_at: now
  });

  insertUser.run({
    id: 3,
    username: "student2",
    password_hash: studentHash,
    name: "学生二号",
    role: "student",
    status: "active",
    created_at: now
  });

  const insertRoom = db.prepare(`
    INSERT INTO rooms (id, name, location, description, status, created_at)
    VALUES (@id, @name, @location, @description, @status, @created_at)
  `);

  insertRoom.run({
    id: 1,
    name: "第一阅览室",
    location: "图书馆一层东区",
    description: "安静学习区",
    status: "active",
    created_at: now
  });

  insertRoom.run({
    id: 2,
    name: "第二阅览室",
    location: "图书馆二层西区",
    description: "靠窗自习区",
    status: "active",
    created_at: now
  });

  const insertSeat = db.prepare(`
    INSERT INTO seats (id, room_id, seat_no, type, status, created_at)
    VALUES (@id, @room_id, @seat_no, @type, @status, @created_at)
  `);

  const seats = [
    ...Array.from({ length: 8 }, (_, index) => ({
      id: 10 + index,
      room_id: 1,
      seat_no: `A-${String(index + 1).padStart(2, "0")}`,
      type: index % 3 === 2 ? "电源座" : "普通座",
      status: "active",
      created_at: now
    })),
    ...Array.from({ length: 8 }, (_, index) => ({
      id: 20 + index,
      room_id: 2,
      seat_no: `B-${String(index + 1).padStart(2, "0")}`,
      type: index % 2 === 0 ? "靠窗座" : "普通座",
      status: "active",
      created_at: now
    }))
  ];

  for (const seat of seats) {
    insertSeat.run(seat);
  }

  const insertNotice = db.prepare(`
    INSERT INTO notices (id, title, content, status, created_at)
    VALUES (@id, @title, @content, @status, @created_at)
  `);

  insertNotice.run({
    id: 1,
    title: "系统上线通知",
    content: "图书馆座位预约系统已开放试运行。",
    status: "published",
    created_at: now
  });

  insertNotice.run({
    id: 2,
    title: "预约提示",
    content: "请按时签到，逾期未签到的预约将被标记为过期。",
    status: "published",
    created_at: now
  });
}

export function createDatabase(filePath = ":memory:"): AppDatabase {
  const db = openDb(filePath);
  initializeSchema(db);
  seedDatabase(db);
  return db;
}
