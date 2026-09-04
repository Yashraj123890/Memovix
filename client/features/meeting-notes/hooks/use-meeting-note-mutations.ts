"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { meetingNoteService } from "@/services/api/meeting-note.service";
import { meetingNoteKeys } from "@/features/meeting-notes/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";
import type {
  ConfirmActionItemInput,
  ConfirmDecisionInput,
} from "@/types/meeting-note";

/** AI summarization — ephemeral, persists nothing, so no cache invalidation. */
export function useSummarizeMeetingNoteMutation(projectId: string) {
  return useMutation({
    mutationFn: (rawText: string) =>
      meetingNoteService.summarize(projectId, rawText),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSaveMeetingNoteMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rawText, summary }: { rawText: string; summary: string }) =>
      meetingNoteService.save(projectId, rawText, summary),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: meetingNoteKeys.projectAll(projectId),
      });
      toast.success("Meeting note saved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// --- Meeting Notes v2 ------------------------------------------------------

/** Submit a transcript and start async extraction (returns the EXTRACTING note). */
export function useIngestMeetingNoteMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ transcript, source }: { transcript: string; source?: string }) =>
      meetingNoteService.ingest(projectId, transcript, source),
    onSuccess: () => {
      // The new note appears in the list immediately (as EXTRACTING).
      queryClient.invalidateQueries({
        queryKey: meetingNoteKeys.projectAll(projectId),
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Persist the reviewed decisions + action items. */
export function useConfirmMeetingNoteMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingNoteId,
      decisions,
      actionItems,
    }: {
      meetingNoteId: string;
      decisions: ConfirmDecisionInput[];
      actionItems: ConfirmActionItemInput[];
    }) =>
      meetingNoteService.confirm(projectId, meetingNoteId, decisions, actionItems),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: meetingNoteKeys.projectAll(projectId),
      });
      toast.success("Saved to project memory");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

/** Re-run a failed extraction. */
export function useRetryMeetingNoteMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meetingNoteId: string) =>
      meetingNoteService.retry(projectId, meetingNoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: meetingNoteKeys.projectAll(projectId),
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
