"use client";

import { getFileTypeConfig } from "@/features/files/config/file-type";
import { useFileDownloadUrlQuery } from "@/features/files/hooks/use-file-download-url-query";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion/fade-in";
import type { ProjectFile } from "@/types/file";

interface FilePreviewProps {
  file: ProjectFile;
}

/**
 * Images are the only type rendered as a real inline preview, via the
 * signed URL from GET /files/:fileId/download (the only endpoint that
 * returns anything resembling file content — see file.service.ts). No
 * backend endpoint returns raw bytes for other formats and building
 * per-format viewers (PDF, video, docs) is out of scope for F12, so
 * everything else gets an icon + type placeholder from the same
 * getFileTypeConfig lookup Files (F9) already uses.
 */
export function FilePreview({ file }: FilePreviewProps) {
  const { icon: Icon, label, category } = getFileTypeConfig(file.originalName);
  const isImage = category === "image";

  const { data, isLoading } = useFileDownloadUrlQuery(file.id, isImage);

  if (isImage) {
    return (
      <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-lg border">
        {isLoading ? (
          <Skeleton className="size-full" />
        ) : data ? (
          <FadeIn className="flex size-full items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote signed URL, same pattern as components/ui/avatar.tsx */}
            <img
              src={data.downloadUrl}
              alt={file.originalName}
              className="size-full object-contain"
            />
          </FadeIn>
        ) : (
          <Icon className="text-muted-foreground size-10" aria-hidden="true" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-muted flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border">
      <Icon className="text-muted-foreground size-10" aria-hidden="true" />
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}
