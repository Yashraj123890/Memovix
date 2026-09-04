import {
  DecisionCategory,
  DecisionSourceType,
  MeetingNoteStatus,
  Prisma,
  SearchableSourceType,
} from "@prisma/client";

import searchableIndexService from "./searchableIndex.service";
import { MeetingNoteRepository } from "../repositories/meetingNote.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { DecisionRepository } from "../repositories/decision.repository";
import { ActionItemRepository } from "../repositories/actionItem.repository";
import { runWithTenantContext } from "../lib/tenant-context";

import { meetingNoteWorkflow } from "../ai/workflows/meetingNote.workflow";
import { meetingExtractionWorkflow } from "../ai/workflows/meetingExtraction.workflow";
import { TranscriptionProviderFactory } from "../ai/transcription/transcription.factory";
import { TimelineService } from "./timeline.service";
import auditService from "./audit.service";

/**
 * Meeting Notes (blueprint §3.2.7 + Meeting Notes v2).
 *
 * v2 flow: a TRANSCRIPT (pasted, or produced by browser-side Whisper — the audio
 * is never uploaded) is `ingest`ed → the note is created at status EXTRACTING and
 * returned immediately → a DETACHED background job runs the single combined
 * extraction (summary + decisions + action items) and flips the note to
 * READY/FAILED, which the client polls via `get`. Extraction output is a REVIEW
 * QUEUE (`proposed*` columns); nothing becomes a permanent DecisionLog/ActionItem
 * record until a human calls `confirm`.
 *
 * RLS: the background job runs AFTER the request, so it re-establishes the tenant
 * context explicitly (runWithTenantContext) — otherwise its Prisma writes would
 * be blocked by row-level security.
 *
 * The legacy `summarize`/`save` (paste → Markdown → save) remain for backward
 * compatibility until the paste UI is migrated onto ingest/confirm.
 */
export class MeetingNoteService {
  private timelineService = new TimelineService();
  private decisionRepository = new DecisionRepository();
  private actionItemRepository = new ActionItemRepository();

  constructor(
    private readonly meetingNoteRepository: MeetingNoteRepository,
    private readonly projectRepository: ProjectRepository
  ) {}

  private async requireProject(projectId: string, tenantId: string) {
    const project = await this.projectRepository.findById(projectId, tenantId);
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  }

  /**
   * Ingest a transcript (from paste or browser Whisper) and start async
   * extraction. Returns the created note (status EXTRACTING) immediately; the
   * combined AI generation runs off the request and updates the note.
   */
  async ingest(input: {
    projectId: string;
    tenantId: string;
    userId: string;
    transcript: string;
    source?: string;
  }) {
    await this.requireProject(input.projectId, input.tenantId);

    // V1 transcription provider is a pass-through: the transcript was produced in
    // the browser; only text reaches the server (no audio is ever uploaded).
    const { text, source } = await TranscriptionProviderFactory.getProvider().transcribe({
      transcript: input.transcript,
      source: input.source,
    });

    const note = await this.meetingNoteRepository.create({
      rawText: text,
      status: MeetingNoteStatus.EXTRACTING,
      transcriptSource: source,
      project: { connect: { id: input.projectId } },
      createdBy: { connect: { id: input.userId } },
    });

    await this.timelineService.createEvent({
      projectId: input.projectId,
      userId: input.userId,
      action: "MEETING_NOTE_INGESTED",
      description: "Started extracting a meeting note",
    });

    await auditService.createLog({
      tenantId: input.tenantId,
      userId: input.userId,
      projectId: input.projectId,
      action: "MEETING_NOTE_INGESTED",
      entityType: "MEETING_NOTE",
      entityId: note.id,
    });

    // Fire-and-forget: extraction runs off the request (in-process, no queue —
    // documented tradeoff: a server restart mid-job leaves the note EXTRACTING;
    // `retry` recovers it). Re-establish tenant context for RLS inside the job.
    this.startExtractionJob({ noteId: note.id, tenantId: input.tenantId, transcript: text });

    return note;
  }

  /**
   * Detached extraction job. Never throws to the caller — on failure it records
   * status FAILED + error, which the client sees via polling and can `retry`.
   */
  private startExtractionJob(job: { noteId: string; tenantId: string; transcript: string }): void {
    void runWithTenantContext({ tenantId: job.tenantId }, async () => {
      try {
        const result = await meetingExtractionWorkflow.execute({ transcript: job.transcript });

        await this.meetingNoteRepository.update(job.noteId, {
          summary: result.summary,
          proposedDecisions: result.decisions as unknown as Prisma.InputJsonValue,
          proposedActionItems: result.actionItems as unknown as Prisma.InputJsonValue,
          status: MeetingNoteStatus.READY,
          error: null,
        });

        // Index the summary as a first-class MEETING_NOTE source (best-effort).
        await searchableIndexService.syncSafe(SearchableSourceType.MEETING_NOTE, job.noteId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Extraction failed";
        // Do not log transcript contents; record only a short reason.
        console.error(`[meeting-extraction] note ${job.noteId} failed: ${message}`);
        try {
          await this.meetingNoteRepository.update(job.noteId, {
            status: MeetingNoteStatus.FAILED,
            error: message.slice(0, 500),
          });
        } catch (updateError) {
          console.error(`[meeting-extraction] could not mark note ${job.noteId} FAILED:`, updateError);
        }
      }
    });
  }

  /** Re-run extraction for a FAILED note (manual recovery — no queue). */
  async retry(input: { projectId: string; tenantId: string; meetingNoteId: string }) {
    await this.requireProject(input.projectId, input.tenantId);
    const note = await this.meetingNoteRepository.findById(input.meetingNoteId);
    if (!note || note.projectId !== input.projectId) {
      throw new Error("Meeting note not found");
    }
    if (note.status !== MeetingNoteStatus.FAILED) {
      throw new Error("Only a failed meeting note can be retried");
    }

    const updated = await this.meetingNoteRepository.update(note.id, {
      status: MeetingNoteStatus.EXTRACTING,
      error: null,
    });

    this.startExtractionJob({ noteId: note.id, tenantId: input.tenantId, transcript: note.rawText });

    return updated;
  }

  /**
   * Confirm the human-reviewed proposals: persist ActionItem rows and DecisionLog
   * rows (sourceType MEETING_NOTE, sourceId = note.id). Only confirmed items are
   * persisted. Indexing + Timeline + Audit fire here.
   */
  async confirm(input: {
    projectId: string;
    tenantId: string;
    userId: string;
    meetingNoteId: string;
    decisions: { description: string; category: DecisionCategory }[];
    actionItems: { description: string; owner?: string | null; dueDate?: string | null }[];
  }) {
    await this.requireProject(input.projectId, input.tenantId);
    const note = await this.meetingNoteRepository.findById(input.meetingNoteId);
    if (!note || note.projectId !== input.projectId) {
      throw new Error("Meeting note not found");
    }

    // 1. Action items (batch insert).
    if (input.actionItems.length > 0) {
      await this.actionItemRepository.createMany(
        input.actionItems.map((a) => ({
          projectId: input.projectId,
          meetingNoteId: note.id,
          description: a.description,
          owner: a.owner ?? null,
          dueDate: a.dueDate ?? null,
        }))
      );
    }

    // 2. Decisions → Decision Log with MEETING_NOTE provenance; index each.
    const createdDecisions = [];
    for (const d of input.decisions) {
      const decision = await this.decisionRepository.create({
        category: d.category,
        description: d.description,
        sourceType: DecisionSourceType.MEETING_NOTE,
        sourceId: note.id,
        project: { connect: { id: input.projectId } },
        loggedBy: { connect: { id: input.userId } },
      });
      await searchableIndexService.syncSafe(SearchableSourceType.DECISION, decision.id);
      createdDecisions.push(decision);
    }

    await this.timelineService.createEvent({
      projectId: input.projectId,
      userId: input.userId,
      action: "MEETING_NOTE_CONFIRMED",
      description: `Confirmed ${input.actionItems.length} action item(s) and ${createdDecisions.length} decision(s) from a meeting`,
    });

    await auditService.createLog({
      tenantId: input.tenantId,
      userId: input.userId,
      projectId: input.projectId,
      action: "MEETING_NOTE_CONFIRMED",
      entityType: "MEETING_NOTE",
      entityId: note.id,
      details: { actionItems: input.actionItems.length, decisions: createdDecisions.length },
    });

    return this.meetingNoteRepository.findById(note.id);
  }

  /** List a project's meeting notes. */
  async list(projectId: string, tenantId: string) {
    await this.requireProject(projectId, tenantId);
    return this.meetingNoteRepository.findByProject(projectId);
  }

  /** Fetch a single meeting note (also the client's polling target for status). */
  async get(projectId: string, tenantId: string, meetingNoteId: string) {
    await this.requireProject(projectId, tenantId);
    const note = await this.meetingNoteRepository.findById(meetingNoteId);
    if (!note || note.projectId !== projectId) {
      throw new Error("Meeting note not found");
    }
    return note;
  }

  // --- Legacy paste flow (kept for backward compatibility) -------------------

  /** Summarize raw meeting notes for review. Ephemeral — nothing is persisted. */
  async summarize(input: { projectId: string; tenantId: string; rawText: string }): Promise<{ summary: string }> {
    await this.requireProject(input.projectId, input.tenantId);
    return meetingNoteWorkflow.execute({ rawText: input.rawText });
  }

  /** Persist a reviewed (paste-flow) meeting note, then index it. */
  async save(input: {
    projectId: string;
    tenantId: string;
    userId: string;
    rawText: string;
    summary: string;
  }) {
    await this.requireProject(input.projectId, input.tenantId);

    const note = await this.meetingNoteRepository.create({
      rawText: input.rawText,
      summary: input.summary,
      status: MeetingNoteStatus.READY,
      transcriptSource: "paste",
      project: { connect: { id: input.projectId } },
      createdBy: { connect: { id: input.userId } },
    });

    await this.timelineService.createEvent({
      projectId: input.projectId,
      userId: input.userId,
      action: "MEETING_NOTE_SAVED",
      description: "Saved a meeting note",
    });

    await auditService.createLog({
      tenantId: input.tenantId,
      userId: input.userId,
      projectId: input.projectId,
      action: "MEETING_NOTE_SAVED",
      entityType: "MEETING_NOTE",
      entityId: note.id,
    });

    await searchableIndexService.syncSafe(SearchableSourceType.MEETING_NOTE, note.id);

    return note;
  }
}
