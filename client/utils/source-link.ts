/**
 * Unified retrieval source types (mirrors the server's SearchableSourceType).
 * Chat citations and AI Search results now span the whole project graph, so the
 * UI resolves a link + label per type here.
 */
export type SourceType =
  | "MEMORY"
  | "DOCUMENT"
  | "REQUIREMENT"
  | "DECISION"
  | "MEETING_NOTE"
  | "DELIVERABLE"
  | "COMMENT";

/** Short type label for a badge/icon caption. */
export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  MEMORY: "Memory",
  DOCUMENT: "Document",
  REQUIREMENT: "Requirement",
  DECISION: "Decision",
  MEETING_NOTE: "Meeting Note",
  DELIVERABLE: "Deliverable",
  COMMENT: "Comment",
};

/**
 * Route to open a source. Memory and file have detail pages ([id]); the other
 * types link to their project section list (no per-row detail route yet), and
 * comments have no standalone page (null → rendered as a non-clickable badge).
 */
export function sourceHref(
  projectId: string,
  sourceType: SourceType,
  sourceId: string,
): string | null {
  const base = `/projects/${projectId}`;
  switch (sourceType) {
    case "MEMORY":
      return `${base}/memories/${sourceId}`;
    case "DOCUMENT":
      return `${base}/files/${sourceId}`;
    case "REQUIREMENT":
      return `${base}/requirements`;
    case "DECISION":
      return `${base}/decisions`;
    case "MEETING_NOTE":
      return `${base}/meeting-notes`;
    case "DELIVERABLE":
      return `${base}/deliverables`;
    case "COMMENT":
      return null;
    default:
      return null;
  }
}
