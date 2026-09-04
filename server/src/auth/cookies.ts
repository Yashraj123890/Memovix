import { Response } from "express";
import { env } from "../config/env";

/**
 * Refresh-token cookie helpers (blueprint §13.1: HttpOnly + Secure +
 * SameSite=Strict). All flags come from env (COOKIE_SECURE / COOKIE_SAMESITE /
 * REFRESH_COOKIE_NAME / REFRESH_COOKIE_PATH) so dev (http://localhost, Secure
 * off) and production (HTTPS, Secure on) are configured, not hard-coded.
 * `HttpOnly` is always on — the refresh token must never be readable by JS.
 *
 * Consumed by the auth flow in Phase 2; created here in Phase 1.
 */
function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    path: env.REFRESH_COOKIE_PATH,
  } as const;
}

/** Set the refresh-token cookie with a maxAge matching the token's lifetime. */
export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(env.REFRESH_COOKIE_NAME, token, {
    ...baseCookieOptions(),
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

/** Clear the refresh-token cookie (logout). Flags must match those used to set it. */
export function clearRefreshCookie(res: Response): void {
  res.clearCookie(env.REFRESH_COOKIE_NAME, baseCookieOptions());
}
