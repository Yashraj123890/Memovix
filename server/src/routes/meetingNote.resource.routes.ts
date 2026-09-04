import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  saveMeetingNoteSchema,
  ingestMeetingNoteSchema,
  confirmMeetingNoteSchema,
} from "../validators/meetingNote.validator";
import {
  listMeetingNotes,
  getMeetingNote,
  saveMeetingNote,
  ingestMeetingNote,
  confirmMeetingNote,
  retryMeetingNote,
} from "../controllers/meetingNote.controller";

/**
 * Persisted Meeting Notes resource (blueprint §3.2.7 / §6.2.11), mounted under
 * /api. Internal-team tooling — OWNER/MEMBER only; tenant/project scoping is
 * enforced in the service via requireProject. Saving here also indexes the
 * summary into project memory. The AI summarizer (no persistence) lives
 * separately under /api/ai.
 */
const router = Router();

const internalOnly = [authenticate, authorize(UserRole.OWNER, UserRole.MEMBER)];

router.get("/projects/:projectId/meeting-notes", ...internalOnly, listMeetingNotes);

router.get(
  "/projects/:projectId/meeting-notes/:meetingNoteId",
  ...internalOnly,
  getMeetingNote
);

router.post(
  "/projects/:projectId/meeting-notes",
  ...internalOnly,
  validate(saveMeetingNoteSchema),
  saveMeetingNote
);

// --- Meeting Notes v2: transcript ingest → async extraction → confirm ---------

router.post(
  "/projects/:projectId/meeting-notes/ingest",
  ...internalOnly,
  validate(ingestMeetingNoteSchema),
  ingestMeetingNote
);

router.post(
  "/projects/:projectId/meeting-notes/:meetingNoteId/confirm",
  ...internalOnly,
  validate(confirmMeetingNoteSchema),
  confirmMeetingNote
);

router.post(
  "/projects/:projectId/meeting-notes/:meetingNoteId/retry",
  ...internalOnly,
  retryMeetingNote
);

export default router;
