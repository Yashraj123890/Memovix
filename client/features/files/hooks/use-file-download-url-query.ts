"use client";

import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/api/file.service";
import { fileKeys } from "@/features/files/hooks/query-keys";

/**
 * `enabled` is passed in by the caller (FilePreview gates this on
 * getFileTypeConfig(...).category === "image") — no point requesting a
 * signed URL for a file type we can't inline-render anyway.
 */
export function useFileDownloadUrlQuery(fileId: string, enabled: boolean) {
  return useQuery({
    queryKey: fileKeys.downloadUrl(fileId),
    queryFn: () => fileService.getDownloadUrl(fileId),
    enabled,
  });
}
