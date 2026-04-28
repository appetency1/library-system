import { http } from "./http";

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  role: "student" | "admin";
  status: "active" | "disabled";
  created_at: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  name: string;
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const { data } = await http.post<AuthSession>("/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await http.post<AuthUser>("/auth/register", payload);
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await http.get<AuthUser>("/auth/me");
  return data;
}
