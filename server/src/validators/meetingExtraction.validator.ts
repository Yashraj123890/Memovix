import { z } from "zod";
import { DecisionCategory } from "@prisma/client";

/**
 * Validates the AI's combined extraction output (Meeting Notes v2). LENIENT by
 * design — like the requirement extractor, a good decision/action item is never
 * discarded over a bad label; the human reviewer fixes it before confirm. The
 * STRICT persist-time schema lives in meetingNote.validator.ts (confirm).
 */

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const DECISION_CATEGORIES = Object.values(DecisionCategory) as string[];

/** AI category: uppercase and coerce anything unrecognized to OTHER (reviewer can fix). */
const lenientCategory = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .transform((v) => (DECISION_CATEGORIES.includes(v) ? v : "OTHER"));

export const extractedDecisionSchema = z.object({
  description: z.string().trim().min(1).max(2000),
  category: z.preprocess((v) => (v == null ? "OTHER" : v), lenientCategory),
});

export const extractedActionItemSchema = z.object({
  description: z.string().trim().min(1).max(2000),
  owner: z.preprocess(emptyToNull, z.string().trim().max(255).nullable().default(null)),
  dueDate: z.preprocess(emptyToNull, z.string().trim().max(255).nullable().default(null)),
});

/** The whole AI object. Arrays default to [] so a missing key never fails the job. */
export const meetingExtractionResultSchema = z.object({
  summary: z.string().trim().max(20000).default(""),
  decisions: z.array(extractedDecisionSchema).default([]),
  actionItems: z.array(extractedActionItemSchema).default([]),
});

export type ParsedMeetingExtraction = z.infer<typeof meetingExtractionResultSchema>;
