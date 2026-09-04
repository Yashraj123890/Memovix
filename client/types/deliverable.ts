/**
 * Mirrors the Deliverable / DeliverableVersion models in
 * server/prisma/schema.prisma and the shapes returned by the deliverable
 * endpoints (server/src/controllers/deliverable.controller.ts).
 *
 * APPROVED / REVISION_REQUESTED exist in the status union now (the backend
 * enum defines them) but are only produced by the Approval Workflow in a
 * later milestone; M2 only moves a deliverable between DRAFT and SUBMITTED.
 */
export type DeliverableStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REVISION_REQUESTED";

/** Minimal user shape returned by the deliverable detail includes. */
export interface DeliverableUserRef {
  id: string;
  name: string;
  email?: string;
}

export interface DeliverableVersion {
  id: string;
  deliverableId: string;
  versionNumber: number;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  changeSummary: string | null;
  uploadedById: string;
  uploadedAt: string;
  /** Present on the detail endpoint (additive include); absent on create/upload responses. */
  uploadedBy?: DeliverableUserRef | null;
}

/** Base fields, as returned by create/update (no relations included). */
export interface Deliverable {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  dueDate: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  currentVersionId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

/** Detail-only enrichment: the creator's name/email (additive include). */
export interface DeliverableCreator extends DeliverableUserRef {
  email?: string;
}

/** List row: base + latest version + version count. */
export interface DeliverableListItem extends Deliverable {
  currentVersion: DeliverableVersion | null;
  _count: { versions: number };
}

/** Detail: base + full version history (newest first) + latest version + creator. */
export interface DeliverableDetail extends Deliverable {
  currentVersion: DeliverableVersion | null;
  versions: DeliverableVersion[];
  createdBy?: DeliverableCreator | null;
}

/** Response shape of the version download endpoint — a signed URL, not bytes. */
export interface VersionDownloadInfo {
  fileName: string;
  downloadUrl: string;
}

export type RevisionStatus = "OPEN" | "RESOLVED";

/** Mirrors RevisionRequest + its `requestedBy` select (server §3.1.8). */
export interface RevisionRequest {
  id: string;
  deliverableId: string;
  deliverableVersionId: string;
  requestedById: string;
  comment: string;
  status: RevisionStatus;
  createdAt: string;
  resolvedAt: string | null;
  requestedBy?: { id: string; name: string } | null;
}
