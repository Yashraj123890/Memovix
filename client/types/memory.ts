/**
 * Mirrors the Memory model in server/prisma/schema.prisma.
 */
export type MemoryCategory =
  | "NOTE"
  | "DECISION"
  | "MEETING"
  | "FEATURE"
  | "BUG"
  | "API"
  | "DOCUMENTATION"
  | "OTHER";

export interface MemoryAuthor {
  id: string;
  name: string;
  email: string;
}

export interface Memory {
  id: string;
  title: string;
  content: string;
  category: MemoryCategory;
  customCategory?: string | null;
  projectId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  /**
   * Not included by the current list (GET /memories/project/:projectId) or
   * search (GET /memories/search/query) endpoints — both return flat rows
   * with only createdById. Optional here so the UI can render gracefully
   * today and pick this up automatically if a future backend update joins
   * the creator, without any frontend changes.
   */
  createdBy?: MemoryAuthor | null;
}
