import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  confirmRequirementsSchema,
  updateRequirementSchema,
  rejectRequirementsSchema,
  setBaselineSchema,
} from "../validators/requirement.validator";
import {
  listRequirements,
  confirmRequirements,
  updateRequirement,
  rejectRequirements,
  deleteRequirement,
  setBaseline,
} from "../controllers/requirement.controller";

/**
 * Persisted Requirement resource (blueprint §3.2.4 / §6.2.8), mounted under
 * /api. Requirements are internal-team tooling, so every route is OWNER/MEMBER
 * only; tenant/project scoping is enforced in the service via requireProject.
 * This is the confirm/edit/reject/delete/baseline surface — the AI extractor
 * (propose-only) lives separately under /api/ai.
 */
const router = Router();

const internalOnly = [authenticate, authorize(UserRole.OWNER, UserRole.MEMBER)];

router.get("/projects/:projectId/requirements", ...internalOnly, listRequirements);

router.post(
  "/projects/:projectId/requirements",
  ...internalOnly,
  validate(confirmRequirementsSchema),
  confirmRequirements
);

router.post(
  "/projects/:projectId/requirements/reject",
  ...internalOnly,
  validate(rejectRequirementsSchema),
  rejectRequirements
);

router.post(
  "/projects/:projectId/requirements/baseline",
  ...internalOnly,
  validate(setBaselineSchema),
  setBaseline
);

router.patch(
  "/projects/:projectId/requirements/:requirementId",
  ...internalOnly,
  validate(updateRequirementSchema),
  updateRequirement
);

router.delete(
  "/projects/:projectId/requirements/:requirementId",
  ...internalOnly,
  deleteRequirement
);

export default router;
