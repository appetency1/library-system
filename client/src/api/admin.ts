import { http } from "./http";
import type { AuthUser } from "./auth";
import type { Notice, Reservation, Room } from "./library";

export interface AdminStatsRoom {
  room_id: number;
  room_name: string;
  reservation_count: number;
}

export interface AdminTrendPoint {
  date: string;
  reservation_count: number;
  checkin_count: number;
}

export interface AdminStats {
  todayReservations: number;
  checkinRate: number;
  seatUtilization: number;
  topRooms: AdminStatsRoom[];
  sevenDayTrend: AdminTrendPoint[];
}

export interface AdminSeat {
  id: number;
  room_id: number;
  seat_no: string;
  type: string;
  status: "active" | "disabled";
  created_at: string;
  room_name: string;
  room_status: "active" | "disabled";
}

export interface RoomPayload {
  name: string;
  location: string;
  description: string;
  status: "active" | "disabled";
}

export interface SeatPayload {
  room_id: number;
  seat_no: string;
  type: string;
  status: "active" | "disabled";
}

export interface NoticePayload {
  title: string;
  content: string;
  status: "published" | "draft";
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data } = await http.get<AdminStats>("/admin/stats");
  return data;
}

export async function fetchAdminUsers(): Promise<AuthUser[]> {
  const { data } = await http.get<AuthUser[]>("/admin/users");
  return data;
}

export async function updateUserStatus(
  userId: number,
  status: "active" | "disabled"
): Promise<AuthUser> {
  const { data } = await http.patch<AuthUser>(`/admin/users/${userId}/status`, { status });
  return data;
}

export async function fetchAdminRooms(): Promise<Room[]> {
  const { data } = await http.get<Room[]>("/admin/rooms");
  return data;
}

export async function createAdminRoom(payload: RoomPayload): Promise<Room> {
  const { data } = await http.post<Room>("/admin/rooms", payload);
  return data;
}

export async function updateAdminRoom(roomId: number, payload: RoomPayload): Promise<Room> {
  const { data } = await http.patch<Room>(`/admin/rooms/${roomId}`, payload);
  return data;
}

export async function fetchAdminSeats(): Promise<AdminSeat[]> {
  const { data } = await http.get<AdminSeat[]>("/admin/seats");
  return data;
}

export async function createAdminSeat(payload: SeatPayload): Promise<AdminSeat> {
  const { data } = await http.post<AdminSeat>("/admin/seats", payload);
  return data;
}

export async function updateAdminSeat(seatId: number, payload: SeatPayload): Promise<AdminSeat> {
  const { data } = await http.patch<AdminSeat>(`/admin/seats/${seatId}`, payload);
  return data;
}

export async function fetchAdminReservations(): Promise<Reservation[]> {
  const { data } = await http.get<Reservation[]>("/admin/reservations");
  return data;
}

export async function adminCancelReservation(reservationId: number): Promise<Reservation> {
  const { data } = await http.post<Reservation>(`/admin/reservations/${reservationId}/cancel`);
  return data;
}

export async function fetchAdminNotices(): Promise<Notice[]> {
  const { data } = await http.get<Notice[]>("/admin/notices");
  return data;
}

export async function createAdminNotice(payload: NoticePayload): Promise<Notice> {
  const { data } = await http.post<Notice>("/admin/notices", payload);
  return data;
}

export async function updateAdminNotice(
  noticeId: number,
  payload: NoticePayload
): Promise<Notice> {
  const { data } = await http.patch<Notice>(`/admin/notices/${noticeId}`, payload);
  return data;
}

export async function deleteAdminNotice(noticeId: number): Promise<void> {
  await http.delete(`/admin/notices/${noticeId}`);
}
