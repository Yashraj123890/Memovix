/**
 * Mirrors the Requirement model in server/prisma/schema.prisma and the shapes
 * returned by the M6 requirement endpoints (server/src/controllers/
 * requirement.controller.ts). `category` is a free string on the backend
 * (validated against an env-driven allow-list); the UI works with the default
 * set in features/requirements/config/requirement-category.ts.
 */
export interface Requirement {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  category: string | null;
  isBaseline: boolean;
  sourceExcerpt: string | null;
  sourceFileId: string | null;
  createdAt: string;
}

/**
 * A proposal returned by POST /ai/requirements/extract — NOT persisted. The
 * `tempId` keys/edits/reorders items in the review UI and is never sent back.
 */
export interface ExtractedRequirementProposal {
  tempId: string;
  title: string;
  description: string | null;
  category: string | null;
  sourceExcerpt: string | null;
}

export interface ExtractRequirementsResult {
  sourceFileId: string | null;
  requirements: ExtractedRequirementProposal[];
}

/** A single human-confirmed requirement being persisted (Accept / Edit & Save). */
export interface ConfirmRequirementInput {
  title: string;
  description?: string | null;
  category?: string | null;
  sourceExcerpt?: string | null;
  sourceFileId?: string | null;
}

export interface ConfirmRequirementsResult {
  accepted: number;
  createdIds: string[];
  requirements: Requirement[];
}

export interface UpdateRequirementInput {
  title?: string;
  description?: string | null;
  category?: string | null;
  sourceExcerpt?: string | null;
  // Per-row baseline membership toggle — moves a single requirement between the
  // Baseline Scope and the New Requests (candidate) lane.
  isBaseline?: boolean;
}
