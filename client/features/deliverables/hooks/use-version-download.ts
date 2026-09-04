"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deliverableService } from "@/services/api/deliverable.service";
import { getErrorMessage } from "@/utils/error";
import { triggerBrowserDownload } from "@/utils/trigger-browser-download";

import type { DeliverableVersion } from "@/types/deliverable";

type PendingMode = "preview" | "download";

interface PendingState {
  versionId: string;
  mode: PendingMode;
}

/**
 * Fetches a fresh signed URL for a deliverable version and either opens it
 * inline in a new tab (Preview) or forces a real download (Download). Reuses
 * the existing authorized GET /deliverables/:id/versions/:versionId/download
 * endpoint — Download adds ?disposition=attachment so the file downloads with
 * its correct name across types (see deliverable.service).
 */
export function useVersionDownload(deliverableId: string) {
  const [pending, setPending] = useState<PendingState | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  async function run(versionId: string, mode: PendingMode) {
    try {
      setPending({ versionId, mode });
      const { downloadUrl, fileName } = await deliverableService.getVersionDownloadUrl(
        deliverableId,
        versionId,
        { download: mode === "download" },
      );

      if (mode === "preview") {
        window.open(downloadUrl, "_blank", "noopener,noreferrer");
      } else {
        triggerBrowserDownload(downloadUrl, fileName);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPending(null);
    }
  }

  /** "Download All" — downloads every real version file, one after another. */
  async function downloadAll(versions: DeliverableVersion[]) {
    if (versions.length === 0) return;
    try {
      setIsDownloadingAll(true);
      for (const version of versions) {
        const { downloadUrl, fileName } = await deliverableService.getVersionDownloadUrl(
          deliverableId,
          version.id,
          { download: true },
        );
        triggerBrowserDownload(downloadUrl, fileName);
        // Small gap so the browser processes each download separately.
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDownloadingAll(false);
    }
  }

  return {
    preview: (versionId: string) => run(versionId, "preview"),
    download: (versionId: string) => run(versionId, "download"),
    downloadAll,
    isDownloadingAll,
    isPreviewing: (versionId: string) =>
      pending?.versionId === versionId && pending.mode === "preview",
    isDownloading: (versionId: string) =>
      pending?.versionId === versionId && pending.mode === "download",
  };
}
