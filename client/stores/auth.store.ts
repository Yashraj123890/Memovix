"use client";

import { create } from "zustand";
import type { AuthUser } from "@/types/auth";

/**
 * Auth state is IN-MEMORY ONLY (M8). The access token is short-lived (15 min)
 * and must never touch localStorage — persisting it there is an XSS liability
 * (blueprint §13.1). The durable session lives entirely in the HttpOnly refresh
 * cookie the browser holds; on startup AuthBootstrap silently calls
 * POST /auth/refresh to mint a fresh access token from it. Because nothing is
 * persisted, `hasBootstrapped` tells the route guards whether that startup
 * refresh has completed yet (so they don't flash the login page first).
 */
interface AuthState {
  token: string | null;
  user: AuthUser | null;
  /** True once the startup refresh has resolved (success or failure). */
  hasBootstrapped: boolean;
  /**
   * M11: a just-logged-in CLIENT with multiple workspaces must pick one before
   * entering the app. This flag is the SINGLE synchronous source of truth for
   * that decision, so the login flow and RequireGuest navigate to the same
   * destination (no race, no dashboard flash). Set by useLogin; cleared once a
   * workspace is selected, on bootstrap (reload keeps the active workspace), and
   * on logout.
   */
  needsWorkspaceChoice: boolean;
}

interface AuthActions {
  setSession: (session: { token: string; user: AuthUser }) => void;
  clearSession: () => void;
  markBootstrapped: () => void;
  setNeedsWorkspaceChoice: (value: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set) => ({
  token: null,
  user: null,
  hasBootstrapped: false,
  needsWorkspaceChoice: false,
  setSession: ({ token, user }) => set({ token, user }),
  clearSession: () =>
    set({ token: null, user: null, needsWorkspaceChoice: false }),
  markBootstrapped: () => set({ hasBootstrapped: true }),
  setNeedsWorkspaceChoice: (value) => set({ needsWorkspaceChoice: value }),
}));

/**
 * Non-reactive accessors for use outside React (the Axios interceptors in
 * services/api/client.ts). Never call React hooks from that file.
 */
export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

export function setAuthSession(token: string, user: AuthUser): void {
  useAuthStore.getState().setSession({ token, user });
}

export function clearAuthSession(): void {
  useAuthStore.getState().clearSession();
}
