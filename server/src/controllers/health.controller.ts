import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { ProviderFactory } from "../ai/factory/provider.factory";

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Memovix Backend Running 🚀",
  });
};

/**
 * Liveness of the database (blueprint §4.5). A trivial `SELECT 1` confirms
 * the Postgres connection is usable without touching application tables.
 */
export const healthDb = async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ success: true, message: "Database reachable" });
  } catch {
    res.status(503).json({ success: false, message: "Database unreachable" });
  }
};

/**
 * Readiness of the AI layer (blueprint §4.5). Deliberately a config/
 * constructability check rather than a live inference call — UptimeRobot polls
 * this every few minutes and a real LLM round-trip would waste free-tier quota
 * and add latency. It confirms a chat provider can be resolved from the
 * configured AI_PROVIDER; a misconfiguration surfaces as 503.
 */
export const healthAi = async (_req: Request, res: Response) => {
  try {
    ProviderFactory.getChatProvider();
    res.status(200).json({ success: true, message: "AI provider configured" });
  } catch {
    res.status(503).json({ success: false, message: "AI provider unavailable" });
  }
};
