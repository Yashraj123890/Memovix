"use client";

import { useQuery } from "@tanstack/react-query";
import { meetingNoteService } from "@/services/api/meeting-note.service";
import { meetingNoteKeys } from "@/features/meeting-notes/hooks/query-keys";
import type { MeetingNote } from "@/types/meeting-note";

/**
 * Fetch a single meeting note, polling every 2.5s WHILE it is still being
 * processed (TRANSCRIBING/EXTRACTING) so the review UI advances automatically
 * when the async extraction job flips it to READY/FAILED.
 */
export function useMeetingNoteDetailQuery(
  projectId: string,
  meetingNoteId: string | null,
) {
  return useQuery<MeetingNote>({
    queryKey: meetingNoteId
      ? meetingNoteKeys.detail(projectId, meetingNoteId)
      : meetingNoteKeys.detail(projectId, "none"),
    queryFn: () => meetingNoteService.get(projectId, meetingNoteId as string),
    enabled: Boolean(meetingNoteId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "EXTRACTING" || status === "TRANSCRIBING" ? 2500 : false;
    },
  });
}
