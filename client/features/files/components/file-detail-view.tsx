"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, DownloadIcon, FileQuestionIcon, Trash2Icon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FadeIn } from "@/components/motion/fade-in";
import { FilePreview } from "@/features/files/components/file-preview";
import { FileDetailSkeleton } from "@/features/files/components/file-detail-skeleton";
import { FileIngestStatusBadge } from "@/features/files/components/file-ingest-status-badge";
import { DeleteFileDialog } from "@/features/files/components/delete-file-dialog";
import { useFileDetail } from "@/features/files/hooks/use-file-detail";
import { useFileDownload } from "@/features/files/hooks/use-file-download";
import { getFileTypeConfig } from "@/features/files/config/file-type";
import { formatBytes } from "@/utils/format-bytes";
import { formatRelativeTime } from "@/utils/format-relative-time";
import { getErrorMessage } from "@/utils/error";

interface FileDetailViewProps {
  projectId: string;
  fileId: string;
}

/**
 * Page -> this container -> useFileDetail (see that hook for why it
 * derives from the list query rather than a single-file endpoint, which
 * doesn't exist). The primary action here is downloading the actual file
 * (useFileDownload) so the user can open/view it in their own viewer.
 */
export function FileDetailView({ projectId, fileId }: FileDetailViewProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { file, isLoading, isError, error, refetch, notFound } = useFileDetail(projectId, fileId);
  const { download, isDownloading } = useFileDownload();

  const backLink = (
    <Link
      href={`/projects/${projectId}/files`}
      className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm transition-colors"
    >
      <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
      Files
    </Link>
  );

  if (isLoading) {
    return <FileDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      </div>
    );
  }

  if (notFound || !file) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <EmptyState
          icon={<FileQuestionIcon className="size-5" />}
          title="File not found"
          description="This file may have been deleted or moved."
        />
      </div>
    );
  }

  const { label } = getFileTypeConfig(file.originalName);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        {backLink}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive gap-1.5"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2Icon className="size-3.5" aria-hidden="true" />
          Delete
        </Button>
      </div>

      <FadeIn>
        <Card>
          <CardContent className="flex flex-col gap-5">
            <FilePreview file={file} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col gap-2">
                <h1 className="text-foreground text-lg font-semibold break-words">
                  {file.originalName}
                </h1>
                {file.ingestStatus ? (
                  <FileIngestStatusBadge
                    status={file.ingestStatus}
                    title={file.ingestError ?? undefined}
                  />
                ) : null}
              </div>

              <Button
                type="button"
                className="w-full gap-1.5 sm:w-auto sm:shrink-0"
                onClick={() => download(file.id)}
                disabled={isDownloading}
              >
                <DownloadIcon className="size-4" aria-hidden="true" />
                {isDownloading ? "Preparing…" : "Download"}
              </Button>
            </div>

            <Separator />

            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-4">
              <DetailItem label="Type" value={label} />
              <DetailItem label="Size" value={formatBytes(file.size)} />
              <DetailItem label="Uploaded" value={formatRelativeTime(file.createdAt)} />
              <DetailItem label="Uploaded by" value={file.uploadedBy?.name ?? "Unknown"} />
            </dl>
          </CardContent>
        </Card>
      </FadeIn>

      <DeleteFileDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        projectId={projectId}
        file={file}
        onDeleted={() => router.push(`/projects/${projectId}/files`)}
      />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-foreground truncate font-medium" title={value}>
        {value}
      </dd>
    </div>
  );
}
