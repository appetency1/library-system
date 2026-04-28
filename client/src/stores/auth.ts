import { defineStore } from "pinia";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearHttpToken,
  setHttpToken
} from "../api/http";
import type { AuthSession, AuthUser, LoginPayload, RegisterPayload } from "../api/auth";
import { fetchMe, login, register } from "../api/auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  ready: boolean;
}

function readStoredSession(): AuthSession | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userRaw = localStorage.getItem(AUTH_USER_KEY);
  if (!token || !userRaw) {
    return null;
  }

  try {
    const user = JSON.parse(userRaw) as AuthUser;
    return { token, user };
  } catch {
    return null;
  }
}

function persistSession(session: AuthSession): void {
  localStorage.setItem(AUTH_TOKEN_KEY, session.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
  setHttpToken(session.token);
}

function clearSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  clearHttpToken();
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: null,
    user: null,
    ready: false
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    isStudent: (state) => state.user?.role === "student",
    isAdmin: (state) => state.user?.role === "admin"
  },
  actions: {
    restoreSession() {
      const session = readStoredSession();
      if (session) {
        this.token = session.token;
        this.user = session.user;
        setHttpToken(session.token);
      } else {
        clearSession();
      }
      this.ready = true;
    },
    async login(payload: LoginPayload) {
      const session = await login(payload);
      this.token = session.token;
      this.user = session.user;
      persistSession(session);
      return session;
    },
    async register(payload: RegisterPayload) {
      await register(payload);
      return this.login({ username: payload.username, password: payload.password });
    },
    async refreshProfile() {
      if (!this.token) {
        return null;
      }

      const user = await fetchMe();
      this.user = user;
      persistSession({ token: this.token, user });
      return user;
    },
    logout() {
      this.token = null;
      this.user = null;
      clearSession();
    }
  }
});
