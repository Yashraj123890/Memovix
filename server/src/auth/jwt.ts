import { randomUUID, createHash } from "node:crypto";
import jwt, { Secret } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../types/user-role";

/**
 * Access + refresh token pair (blueprint §13.1). The legacy single-token
 * helpers (generateToken/verifyToken + JWT_SECRET) were removed in the M8
 * cleanup once every flow moved to this pair.
 */
export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
}

/** Refresh-token claims — identifies the user and the specific token (jti). */
export interface RefreshTokenPayload {
  userId: string;
  jti: string;
}

const ACCESS_SECRET: Secret = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET: Secret = env.JWT_REFRESH_SECRET;

/** Short-lived access token (default 15m), sent as `Authorization: Bearer`. */
export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export interface SignedRefreshToken {
  token: string;
  jti: string;
  expiresAt: Date;
}

/**
 * Long-lived refresh token (default 7d) carrying a unique `jti` so it can be
 * tracked and revoked server-side (see RefreshTokenRepository). Returns the
 * token plus its jti and absolute expiry for persistence and cookie maxAge.
 */
export function signRefreshToken(userId: string): SignedRefreshToken {
  const jti = randomUUID();
  const token = jwt.sign({ userId, jti } satisfies RefreshTokenPayload, REFRESH_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`,
  });
  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  return { token, jti, expiresAt };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}

/**
 * SHA-256 of a refresh token's `jti`. Only sha256(jti) is stored in the
 * refresh_tokens allowlist (never the raw jti or token), so the DB stays
 * independent of the JWT representation and a table leak exposes nothing usable
 * (blueprint §11.2 "hash the token"). On refresh we verify the JWT, extract the
 * jti, hash it here, and look the row up by that hash.
 */
export function hashToken(jti: string): string {
  return createHash("sha256").update(jti).digest("hex");
}
