import type { ErrorRequestHandler, RequestHandler } from "express";

const conflictMessages = new Set([
  "USER_SLOT_CONFLICT",
  "SEAT_SLOT_CONFLICT",
  "USERNAME_TAKEN",
  "SEAT_UNAVAILABLE"
]);

const forbiddenMessages = new Set(["FORBIDDEN"]);

const notFoundMessages = new Set([
  "USER_NOT_FOUND",
  "ROOM_NOT_FOUND",
  "SEAT_NOT_FOUND",
  "RESERVATION_NOT_FOUND",
  "NOTICE_NOT_FOUND"
]);

const authMessages = new Set(["AUTH_INVALID_CREDENTIALS", "AUTH_REQUIRED"]);

const validationMessages = new Set([
  "INVALID_DATE",
  "INVALID_TIME",
  "INVALID_TIME_RANGE",
  "WEAK_PASSWORD",
  "INVALID_USERNAME",
  "INVALID_NAME",
  "USER_DISABLED",
  "RESERVATION_NOT_CANCELLABLE",
  "RESERVATION_NOT_CHECKINABLE",
  "RESERVATION_NOT_CHECKOUTABLE",
  "CHECKIN_TOO_EARLY",
  "RESERVATION_EXPIRED",
  "USER_CREATE_FAILED",
  "RESERVATION_CREATE_FAILED",
  "RESERVATION_UPDATE_FAILED"
]);

function statusFor(message: string): number {
  if (authMessages.has(message)) return 401;
  if (forbiddenMessages.has(message)) return 403;
  if (notFoundMessages.has(message)) return 404;
  if (conflictMessages.has(message)) return 409;
  if (validationMessages.has(message)) return 400;
  return 500;
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ message: "NOT_FOUND" });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof Error) {
    res.status(statusFor(error.message)).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
};

