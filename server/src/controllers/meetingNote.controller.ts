import { Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { MeetingNoteService } from "../services/meetingNote.service";
import { MeetingNoteRepository } from "../repositories/meetingNote.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { handleAiError } from "./ai-error.helper";

const meetingNoteService = new MeetingNoteService(
  new MeetingNoteRepository(),
  new ProjectRepository()
);

// summarize invokes the LLM, so AI-provider failures degrade to a clean 503 via
// the shared helper (blueprint §4.4); non-AI errors keep the 404/400 mapping.
function handleError(res: Response, error: unknown) {
  return handleAiError(res, error);
}

/** POST /api/ai/meeting-notes/summarize — AI summary for review (no persistence). */
export async function summarizeMeetingNote(req: AuthenticatedRequest, res: Response) {
  try {
    const { projectId, rawText } = req.body;

    const result = await meetingNoteService.summarize({
      projectId,
      tenantId: req.user!.tenantId,
      rawText,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
}

/** GET /api/projects/:projectId/meeting-notes */
export async function listMeetingNotes(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);

    const notes = await meetingNoteService.list(projectId, req.user!.tenantId);

    return res.status(200).json({ success: true, data: notes });
  } catch (error) {
    return handleError(res, error);
  }
}

/** GET /api/projects/:projectId/meeting-notes/:meetingNoteId */
export async function getMeetingNote(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);
    const meetingNoteId = String(req.params.meetingNoteId);

    const note = await meetingNoteService.get(projectId, req.user!.tenantId, meetingNoteId);

    return res.status(200).json({ success: true, data: note });
  } catch (error) {
    return handleError(res, error);
  }
}

/**
 * POST /api/projects/:projectId/meeting-notes/ingest — accept a transcript and
 * start async extraction. Returns the note (status EXTRACTING) immediately; the
 * client polls GET :id for READY/FAILED.
 */
export async function ingestMeetingNote(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);
    const { transcript, source } = req.body;

    const note = await meetingNoteService.ingest({
      projectId,
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      transcript,
      source,
    });

    return res.status(202).json({ success: true, data: note });
  } catch (error) {
    return handleError(res, error);
  }
}

/** POST /api/projects/:projectId/meeting-notes/:meetingNoteId/confirm */
export async function confirmMeetingNote(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);
    const meetingNoteId = String(req.params.meetingNoteId);
    const { decisions, actionItems } = req.body;

    const note = await meetingNoteService.confirm({
      projectId,
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      meetingNoteId,
      decisions,
      actionItems,
    });

    return res.status(200).json({ success: true, data: note });
  } catch (error) {
    return handleError(res, error);
  }
}

/** POST /api/projects/:projectId/meeting-notes/:meetingNoteId/retry — re-run a FAILED extraction. */
export async function retryMeetingNote(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);
    const meetingNoteId = String(req.params.meetingNoteId);

    const note = await meetingNoteService.retry({
      projectId,
      tenantId: req.user!.tenantId,
      meetingNoteId,
    });

    return res.status(202).json({ success: true, data: note });
  } catch (error) {
    return handleError(res, error);
  }
}

/** POST /api/projects/:projectId/meeting-notes — persist a reviewed note. */
export async function saveMeetingNote(req: AuthenticatedRequest, res: Response) {
  try {
    const projectId = String(req.params.projectId);
    const { rawText, summary } = req.body;

    const note = await meetingNoteService.save({
      projectId,
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      rawText,
      summary,
    });

    return res.status(201).json({ success: true, data: note });
  } catch (error) {
    return handleError(res, error);
  }
}
