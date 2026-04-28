import axios from "axios";

export const AUTH_TOKEN_KEY = "library-seat-reservation-token";
export const AUTH_USER_KEY = "library-seat-reservation-user";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api"
});

export function setHttpToken(token: string): void {
  http.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearHttpToken(): void {
  delete http.defaults.headers.common.Authorization;
}
