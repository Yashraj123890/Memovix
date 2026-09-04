import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { resolveScopeFlagSchema } from "../validators/scope.validator";
import {
  compareBaseline,
  listScopeFlags,
  resolveScopeFlag,
} from "../controllers/scope.controller";

/**
 * Scope Creep Detection / Requirement Comparison (blueprint §3.2.5 / §3.2.6),
 * mounted under /api. Internal-team tooling — OWNER/MEMBER only; a client can
 * never trigger a comparison or view flags. Tenant/project scoping is enforced
 * in the service via requireProject.
 */
const router = Router();

const internalOnly = [authenticate, authorize(UserRole.OWNER, UserRole.MEMBER)];

router.post(
  "/projects/:projectId/requirements/compare-baseline",
  ...internalOnly,
  compareBaseline
);

router.get("/projects/:projectId/scope-flags", ...internalOnly, listScopeFlags);

router.post(
  "/projects/:projectId/scope-flags/:flagId/resolve",
  ...internalOnly,
  validate(resolveScopeFlagSchema),
  resolveScopeFlag
);

export default router;

