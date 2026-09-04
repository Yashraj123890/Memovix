"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, FileQuestionIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FadeIn } from "@/components/motion/fade-in";
import { CommentsSection } from "@/features/comments/components/comments-section";
import { getMemoryCategoryLabel } from "@/features/memories/config/category";
import { useMemoryDetail } from "@/features/memories/hooks/use-memory-detail";
import { MemoryDetailSkeleton } from "@/features/memories/components/memory-detail-skeleton";
import { MemoryFormDialog } from "@/features/memories/components/memory-form-dialog";
import { DeleteMemoryDialog } from "@/features/memories/components/delete-memory-dialog";
import { formatRelativeTime } from "@/utils/format-relative-time";
import { getErrorMessage } from "@/utils/error";

interface MemoryDetailViewProps {
  projectId: string;
  memoryId: string;
}

/**
 * Page -> this container -> useMemoryDetail, which now calls
 * GET /memories/:memoryId directly. CommentsSection (F11) is reused
 * exactly as built — no comment logic lives here.
 */
export function MemoryDetailView({ projectId, memoryId }: MemoryDetailViewProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { memory, isLoading, isError, error, refetch, notFound } = useMemoryDetail(memoryId);

  const backLink = (
    <Link
      href={`/projects/${projectId}/memories`}
      className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm transition-colors"
    >
      <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
      Memories
    </Link>
  );

  if (isLoading) {
    return <MemoryDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      </div>
    );
  }

  if (notFound || !memory) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <EmptyState
          icon={<FileQuestionIcon className="size-5" />}
          title="Memory not found"
          description="This memory may have been deleted or moved."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        {backLink}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setEditOpen(true)}
          >
            <PencilIcon className="size-3.5" aria-hidden="true" />
            Edit
          </Button>
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
      </div>

      <FadeIn>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-foreground text-xl font-semibold">{memory.title}</h1>
              <Badge variant="outline" className="shrink-0">
                {getMemoryCategoryLabel(memory)}
              </Badge>
            </div>

            <p className="text-foreground text-sm whitespace-pre-line">{memory.content}</p>

            <Separator />

            <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span>{memory.createdBy?.name ?? "Unknown author"}</span>
              <span>Created {formatRelativeTime(memory.createdAt)}</span>
              <span>Updated {formatRelativeTime(memory.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.08}>
        <CommentsSection subjectType="MEMORY" subjectId={memory.id} />
      </FadeIn>

      <MemoryFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        projectId={projectId}
        memory={memory}
      />

      <DeleteMemoryDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        projectId={projectId}
        memory={memory}
        onDeleted={() => router.push(`/projects/${projectId}/memories`)}
      />
    </div>
  );
}
