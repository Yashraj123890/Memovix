import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { env } from "../config/env";

/**
 * Rate limiters (blueprint §13.5 + production hardening). Four route-specific
 * tiers, all env-configurable (see config/env.ts) and all skipped when
 * RATE_LIMIT_ENABLED is false — which is the default in development, so local
 * multi-role testing and AI iteration are never throttled.
 *
 *  - authLimiter    : login / register / password-reset — brute-force guard.
 *  - aiLimiter      : /api/ai/* — protects the free-tier LLM quota / cost.
 *  - uploadLimiter  : file upload — caps expensive multipart/storage work.
 *  - generalLimiter : baseline abuse protection on every route.
 *
 * authLimiter uses the library's default (IP-based, IPv6-safe) key generator.
 * The others key by authenticated user id when present, falling back to IP;
 * `validate: false` is set on those because this express-rate-limit build does
 * not export the `ipKeyGenerator` helper the IPv6 fallback validation expects.
 */
const userOrIpKey = (req: Request): string => {
  const userId = (req as AuthenticatedRequest).user?.userId;
  return userId ? `user:${userId}` : `ip:${req.ip ?? "unknown"}`;
};

const tooManyRequests = (_req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    message: "Too many requests, please try again later.",
  });
};

const skipWhenDisabled = () => !env.RATE_LIMIT_ENABLED;

export const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooManyRequests,
  skip: skipWhenDisabled,
});

export const aiLimiter = rateLimit({
  windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
  limit: env.AI_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  validate: false,
  handler: tooManyRequests,
  skip: skipWhenDisabled,
});

export const uploadLimiter = rateLimit({
  windowMs: env.UPLOAD_RATE_LIMIT_WINDOW_MS,
  limit: env.UPLOAD_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  validate: false,
  handler: tooManyRequests,
  skip: skipWhenDisabled,
});

export const generalLimiter = rateLimit({
  windowMs: env.GENERAL_RATE_LIMIT_WINDOW_MS,
  limit: env.GENERAL_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  validate: false,
  handler: tooManyRequests,
  skip: skipWhenDisabled,
});
