import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate, authorize, bindTenantContext } from "../middleware/auth.middleware";
import { checkProjectAccess } from "../middleware/projectAccess.middleware";
import { validate } from "../middleware/validate.middleware";
import { upload } from "../middleware/upload.middleware";
import { uploadLimiter } from "../middleware/rateLimit.middleware";
import { validateFileSignature } from "../middleware/fileSignature.middleware";
import {
    createDeliverableSchema,
    updateDeliverableSchema,
    revisionRequestSchema,
} from "../validators/deliverable.validator";
import {
    createDeliverable,
    listDeliverables,
    getDeliverable,
    updateDeliverable,
    deleteDeliverable,
    uploadDeliverableVersion,
    downloadDeliverableVersion,
    approveDeliverable,
    requestRevision,
    listRevisionRequests,
} from "../controllers/deliverable.controller";

const router = Router();

/**
 * Deliverables (blueprint §3.1.5, §3.1.6). Mutations are OWNER/MEMBER-only via
 * authorize (matching the existing member-management routes); reads use
 * checkProjectAccess so an assigned CLIENT can view/download but not mutate.
 * Version uploads reuse the exact file-security chain from project-file.routes.
 */
router.post(
    "/projects/:projectId/deliverables",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    validate(createDeliverableSchema),
    createDeliverable
);

router.get(
    "/projects/:projectId/deliverables",
    authenticate,
    checkProjectAccess,
    listDeliverables
);

router.get(
    "/deliverables/:deliverableId",
    authenticate,
    checkProjectAccess,
    getDeliverable
);

router.patch(
    "/deliverables/:deliverableId",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    validate(updateDeliverableSchema),
    updateDeliverable
);

router.delete(
    "/deliverables/:deliverableId",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    deleteDeliverable
);

router.post(
    "/deliverables/:deliverableId/versions",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    uploadLimiter,
    upload.single("file"),
    bindTenantContext,
    validateFileSignature,
    uploadDeliverableVersion
);

router.get(
    "/deliverables/:deliverableId/versions/:versionId/download",
    authenticate,
    checkProjectAccess,
    downloadDeliverableVersion
);

/**
 * Approval workflow (blueprint §3.1.7, §3.1.8). Approve / Request-Revision are
 * CLIENT-only (authorize) + project-membership-checked (checkProjectAccess);
 * revision requests are readable by any assigned project role.
 */
router.post(
    "/deliverables/:deliverableId/approve",
    authenticate,
    authorize(UserRole.CLIENT),
    checkProjectAccess,
    approveDeliverable
);

router.post(
    "/deliverables/:deliverableId/request-revision",
    authenticate,
    authorize(UserRole.CLIENT),
    checkProjectAccess,
    validate(revisionRequestSchema),
    requestRevision
);

router.get(
    "/deliverables/:deliverableId/revision-requests",
    authenticate,
    checkProjectAccess,
    listRevisionRequests
);

export default router;
