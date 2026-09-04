import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { API_TIMEOUT_MS } from "@/constants/api";
import { getAuthToken, useAuthStore } from "@/stores/auth.store";
import type { ApiSuccessResponse } from "@/types/api";
import type { RefreshResponseData } from "@/types/auth";

/**
 * Shared Axios instance used by every feature's API service layer.
 *
 * `withCredentials: true` so the browser sends/receives the HttpOnly refresh
 * cookie (M8, blueprint §13.1). The access token lives only in memory
 * (stores/auth.store.ts) and is attached as a Bearer header per request; when
 * it expires the response interceptor transparently refreshes it once and
 * retries — see the single-flight logic below.
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the in-memory access token to every request.
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Endpoints that must never trigger a refresh-and-retry: refreshing the refresh
 * call would recurse, and login/register 401s are genuine credential failures.
 */
const REFRESH_EXEMPT_PATHS = ["/auth/refresh", "/auth/login", "/auth/register"];

// Single-flight refresh: many concurrent 401s share ONE /auth/refresh call.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<ApiSuccessResponse<RefreshResponseData>>("/auth/refresh")
      .then((response) => {
        const { accessToken, user } = response.data.data;
        useAuthStore.getState().setSession({ token: accessToken, user });
        return accessToken;
      })
      .finally(() => {
        // Clear once settled so the next 401 (after this token also expires)
        // starts a fresh single-flight refresh.
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const isUnauthorized = error.response?.status === 401;
    const isExempt =
      !original ||
      original._retry ||
      REFRESH_EXEMPT_PATHS.some((path) => original.url?.includes(path));

    if (!isUnauthorized || isExempt) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return apiClient(original);
    } catch (refreshError) {
      // Refresh failed → the session is truly gone. Clearing it makes the route
      // guards (RequireAuth) redirect to /login.
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    }
  },
);
