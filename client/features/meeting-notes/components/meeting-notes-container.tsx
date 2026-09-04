"use client";

import { useState } from "react";
import { NotebookPenIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useAuthStore } from "@/stores/auth.store";
import { getErrorMessage } from "@/utils/error";
import { useMeetingNotesQuery } from "@/features/meeting-notes/hooks/use-meeting-notes-query";
import { MeetingNotesSkeleton } from "@/features/meeting-notes/components/meeting-notes-skeleton";
import { MeetingNoteCard } from "@/features/meeting-notes/components/meeting-note-card";
import { CreateMeetingNoteDialog } from "@/features/meeting-notes/components/create-meeting-note-dialog";
import { MeetingNoteDetailDialog } from "@/features/meeting-notes/components/meeting-note-detail-dialog";
import type { MeetingNote } from "@/types/meeting-note";

interface MeetingNotesContainerProps {
  projectId: string;
}

/**
 * Meeting Notes tab (blueprint §3.2.7). Lists saved notes and runs the
 * summarize → review → save flow. Internal-team tooling — OWNER/MEMBER only,
 * matching the backend routes.
 */
export function MeetingNotesContainer({
  projectId,
}: MeetingNotesContainerProps) {
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "OWNER" || role === "MEMBER";

  const {
    data: notes,
    isLoading,
    isError,
    error,
    refetch,
  } = useMeetingNotesQuery(projectId);
  const [createOpen, setCreateOpen] = useState(false);
  const [active, setActive] = useState<MeetingNote | null>(null);

  const hasNotes = (notes?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Meeting Notes</h2>
          <p className="text-muted-foreground text-sm">
            Record, upload, or paste a meeting. The AI extracts a summary,
            decisions, and action items you review before saving to project
            memory.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon aria-hidden="true" />
            New meeting note
          </Button>
        )}
      </div>

      {isLoading ? (
        <MeetingNotesSkeleton />
      ) : isError ? (
        <ErrorState
          description={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : !hasNotes ? (
        <EmptyState
          icon={<NotebookPenIcon className="size-5" />}
          title="No meeting notes yet"
          description={
            canManage
              ? "Paste raw meeting notes and let the AI summarize them into a structured record."
              : "Summarized meeting notes will appear here as the team adds them."
          }
          action={
            canManage ? (
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon aria-hidden="true" />
                New meeting note
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {notes!.map((note) => (
            <MeetingNoteCard key={note.id} note={note} onOpen={setActive} />
          ))}
        </div>
      )}

      {canManage && (
        <CreateMeetingNoteDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          projectId={projectId}
        />
      )}
      <MeetingNoteDetailDialog
        open={active !== null}
        onOpenChange={(open) => !open && setActive(null)}
        projectId={projectId}
        note={active}
      />
    </div>
  );
}
