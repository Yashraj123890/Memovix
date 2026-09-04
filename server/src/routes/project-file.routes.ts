import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate, authorize, bindTenantContext } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { uploadLimiter } from "../middleware/rateLimit.middleware";
import { validateFileSignature } from "../middleware/fileSignature.middleware";
import { checkProjectAccess } from "../middleware/projectAccess.middleware";

import {
    uploadFile,
    getProjectFiles,
    downloadFile,
    deleteFile,
    reindexFile,
} from "../controllers/project-file.controller";

const router = Router();

/**
 * Middleware order matters and is deliberate: authenticate -> (parse upload) ->
 * validate signature -> checkProjectAccess -> handler. checkProjectAccess must
 * run BEFORE the handler (previously it was placed after the handler, which
 * sends the response, making the access check dead code — a CLIENT could act
 * on another project's file within the same tenant). For upload, multer runs
 * first so req.body.projectId is populated for checkProjectAccess.
 */
router.post(
    "/upload",
    authenticate,
    uploadLimiter,
    upload.single("file"),
    bindTenantContext,
    validateFileSignature,
    checkProjectAccess,
    uploadFile
);

router.get(
    "/project/:projectId",
    authenticate,
    checkProjectAccess,
    getProjectFiles
);

router.get(
    "/:fileId/download",
    authenticate,
    checkProjectAccess,
    downloadFile
);

// Re-run ingestion for an existing file (OWNER/MEMBER only). Tenant scoping is
// enforced in the service; useful during development to reprocess files.
router.post(
    "/:fileId/reindex",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    reindexFile
);

router.delete(
    "/:fileId",
    authenticate,
    checkProjectAccess,
    deleteFile
);

export default router;
