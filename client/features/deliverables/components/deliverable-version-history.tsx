"use client";

import { DownloadIcon, EyeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFileTypeConfig } from "@/features/files/config/file-type";
import { useVersionDownload } from "@/features/deliverables/hooks/use-version-download";
import { formatBytes } from "@/utils/format-bytes";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { DeliverableVersion } from "@/types/deliverable";

interface DeliverableVersionHistoryProps {
  deliverableId: string;
  versions: DeliverableVersion[];
  currentVersionId: string | null;
}

/**
 * Vertical timeline of every uploaded version, newest first, with the current
 * version visually emphasized. Uses the real version data from the detail
 * endpoint; Preview/Download reuse the authorized signed-URL endpoint.
 */
export function DeliverableVersionHistory({
  deliverableId,
  versions,
  currentVersionId,
}: DeliverableVersionHistoryProps) {
  const { preview, download, isPreviewing, isDownloading } = useVersionDownload(deliverableId);

  if (versions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No versions uploaded yet.</p>
    );
  }

  return (
    <ol className="flex flex-col">
      {versions.map((version, index) => {
        const isLatest = version.id === currentVersionId;
        const isLast = index === versions.length - 1;
        const { icon: FileTypeIcon } = getFileTypeConfig(version.originalName);

        return (
          <li key={version.id} className="relative flex gap-3">
            {/* Rail: dot + connecting line */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 size-3 shrink-0 rounded-full border-2",
                  isLatest
                    ? "border-primary bg-primary"
                    : "border-border bg-background",
                )}
                aria-hidden="true"
              />
              {!isLast && <span className="bg-border w-px flex-1" aria-hidden="true" />}
            </div>

            <div
              className={cn(
                "mb-4 min-w-0 flex-1 rounded-lg border p-3",
                isLatest ? "border-primary/40 bg-primary/5" : "border-border",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground font-medium">v{version.versionNumber}</span>
                {isLatest && (
                  <Badge variant="info" className="px-1.5 py-0">
                    Latest
                  </Badge>
                )}
                <span className="text-muted-foreground text-xs">
                  Uploaded {formatRelativeTime(version.uploadedAt)}
                  {version.uploadedBy?.name ? ` by ${version.uploadedBy.name}` : ""}
                </span>
              </div>

              {version.changeSummary && (
                <p className="text-foreground/90 mt-1.5 text-sm whitespace-pre-wrap">
                  {version.changeSummary}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs">
                  <FileTypeIcon className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{version.originalName}</span>
                  <span className="shrink-0">· {formatBytes(version.size)}</span>
                </span>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={isPreviewing(version.id)}
                    onClick={() => preview(version.id)}
                  >
                    <EyeIcon className="size-4" aria-hidden="true" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={isDownloading(version.id)}
                    onClick={() => download(version.id)}
                  >
                    <DownloadIcon className="size-4" aria-hidden="true" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
