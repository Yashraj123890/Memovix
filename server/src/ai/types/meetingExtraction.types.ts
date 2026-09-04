/**
 * Types for the combined meeting-extraction workflow (Meeting Notes v2). ONE LLM
 * call over a transcript yields all three: a summary plus the decisions and
 * action items explicitly present. These are PROPOSALS — held on the MeetingNote
 * (`proposedDecisions` / `proposedActionItems`) for human review, and persisted
 * as DecisionLog / ActionItem rows only on confirm.
 */

export interface ExtractedDecision {
  description: string;
  /** One of DecisionCategory (SCOPE|TIMELINE|BUDGET|DESIGN|OTHER); lenient at AI stage. */
  category: string;
}

export interface ExtractedActionItem {
  description: string;
  /** Only set when the transcript names an owner — never invented. */
  owner?: string | null;
  /** Only set when the transcript names a due date — never invented. Free text. */
  dueDate?: string | null;
}

export interface MeetingExtractionResult {
  summary: string;
  decisions: ExtractedDecision[];
  actionItems: ExtractedActionItem[];
}
