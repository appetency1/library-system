export type UserRole = "student" | "admin";
export type UserStatus = "active" | "disabled";
export type RoomStatus = "active" | "disabled";
export type SeatStatus = "active" | "disabled";
export type ReservationStatus =
  | "reserved"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "expired";
export type NoticeStatus = "published" | "draft";

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface PublicUser {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface RoomRow {
  id: number;
  name: string;
  location: string;
  description: string;
  status: RoomStatus;
  created_at: string;
}

export interface SeatRow {
  id: number;
  room_id: number;
  seat_no: string;
  type: string;
  status: SeatStatus;
  created_at: string;
}

export interface ReservationRow {
  id: number;
  user_id: number;
  room_id: number;
  seat_id: number;
  reserve_date: string;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  checkin_at: string | null;
  checkout_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface NoticeRow {
  id: number;
  title: string;
  content: string;
  status: NoticeStatus;
  created_at: string;
}

export interface ReserveSeatInput {
  userId: number;
  seatId: number;
  reserveDate: string;
  startTime: string;
  endTime: string;
}

export interface RegisterStudentInput {
  username: string;
  password: string;
  name: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface AuthSession {
  token: string;
  user: PublicUser;
}

export interface AdminStatsRoomRow {
  room_id: number;
  room_name: string;
  reservation_count: number;
}

export interface AdminStatsTrendRow {
  date: string;
  reservation_count: number;
  checkin_count: number;
}

export interface AdminStats {
  todayReservations: number;
  checkinRate: number;
  seatUtilization: number;
  topRooms: AdminStatsRoomRow[];
  sevenDayTrend: AdminStatsTrendRow[];
}
