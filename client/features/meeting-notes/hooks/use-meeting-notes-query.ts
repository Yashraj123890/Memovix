"use client";

import { useQuery } from "@tanstack/react-query";
import { meetingNoteService } from "@/services/api/meeting-note.service";
import { meetingNoteKeys } from "@/features/meeting-notes/hooks/query-keys";

export function useMeetingNotesQuery(projectId: string) {
  return useQuery({
    queryKey: meetingNoteKeys.list(projectId),
    queryFn: () => meetingNoteService.list(projectId),
  });
}
