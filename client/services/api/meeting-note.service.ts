import { apiClient } from "./client";
import { AI_REQUEST_TIMEOUT_MS } from "@/constants/api";
import type { ApiSuccessResponse } from "@/types/api";
import type {
  ConfirmActionItemInput,
  ConfirmDecisionInput,
  MeetingNote,
  MeetingNoteSummary,
  SavedMeetingNote,
} from "@/types/meeting-note";

const MEETING_NOTE_ENDPOINTS = {
  summarize: "/ai/meeting-notes/summarize",
  listByProject: (projectId: string) => `/projects/${projectId}/meeting-notes`,
  create: (projectId: string) => `/projects/${projectId}/meeting-notes`,
  byId: (projectId: string, meetingNoteId: string) =>
    `/projects/${projectId}/meeting-notes/${meetingNoteId}`,
  ingest: (projectId: string) => `/projects/${projectId}/meeting-notes/ingest`,
  confirm: (projectId: string, meetingNoteId: string) =>
    `/projects/${projectId}/meeting-notes/${meetingNoteId}/confirm`,
  retry: (projectId: string, meetingNoteId: string) =>
    `/projects/${projectId}/meeting-notes/${meetingNoteId}/retry`,
} as const;

/**
 * Meeting Notes API client (blueprint §3.2.7). `summarize` returns an ephemeral
 * AI summary for review; `save` persists the reviewed note and indexes its
 * summary into project memory (best-effort — see `indexed`).
 */
export const meetingNoteService = {
  async summarize(
    projectId: string,
    rawText: string,
  ): Promise<MeetingNoteSummary> {
    const response = await apiClient.post<
      ApiSuccessResponse<MeetingNoteSummary>
    >(
      MEETING_NOTE_ENDPOINTS.summarize,
      { projectId, rawText },
      // AI generation runs inline server-side and routinely exceeds the default
      // 15s cap; wait up to the backend's AI ceiling instead of aborting early.
      { timeout: AI_REQUEST_TIMEOUT_MS },
    );
    return response.data.data;
  },

  async list(projectId: string): Promise<MeetingNote[]> {
    const response = await apiClient.get<ApiSuccessResponse<MeetingNote[]>>(
      MEETING_NOTE_ENDPOINTS.listByProject(projectId),
    );
    return response.data.data;
  },

  async get(projectId: string, meetingNoteId: string): Promise<MeetingNote> {
    const response = await apiClient.get<ApiSuccessResponse<MeetingNote>>(
      MEETING_NOTE_ENDPOINTS.byId(projectId, meetingNoteId),
    );
    return response.data.data;
  },

  async save(
    projectId: string,
    rawText: string,
    summary: string,
  ): Promise<SavedMeetingNote> {
    const response = await apiClient.post<ApiSuccessResponse<SavedMeetingNote>>(
      MEETING_NOTE_ENDPOINTS.create(projectId),
      { rawText, summary },
    );
    return response.data.data;
  },

  // --- Meeting Notes v2: async ingest → poll → confirm ----------------------

  /**
   * Submit a transcript (from paste or browser-Whisper). Returns immediately with
   * the note at status EXTRACTING; the client then polls `get` for READY/FAILED.
   * The recording itself is never uploaded — only this transcript text.
   */
  async ingest(
    projectId: string,
    transcript: string,
    source?: string,
  ): Promise<MeetingNote> {
    const response = await apiClient.post<ApiSuccessResponse<MeetingNote>>(
      MEETING_NOTE_ENDPOINTS.ingest(projectId),
      { transcript, source },
    );
    return response.data.data;
  },

  /** Persist the human-reviewed decisions + action items. */
  async confirm(
    projectId: string,
    meetingNoteId: string,
    decisions: ConfirmDecisionInput[],
    actionItems: ConfirmActionItemInput[],
  ): Promise<MeetingNote> {
    const response = await apiClient.post<ApiSuccessResponse<MeetingNote>>(
      MEETING_NOTE_ENDPOINTS.confirm(projectId, meetingNoteId),
      { decisions, actionItems },
    );
    return response.data.data;
  },

  /** Re-run extraction for a FAILED note. */
  async retry(projectId: string, meetingNoteId: string): Promise<MeetingNote> {
    const response = await apiClient.post<ApiSuccessResponse<MeetingNote>>(
      MEETING_NOTE_ENDPOINTS.retry(projectId, meetingNoteId),
      {},
    );
    return response.data.data;
  },
};
