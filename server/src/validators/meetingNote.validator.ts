import { z } from "zod";
import { DecisionCategory } from "@prisma/client";

/**
 * Zod schemas for the Meeting Notes Summarizer (blueprint §3.2.7).
 * `summarize` takes raw notes and returns an ephemeral summary for review.
 * `save` persists the raw notes plus the reviewed (possibly edited) summary.
 */

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

/** Body: POST /api/ai/meeting-notes/summarize — AI summary for review (no persistence). */
export const summarizeMeetingNoteSchema = z.object({
  projectId: z.string().trim().min(1, "Project ID is required"),
  rawText: z.string().trim().min(1, "Meeting notes text is required").max(50000),
});

/** Body: POST /api/projects/:projectId/meeting-notes — persist reviewed note. */
export const saveMeetingNoteSchema = z.object({
  rawText: z.string().trim().min(1, "Meeting notes text is required").max(50000),
  summary: z.string().trim().min(1, "Summary is required").max(20000),
});

export type SaveMeetingNoteInput = z.infer<typeof saveMeetingNoteSchema>;

// --- Meeting Notes v2: ingest (transcript → async extraction) + confirm --------

/**
 * Body: POST /api/projects/:projectId/meeting-notes/ingest.
 * `transcript` is text only — the recording is transcribed in the browser and
 * never uploaded. The 100k cap enforces the soft length limit (~15 min of
 * speech); longer meetings should be split (Phase 0: single-pass extraction is
 * reliable for 5–10 min on the local model).
 */
export const ingestMeetingNoteSchema = z.object({
  transcript: z
    .string()
    .trim()
    .min(1, "Transcript is required")
    .max(100000, "Transcript is too long — split long meetings into parts"),
  source: z.string().trim().max(64).optional(),
});

/** Persist-time (STRICT) category: must be a real DecisionCategory. */
const strictDecisionCategory = z.preprocess(
  (v) => (typeof v === "string" ? v.toUpperCase() : v),
  z.nativeEnum(DecisionCategory)
);

const confirmDecisionSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(2000),
  category: strictDecisionCategory,
});

const confirmActionItemSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(2000),
  owner: z.preprocess(emptyToNull, z.string().trim().max(255).nullable().default(null)),
  dueDate: z.preprocess(emptyToNull, z.string().trim().max(255).nullable().default(null)),
});

/**
 * Body: POST /api/projects/:projectId/meeting-notes/:meetingNoteId/confirm.
 * The human-reviewed (possibly edited) proposals to persist. Both arrays may be
 * empty (reviewer kept nothing) — the endpoint is then a no-op audit event.
 */
export const confirmMeetingNoteSchema = z.object({
  decisions: z.array(confirmDecisionSchema).default([]),
  actionItems: z.array(confirmActionItemSchema).default([]),
});

export type IngestMeetingNoteInput = z.infer<typeof ingestMeetingNoteSchema>;
export type ConfirmMeetingNoteInput = z.infer<typeof confirmMeetingNoteSchema>;
