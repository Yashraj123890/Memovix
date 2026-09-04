/**
 * Mirrors the MeetingNote model in server/prisma/schema.prisma and the shapes
 * returned by the meeting-note endpoints (server/src/controllers/
 * meetingNote.controller.ts). Meeting Notes v2 adds the async extraction status,
 * the review-queue proposals, and confirmed ActionItem rows.
 */
export interface MeetingNoteAuthor {
  id: string;
  name: string;
}

export type MeetingNoteStatus =
  | "TRANSCRIBING"
  | "EXTRACTING"
  | "READY"
  | "FAILED";

export type ActionItemStatus = "OPEN" | "DONE";

/** Confirmed action item (persisted). */
export interface ActionItem {
  id: string;
  projectId: string;
  meetingNoteId: string;
  description: string;
  owner: string | null;
  dueDate: string | null;
  status: ActionItemStatus;
  createdAt: string;
}

/** AI-proposed decision held on the note for human review (before confirm). */
export interface ProposedDecision {
  description: string;
  category: string;
}

/** AI-proposed action item held on the note for human review (before confirm). */
export interface ProposedActionItem {
  description: string;
  owner?: string | null;
  dueDate?: string | null;
}

export interface MeetingNote {
  id: string;
  projectId: string;
  /** The transcript (pasted, or browser-Whisper output) — the auditable source. */
  rawText: string;
  summary: string | null;
  status: MeetingNoteStatus;
  error: string | null;
  transcriptSource: string | null;
  proposedDecisions: ProposedDecision[] | null;
  proposedActionItems: ProposedActionItem[] | null;
  actionItems?: ActionItem[];
  createdById: string;
  createdAt: string;
  createdBy?: MeetingNoteAuthor;
}

export type SavedMeetingNote = MeetingNote;

/** POST /ai/meeting-notes/summarize returns an ephemeral summary for review. */
export interface MeetingNoteSummary {
  summary: string;
}

/** Payloads for the v2 confirm endpoint. */
export interface ConfirmDecisionInput {
  description: string;
  category: string;
}
export interface ConfirmActionItemInput {
  description: string;
  owner?: string | null;
  dueDate?: string | null;
}
