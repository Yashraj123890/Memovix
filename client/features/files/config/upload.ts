/**
 * Mirrors server/src/middleware/upload.middleware.ts exactly (multer's
 * fileFilter + 20 MB limit). Client-side checks here are a UX nicety only —
 * the backend is still the source of truth and returns a real error for
 * anything that slips through (e.g. a mismatched multer version), so
 * upload-file-button surfaces that error rather than assuming this list is
 * authoritative.
 */
export const ALLOWED_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "text/plain",
] as const;

export const ALLOWED_UPLOAD_EXTENSIONS = [".pdf", ".docx", ".png", ".jpg", ".jpeg", ".txt"] as const;

export const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

export const UPLOAD_ACCEPT_ATTR = ALLOWED_UPLOAD_EXTENSIONS.join(",");
