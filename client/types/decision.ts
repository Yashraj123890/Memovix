/**
 * Mirrors the DecisionLog model in server/prisma/schema.prisma and the shape
 * returned by GET /projects/:projectId/decisions.
 *
 * `sourceType` reflects the backend DecisionSourceType enum. In this phase all
 * entries are MANUAL; APPROVAL-sourced entries (loggedBy = null → "System")
 * start appearing once the Approval Workflow lands, and the UI already renders
 * both generically.
 */
export type DecisionCategory = "SCOPE" | "TIMELINE" | "BUDGET" | "DESIGN" | "OTHER";
export type DecisionSourceType = "MANUAL" | "APPROVAL";

export interface DecisionLogger {
  id: string;
  name: string;
}

export interface Decision {
  id: string;
  projectId: string;
  category: DecisionCategory;
  customCategory?: string | null;
  description: string;
  sourceType: DecisionSourceType;
  sourceId: string | null;
  loggedById: string | null;
  loggedBy: DecisionLogger | null;
  createdAt: string;
}
