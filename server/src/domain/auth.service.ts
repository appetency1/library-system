import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AppDatabase } from "../db.js";
import type {
  AuthSession,
  LoginInput,
  PublicUser,
  RegisterStudentInput,
  UserRow
} from "./types.js";

export const JWT_SECRET = process.env.JWT_SECRET ?? "library-seat-reservation-secret";

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

function getUserByUsername(db: AppDatabase, username: string): UserRow | undefined {
  return db
    .prepare(
      `
        SELECT id, username, password_hash, name, role, status, created_at
        FROM users
        WHERE username = ?
      `
    )
    .get(username) as UserRow | undefined;
}

function getUserById(db: AppDatabase, userId: number): UserRow | undefined {
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

export function registerStudent(
  db: AppDatabase,
  input: RegisterStudentInput
): PublicUser {
  const username = input.username.trim();
  const name = input.name.trim();

  if (!username) {
    throw new Error("INVALID_USERNAME");
  }
  if (input.password.length < 8) {
    throw new Error("WEAK_PASSWORD");
  }
  if (!name) {
    throw new Error("INVALID_NAME");
  }
  if (getUserByUsername(db, username)) {
    throw new Error("USERNAME_TAKEN");
  }

  const createdAt = new Date().toISOString();
  const passwordHash = bcrypt.hashSync(input.password, 10);
  const result = db
    .prepare(
      `
        INSERT INTO users (username, password_hash, name, role, status, created_at)
        VALUES (?, ?, ?, 'student', 'active', ?)
      `
    )
    .run(username, passwordHash, name, createdAt);

  const created = getUserById(db, Number(result.lastInsertRowid));
  if (!created) {
    throw new Error("USER_CREATE_FAILED");
  }

  return toPublicUser(created);
}

export function authenticateUser(
  db: AppDatabase,
  input: LoginInput,
  jwtSecret = JWT_SECRET
): AuthSession {
  const user = getUserByUsername(db, input.username.trim());
  if (!user || user.status !== "active") {
    throw new Error("AUTH_INVALID_CREDENTIALS");
  }
  if (!bcrypt.compareSync(input.password, user.password_hash)) {
    throw new Error("AUTH_INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    jwtSecret,
    { expiresIn: "12h" }
  );

  return {
    token,
    user: toPublicUser(user)
  };
}

export function getAuthenticatedUser(db: AppDatabase, userId: number): PublicUser {
  const user = getUserById(db, userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }
  return toPublicUser(user);
}

export function verifyToken(
  token: string,
  jwtSecret = JWT_SECRET
): { sub: number; username: string; role: string } {
  const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
  return {
    sub: Number(payload.sub),
    username: String(payload.username),
    role: String(payload.role)
  };
}
