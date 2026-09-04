import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

/**
 * Magic-byte (file signature) validation, run AFTER multer has buffered the
 * upload (see upload.middleware.ts). multer's fileFilter only trusts the
 * client-declared MIME type; this middleware additionally confirms the real
 * bytes match, so a renamed executable sent as `application/pdf` is rejected
 * (blueprint §13.4 "actual file signature/magic-bytes").
 *
 * text/plain has no reliable magic number, so it is accepted on the
 * upload.middleware MIME allow-list alone.
 */
type SignatureCheck = (buffer: Buffer) => boolean;

const startsWith =
  (bytes: number[]): SignatureCheck =>
  (buffer) =>
    buffer.length >= bytes.length && bytes.every((byte, i) => buffer[i] === byte);

const SIGNATURES: Record<string, SignatureCheck> = {
  // "%PDF-"
  "application/pdf": startsWith([0x25, 0x50, 0x44, 0x46, 0x2d]),
  // PNG
  "image/png": startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  // JPEG
  "image/jpeg": startsWith([0xff, 0xd8, 0xff]),
  // DOCX is a ZIP container — "PK\x03\x04"
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    startsWith([0x50, 0x4b, 0x03, 0x04]),
};

export function validateFileSignature(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const file = req.file;

  // No file: let the controller return its own "No file uploaded" 400.
  if (!file) {
    return next();
  }

  // text/plain has no signature to verify — MIME allow-list is sufficient.
  if (file.mimetype === "text/plain") {
    return next();
  }

  const check = SIGNATURES[file.mimetype];

  if (!check) {
    return res.status(415).json({
      success: false,
      message: "Unsupported file type",
    });
  }

  if (!check(file.buffer)) {
    return res.status(400).json({
      success: false,
      message: "File content does not match its declared type",
    });
  }

  next();
}
