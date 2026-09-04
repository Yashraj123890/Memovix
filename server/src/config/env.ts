import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  NODE_ENV: process.env.NODE_ENV || "development",

  /**
   * Auth (Milestone 8). Separate signing secrets for the short-lived
   * access token and the long-lived refresh token (blueprint §13.1). Dev
   * defaults only — production MUST override both with strong 256-bit+ secrets
   * set in the platform's secret manager, never committed.
   */
  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET ||
    "memovix_dev_access_secret_change_in_production_2026",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    "memovix_dev_refresh_secret_change_in_production_2026",

  /** Access token lifetime (minutes) — blueprint default 15. Env-overridable. */
  ACCESS_TOKEN_TTL_MINUTES: Number(process.env.ACCESS_TOKEN_TTL_MINUTES) || 15,
  /** Refresh token lifetime (days) — blueprint default 7. Env-overridable. */
  REFRESH_TOKEN_TTL_DAYS: Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 7,

  /**
   * Refresh-token cookie settings (blueprint §13.1: HttpOnly + Secure +
   * SameSite=Strict). `Secure` requires HTTPS, so it defaults ON in production
   * and OFF in development (http://localhost) — same pattern as
   * RATE_LIMIT_ENABLED. Path scopes the cookie to the auth routes only.
   */
  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME || "memovix_refresh",
  REFRESH_COOKIE_PATH: process.env.REFRESH_COOKIE_PATH || "/api/auth",
  COOKIE_SAMESITE:
    (process.env.COOKIE_SAMESITE as "strict" | "lax" | "none") || "strict",
  COOKIE_SECURE:
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === "true"
      : (process.env.NODE_ENV || "development") === "production",

  FRONTEND_URL:
    process.env.FRONTEND_URL || "http://localhost:3000",

  /**
   * Rate limiting (Milestone 1). Off by default in development so local
   * multi-role testing (repeated logins, AI iteration) isn't throttled; on by
   * default in production. Every window/max below is overridable per
   * environment. Set RATE_LIMIT_ENABLED=true locally to exercise the limits.
   */
  RATE_LIMIT_ENABLED:
    process.env.RATE_LIMIT_ENABLED !== undefined
      ? process.env.RATE_LIMIT_ENABLED === "true"
      : (process.env.NODE_ENV || "development") === "production",

  AUTH_RATE_LIMIT_WINDOW_MS:
    Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  AUTH_RATE_LIMIT_MAX: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,

  AI_RATE_LIMIT_WINDOW_MS:
    Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  AI_RATE_LIMIT_MAX: Number(process.env.AI_RATE_LIMIT_MAX) || 30,

  UPLOAD_RATE_LIMIT_WINDOW_MS:
    Number(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  UPLOAD_RATE_LIMIT_MAX: Number(process.env.UPLOAD_RATE_LIMIT_MAX) || 30,

  GENERAL_RATE_LIMIT_WINDOW_MS:
    Number(process.env.GENERAL_RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  GENERAL_RATE_LIMIT_MAX: Number(process.env.GENERAL_RATE_LIMIT_MAX) || 300,
};