/**
 * Mirrors the ScopeFlag model in server/prisma/schema.prisma and the shapes
 * returned by the M7 scope endpoints (server/src/controllers/scope.controller.ts).
 * `classification` and `resolution` are free strings on the backend (validated
 * against ScopeConfig); the UI works with the known vocabularies below.
 */
export type ScopeClassification = "new" | "modifies_existing" | "out_of_scope";
export type ScopeResolution = "pending" | "accepted_into_scope" | "declined";
export type ScopeResolveAction =
  "accept_into_scope" | "decline" | "propose_change_order";

export interface ScopeFlagRequirementRef {
  id: string;
  title: string;
}

export interface ScopeFlag {
  id: string;
  projectId: string;
  requirementId: string;
  classification: string;
  similarityScore: number;
  rationale: string;
  resolution: string;
  relatedBaselineId: string | null;
  createdAt: string;
  requirement?: ScopeFlagRequirementRef;
  relatedBaseline?: ScopeFlagRequirementRef | null;
}

/** POST /projects/:id/requirements/compare-baseline result. */
export interface CompareBaselineResult {
  compared: number;
  flagged: number;
  alreadyCovered: number;
  flags: ScopeFlag[];
}

/** POST /projects/:id/scope-flags/:flagId/resolve result. */
export interface ResolveScopeFlagResult {
  flagId: string;
  action: ScopeResolveAction;
  resolution: string;
  requirementId?: string;
  decisionId?: string;
}
