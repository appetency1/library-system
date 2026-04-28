import { http } from "./http";

export interface Notice {
  id: number;
  title: string;
  content: string;
  status: "published" | "draft";
  created_at: string;
}

export interface Room {
  id: number;
  name: string;
  location: string;
  description: string;
  status: "active" | "disabled";
  created_at: string;
}

export interface Seat {
  id: number;
  roomId: number;
  seatNo: string;
  type: string;
  status: "active" | "disabled";
  roomName: string;
  roomStatus: "active" | "disabled";
  available: boolean;
}

export interface Reservation {
  id: number;
  user_id: number;
  room_id: number;
  seat_id: number;
  reserve_date: string;
  start_time: string;
  end_time: string;
  status: "reserved" | "checked_in" | "completed" | "cancelled" | "expired";
  checkin_at: string | null;
  checkout_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  room_name?: string;
  room_location?: string;
  seat_no?: string;
}

export interface CreateReservationPayload {
  seatId: number;
  reserveDate: string;
  startTime: string;
  endTime: string;
}

export async function fetchNotices(): Promise<Notice[]> {
  const { data } = await http.get<Notice[]>("/notices");
  return data;
}

export async function fetchRooms(): Promise<Room[]> {
  const { data } = await http.get<Room[]>("/rooms");
  return data;
}

export async function fetchSeats(params: {
  roomId?: number;
  reserveDate?: string;
  startTime?: string;
  endTime?: string;
}): Promise<Seat[]> {
  const { data } = await http.get<Seat[]>("/seats", { params });
  return data;
}

export async function createReservation(
  payload: CreateReservationPayload
): Promise<Reservation> {
  const { data } = await http.post<Reservation>("/reservations", payload);
  return data;
}

export async function fetchMyReservations(): Promise<Reservation[]> {
  const { data } = await http.get<Reservation[]>("/my/reservations");
  return data;
}

export async function cancelReservation(reservationId: number): Promise<Reservation> {
  const { data } = await http.post<Reservation>(`/reservations/${reservationId}/cancel`);
  return data;
}

export async function checkInReservation(reservationId: number): Promise<Reservation> {
  const { data } = await http.post<Reservation>(`/reservations/${reservationId}/checkin`);
  return data;
}

export async function checkOutReservation(reservationId: number): Promise<Reservation> {
  const { data } = await http.post<Reservation>(`/reservations/${reservationId}/checkout`);
  return data;
}
