import { apiClient } from "./client";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  AuthSession,
  LoginRequest,
  LoginResponseData,
  RefreshResponseData,
  RegisterRequest,
  RegisterResponseData,
} from "@/types/auth";

const AUTH_ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  me: "/auth/me",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
} as const;

/**
 * Authentication API service. Both endpoints already return the shared
 * success envelope on 2xx (docs/api-notes.md "Common Response Format");
 * failures come back as non-2xx and are thrown by Axios as AxiosError,
 * which callers surface via utils/error.ts.
 */
export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponseData> {
    const response = await apiClient.post<
      ApiSuccessResponse<LoginResponseData>
    >(AUTH_ENDPOINTS.login, payload);
    return response.data.data;
  },

  async register(payload: RegisterRequest): Promise<RegisterResponseData> {
    const response = await apiClient.post<
      ApiSuccessResponse<RegisterResponseData>
    >(AUTH_ENDPOINTS.register, payload);
    return response.data.data;
  },

  async getSession(): Promise<AuthSession> {
    const response = await apiClient.get<ApiSuccessResponse<AuthSession>>(
      AUTH_ENDPOINTS.me,
    );
    return response.data.data;
  },

  /**
   * Exchange the HttpOnly refresh cookie for a new access token (rotates the
   * cookie server-side). Sent with credentials so the browser includes the
   * cookie. 401 means no/invalid session.
   */
  async refresh(): Promise<RefreshResponseData> {
    const response = await apiClient.post<
      ApiSuccessResponse<RefreshResponseData>
    >(AUTH_ENDPOINTS.refresh);
    return response.data.data;
  },

  /** Revoke the refresh session server-side and clear the cookie. */
  async logout(): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.logout);
  },

  /**
   * Trigger the existing secure password-reset flow: the backend emails a
   * time-limited reset link to `email` (POST /auth/forgot-password). Always
   * resolves 200 with a generic message — the server never reveals whether the
   * address exists. This endpoint returns a bare `{ message }`, not the shared
   * success envelope.
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      AUTH_ENDPOINTS.forgotPassword,
      { email },
    );
    return response.data;
  },

  /**
   * Complete a password reset with the token from the emailed link
   * (POST /auth/reset-password). The backend validates the token (single-use,
   * expiring), hashes the new password, and marks the token used. Returns a
   * bare `{ message }`; invalid/expired/used tokens come back as a non-2xx
   * error whose message the caller surfaces.
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      AUTH_ENDPOINTS.resetPassword,
      { token, password },
    );
    return response.data;
  },
};
