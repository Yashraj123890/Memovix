"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownReport } from "@/features/ai-workspace/components/markdown-report";
import { CopyButton } from "@/features/ai-workspace/components/copy-button";
import { formatRelativeTime } from "@/utils/format-relative-time";
import { useMeetingNoteDetailQuery } from "@/features/meeting-notes/hooks/use-meeting-note-detail-query";
import type { MeetingNote } from "@/types/meeting-note";

interface MeetingNoteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  note: MeetingNote | null;
}

/**
 * Read-only view of a meeting note: summary, confirmed action items, and the
 * transcript (the auditable source). Decisions land in the Decision Log. Fetches
 * the full note so confirmed action items are included. No media playback — the
 * recording is never stored.
 */
export function MeetingNoteDetailDialog({
  open,
  onOpenChange,
  projectId,
  note,
}: MeetingNoteDetailDialogProps) {
  const detail = useMeetingNoteDetailQuery(projectId, open ? note?.id ?? null : null);
  const full = detail.data ?? note;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Meeting note
            {full?.status === "EXTRACTING" && <Badge variant="secondary">Extracting…</Badge>}
            {full?.status === "FAILED" && <Badge variant="destructive">Failed</Badge>}
          </DialogTitle>
          <DialogDescription>
            {full
              ? `${formatRelativeTime(full.createdAt)}${full.createdBy?.name ? ` · ${full.createdBy.name}` : ""}${full.transcriptSource ? ` · ${full.transcriptSource}` : ""}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        {full && (
          <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
            {full.status === "FAILED" && (
              <p className="text-destructive text-sm">
                {full.error ?? "Extraction failed."}
              </p>
            )}

            {/* Summary */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Summary</span>
                {full.summary && <CopyButton text={full.summary} />}
              </div>
              {full.summary ? (
                <MarkdownReport content={full.summary} />
              ) : (
                <p className="text-muted-foreground text-sm">
                  {full.status === "EXTRACTING"
                    ? "Still extracting…"
                    : "No summary for this note."}
                </p>
              )}
            </div>

            {/* Confirmed action items */}
            {full.actionItems && full.actionItems.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">
                    Action items ({full.actionItems.length})
                  </span>
                  <ul className="flex flex-col gap-2">
                    {full.actionItems.map((item) => (
                      <li
                        key={item.id}
                        className="border-border/60 flex flex-col gap-1 rounded-lg border p-3 text-sm"
                      >
                        <span>{item.description}</span>
                        <span className="text-muted-foreground flex flex-wrap gap-x-3 text-xs">
                          {item.owner && <span>Owner: {item.owner}</span>}
                          {item.dueDate && <span>Due: {item.dueDate}</span>}
                          <span>Status: {item.status}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground text-xs">
                    Decisions from this meeting are recorded in the Decision Log.
                  </p>
                </div>
              </>
            )}

            {/* Transcript */}
            <Separator />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Transcript</span>
                {full.rawText && <CopyButton text={full.rawText} />}
              </div>
              <div className="border-border/60 bg-muted/20 max-h-64 overflow-y-auto rounded-lg border p-4">
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {full.rawText}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
