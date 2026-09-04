import { z } from "zod";
import { ScopeConfig } from "../config/scope.config";

/**
 * Validates the LLM's scope-classification JSON (blueprint §8.10 Step 2) before
 * anything is persisted — raw model output is never trusted directly. On a
 * malformed shape the workflow surfaces an error instead of writing a flag.
 */
const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

export const scopeClassificationSchema = z.object({
  classification: z.enum([...ScopeConfig.classifications] as [string, ...string[]]),
  rationale: z.string().trim().min(1).max(5000),
  related_baseline_id: z.preprocess(
    emptyToNull,
    z.string().trim().nullable().default(null)
  ),
});

export type ScopeClassificationOutput = z.infer<typeof scopeClassificationSchema>;

/**
 * Body: POST /api/projects/:projectId/scope-flags/:flagId/resolve — the
 * freelancer's action on a flag (blueprint §3.2.6). `accept_into_scope` promotes
 * the requirement into the baseline and logs a decision; `decline` resolves
 * without touching the baseline; `propose_change_order` leaves the flag pending.
 */
export const resolveScopeFlagSchema = z.object({
  action: z.enum(["accept_into_scope", "decline", "propose_change_order"]),
});

export type ResolveScopeFlagInput = z.infer<typeof resolveScopeFlagSchema>;
