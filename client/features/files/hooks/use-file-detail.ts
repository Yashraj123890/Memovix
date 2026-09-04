"use client";

import { useFilesQuery } from "@/features/files/hooks/use-files-query";

/**
 * There is no metadata GET /files/:fileId endpoint at all — only
 * /files/:fileId/download (a signed URL, not metadata) and
 * DELETE /files/:fileId (see server/src/routes/project-file.routes.ts).
 * Deriving from the already-established list query (GET
 * /files/project/:projectId, same query useFilesQuery already uses for the
 * Files browse page from F9) isn't an optimization here — it's the only
 * available source for a single file's metadata. If the list isn't cached
 * yet (e.g. a direct link), this fetches it once; if it is, this is free.
 */
export function useFileDetail(projectId: string, fileId: string) {
  const { data: files, isLoading, isError, error, refetch } = useFilesQuery(projectId);

  const file = files?.find((item) => item.id === fileId);
  const notFound = !isLoading && !isError && !file;

  return { file, isLoading, isError, error, refetch, notFound };
}
