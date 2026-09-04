/**
 * Mirrors the ProjectFile model in server/prisma/schema.prisma, trimmed to
 * the fields GET /files/project/:projectId actually selects (see
 * server/src/repositories/project-file.repository.ts findByProjectId).
 */
export interface FileUploader {
  id: string;
  name: string;
  email: string;
}

/** Document ingestion status (mirrors FileIngestStatus in the backend schema). */
export type FileIngestStatus =
  | "PENDING"
  | "PROCESSING"
  | "INDEXED"
  | "FAILED"
  | "SKIPPED";

export interface ProjectFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  createdAt: string;
  uploadedById: string;
  /** Present on the list endpoint (M5); absent from older cached shapes. */
  ingestStatus?: FileIngestStatus;
  ingestError?: string | null;
  /**
   * Not included by the current list endpoint (flat select, no join) —
   * optional so the UI degrades gracefully today and picks this up
   * automatically if a future backend update joins the uploader.
   */
  uploadedBy?: FileUploader | null;
}

/**
 * Response shape of GET /files/:fileId/download — a signed URL, not the
 * file bytes themselves. There is no plain metadata-only GET /files/:fileId
 * endpoint (see server/src/routes/project-file.routes.ts); this is only
 * fetched on demand for inline preview of previewable types (images).
 */
export interface FileDownloadInfo {
  fileName: string;
  downloadUrl: string;
}
