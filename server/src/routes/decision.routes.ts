import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate, authorize } from "../middleware/auth.middleware";
import { checkProjectAccess } from "../middleware/projectAccess.middleware";
import { validate } from "../middleware/validate.middleware";
import { createDecisionSchema } from "../validators/decision.validator";
import { listDecisions, createDecision } from "../controllers/decision.controller";

const router = Router();

/**
 * Decision Log (blueprint §3.2.9). Reads are visible to every project role
 * (checkProjectAccess) so a client can see the decision/approval trail;
 * manual entries are OWNER/MEMBER-only. Append-only — no update/delete route.
 */
router.get(
    "/projects/:projectId/decisions",
    authenticate,
    checkProjectAccess,
    listDecisions
);

router.post(
    "/projects/:projectId/decisions",
    authenticate,
    authorize(UserRole.OWNER, UserRole.MEMBER),
    validate(createDecisionSchema),
    createDecision
);

export default router;
