import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { extractRequirementsSchema } from "../validators/requirement.validator";
import { extractRequirements } from "../controllers/requirement.controller";

/**
 * AI surface for the Requirement Extractor (blueprint §3.2.4). Mounted under
 * /api/ai (rate-limited by aiLimiter). This endpoint only PROPOSES structured
 * requirements — it never persists. Confirmation/persistence lives on the
 * project-scoped resource routes (requirement.resource.routes.ts).
 */
const router = Router();

router.post(
  "/requirements/extract",
  authenticate,
  authorize(UserRole.OWNER, UserRole.MEMBER),
  validate(extractRequirementsSchema),
  extractRequirements
);

export default router;
