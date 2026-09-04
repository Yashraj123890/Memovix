"use client";

import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/api/file.service";
import { fileKeys } from "@/features/files/hooks/query-keys";
import type { ProjectFile } from "@/types/file";

const INGESTION_POLL_INTERVAL_MS = 2_000;

export function useFilesQuery(projectId: string) {
  return useQuery({
    queryKey: fileKeys.list(projectId),
    queryFn: () => fileService.getProjectFiles(projectId),
    // Keep status badges current while background document ingestion runs,
    // then stop polling automatically once every file reaches a terminal state.
    refetchInterval: (query) => {
      const files = query.state.data as ProjectFile[] | undefined;
      return files?.some(
        (file) => file.ingestStatus === "PENDING" || file.ingestStatus === "PROCESSING",
      )
        ? INGESTION_POLL_INTERVAL_MS
        : false;
    },
  });
}
