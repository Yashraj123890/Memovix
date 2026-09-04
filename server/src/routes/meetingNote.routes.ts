import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { summarizeMeetingNoteSchema } from "../validators/meetingNote.validator";
import { summarizeMeetingNote } from "../controllers/meetingNote.controller";

/**
 * AI surface for the Meeting Notes Summarizer (blueprint §3.2.7). Mounted under
 * /api/ai (rate-limited by aiLimiter). Summarizes raw notes for review — never
 * persists. Saving lives on the project-scoped resource routes.
 */
const router = Router();

router.post(
  "/meeting-notes/summarize",
  authenticate,
  authorize(UserRole.OWNER, UserRole.MEMBER),
  validate(summarizeMeetingNoteSchema),
  summarizeMeetingNote
);

export default router;
