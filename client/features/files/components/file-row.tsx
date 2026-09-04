import { useState } from "react";
import Link from "next/link";
import { RefreshCwIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteFileDialog } from "@/features/files/components/delete-file-dialog";
import { FileIngestStatusBadge } from "@/features/files/components/file-ingest-status-badge";
import { getFileTypeConfig } from "@/features/files/config/file-type";
import { useReindexFileMutation } from "@/features/files/hooks/use-reindex-file-mutation";
import { useAuthStore } from "@/stores/auth.store";
import { formatBytes } from "@/utils/format-bytes";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { ProjectFile } from "@/types/file";

interface FileRowProps {
  file: ProjectFile;
  projectId: string;
}

/**
 * Row layout, not a card — file icon comes from the centralized
 * getFileTypeConfig lookup, never branched on here. `projectId` (F12) lets
 * the row link to /projects/[id]/files/[fileId]; the link wraps only the
 * name/meta/type/size cluster, not the trailing action-button column, so
 * the delete button below can sit outside the navigable area — same
 * separation TeamMemberRow (F10) uses between its content and its action
 * button.
 */
export function FileRow({ file, projectId }: FileRowProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { icon: Icon, label } = getFileTypeConfig(file.originalName);
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "OWNER" || role === "MEMBER";
  const reindexFile = useReindexFileMutation(projectId);

  return (
    <li className="flex items-center gap-3 px-6 py-3">
      <Link
        href={`/projects/${projectId}/files/${file.id}`}
        className="group flex min-w-0 flex-1 items-center gap-3"
      >
        <span className="bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary flex size-9 shrink-0 items-center justify-center rounded-md transition-colors">
          <Icon className="size-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-foreground group-hover:text-primary truncate text-sm font-medium transition-colors">
            {file.originalName}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {file.uploadedBy?.name ?? "Unknown"} · {formatRelativeTime(file.createdAt)}
          </p>
        </div>

        <span className="text-muted-foreground hidden w-20 shrink-0 text-xs sm:inline">
          {label}
        </span>
        <span className="text-muted-foreground w-16 shrink-0 text-right text-xs">
          {formatBytes(file.size)}
        </span>
      </Link>

      {file.ingestStatus && (
        <span className="hidden shrink-0 sm:inline">
          <FileIngestStatusBadge
            status={file.ingestStatus}
            title={file.ingestError ?? undefined}
          />
        </span>
      )}

      {canManage && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-8 shrink-0"
          aria-label={`Reindex ${file.originalName}`}
          title="Re-run document ingestion"
          loading={reindexFile.isPending}
          disabled={reindexFile.isPending}
          onClick={() => reindexFile.mutate(file.id)}
        >
          <RefreshCwIcon className="size-4" aria-hidden="true" />
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive size-8 shrink-0"
        aria-label={`Delete ${file.originalName}`}
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2Icon className="size-4" aria-hidden="true" />
      </Button>

      <DeleteFileDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        projectId={projectId}
        file={file}
      />
    </li>
  );
}
