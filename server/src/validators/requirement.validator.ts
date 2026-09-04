import { z } from "zod";
import { RequirementConfig } from "../config/requirement.config";

/**
 * Zod schemas for the Requirement Extractor + review flow (blueprint §3.2.4).
 *
 * Two levels of strictness, by design:
 *  - `extractedRequirementSchema` validates the AI's proposed JSON. It is
 *    lenient about `category` (the model may guess wrong or omit it) so a good
 *    requirement is never discarded over a bad label — the reviewer fixes it.
 *  - The persist-time schemas (`confirmRequirementsSchema`,
 *    `updateRequirementSchema`) are STRICT: a saved requirement's category must
 *    be one of the env-driven allowed values (RequirementConfig).
 *
 * Nothing is persisted from AI output directly — only human-confirmed values
 * pass through the persist-time schemas.
 */

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

/** The allowed, persist-time category: one of the configured values (case-insensitive). */
const strictCategory = z
  .string()
  .trim()
  .toLowerCase()
  .refine((value) => RequirementConfig.categories.includes(value), {
    message: `category must be one of: ${RequirementConfig.categories.join(", ")}`,
  });

/** Lenient candidate schema — used to validate raw AI JSON before review. */
export const extractedRequirementSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable().default(null)),
  category: z.preprocess(emptyToNull, z.string().trim().toLowerCase().max(50).nullable().default(null)),
  sourceExcerpt: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable().default(null)),
});

export const extractedRequirementsArraySchema = z.array(extractedRequirementSchema);

/** Body: POST /api/ai/requirements/extract — propose requirements (no persistence). */
export const extractRequirementsSchema = z.object({
  projectId: z.string().trim().min(1, "Project ID is required"),
  sourceFileId: z.string().trim().min(1).optional(),
});

/** A single human-confirmed requirement being persisted (Accept or Edit & Save). */
const confirmRequirementItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable().default(null)),
  category: z.preprocess(emptyToNull, strictCategory.nullable().default(null)),
  sourceExcerpt: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable().default(null)),
  sourceFileId: z.string().trim().min(1).optional(),
});

/** Body: POST /api/projects/:projectId/requirements — confirm & persist. */
export const confirmRequirementsSchema = z.object({
  requirements: z.array(confirmRequirementItemSchema).min(1, "At least one requirement is required"),
});

/** Body: PATCH /api/projects/:projectId/requirements/:requirementId — edit a saved requirement. */
export const updateRequirementSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    description: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable()).optional(),
    category: z.preprocess(emptyToNull, strictCategory.nullable()).optional(),
    sourceExcerpt: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable()).optional(),
    // Per-row baseline membership toggle. Lets a single requirement move between
    // the Baseline Scope and the New Requests (candidate) lane without the
    // all-or-nothing full replace that `setBaselineSchema` performs.
    isBaseline: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

/** Body: POST /api/projects/:projectId/requirements/reject — audit a rejection (persists nothing). */
export const rejectRequirementsSchema = z.object({
  requirements: z
    .array(z.object({ title: z.string().trim().min(1).max(255) }))
    .min(1, "At least one rejected requirement is required"),
});

/** Body: POST /api/projects/:projectId/requirements/baseline — set the project's baseline set. */
export const setBaselineSchema = z.object({
  requirementIds: z.array(z.string().trim().min(1)).min(1, "At least one requirement is required"),
});

export type ConfirmRequirementItem = z.infer<typeof confirmRequirementItemSchema>;
export type UpdateRequirementInput = z.infer<typeof updateRequirementSchema>;
