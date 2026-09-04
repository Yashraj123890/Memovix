import multer from "multer";
import { Response, NextFunction } from "express";

import { AuthenticatedRequest } from "./auth.middleware";

/**
 * Avatar-specific upload pipeline, separate from the general `upload`
 * middleware (which allows PDFs/DOCX and does NOT allow WEBP). Restricted to
 * the image types a profile photo needs, with a smaller size cap. Bytes are
 * buffered in memory then handed to the S3 StorageProvider, exactly like the
 * project-file flow.
 */
const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"] as const;

export const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter(_req, file, cb) {
        if ((ALLOWED_MIME as readonly string[]).includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Unsupported image type. Use JPG, PNG or WEBP."));
        }
    },
});

/** Maps a validated image mimetype to a file extension for the storage key. */
export const AVATAR_EXTENSION: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
};

type SignatureCheck = (buffer: Buffer) => boolean;

const startsWith =
    (bytes: number[]): SignatureCheck =>
    (buffer) =>
        buffer.length >= bytes.length && bytes.every((byte, i) => buffer[i] === byte);

// WEBP is a RIFF container: "RIFF"...."WEBP" (bytes 0-3 and 8-11).
const isWebp: SignatureCheck = (buffer) =>
    buffer.length >= 12 &&
    startsWith([0x52, 0x49, 0x46, 0x46])(buffer) &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

const SIGNATURES: Record<string, SignatureCheck> = {
    "image/png": startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    "image/jpeg": startsWith([0xff, 0xd8, 0xff]),
    "image/webp": isWebp,
};

/**
 * Magic-byte validation for avatars (same intent as validateFileSignature for
 * project files): confirm the real bytes match the declared image type, so a
 * renamed non-image can't slip through the MIME allow-list.
 */
export function validateAvatarSignature(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const file = req.file;
    if (!file) {
        return next(); // controller returns its own "No file uploaded" 400
    }

    const check = SIGNATURES[file.mimetype];
    if (!check) {
        return res.status(415).json({ success: false, message: "Unsupported image type" });
    }
    if (!check(file.buffer)) {
        return res
            .status(400)
            .json({ success: false, message: "File content does not match its declared type" });
    }

    next();
}
