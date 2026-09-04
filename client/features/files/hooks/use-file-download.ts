"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { fileService } from "@/services/api/file.service";
import { getErrorMessage } from "@/utils/error";
import { triggerBrowserDownload } from "@/utils/trigger-browser-download";
import type { FileDownloadInfo } from "@/types/file";

/**
 * Downloads a file the current user is authorized to access. Fetches a fresh
 * short-lived signed URL from GET /files/:fileId/download (same authenticated,
 * project-scoped endpoint the image preview uses — no new endpoint, no exposed
 * storage credentials) and triggers a real browser download.
 *
 * The signed URL now carries Content-Disposition: attachment server-side (see
 * S3StorageProvider.getSignedUrl), which is what actually forces the download
 * with the correct filename — the anchor's `download` attribute is ignored for
 * a cross-origin S3 URL, so we can't rely on it alone. Fetched on click rather
 * than on mount so non-image files don't request a URL they may never use.
 */
export function useFileDownload() {
  const mutation = useMutation({
    mutationFn: (fileId: string) => fileService.getDownloadUrl(fileId),
    onSuccess: (info: FileDownloadInfo) => {
      triggerBrowserDownload(info.downloadUrl, info.fileName);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    download: (fileId: string) => mutation.mutate(fileId),
    isDownloading: mutation.isPending,
  };
}
