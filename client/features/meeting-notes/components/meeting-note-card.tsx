"use client";

import { CalendarClockIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { MeetingNote } from "@/types/meeting-note";

interface MeetingNoteCardProps {
  note: MeetingNote;
  onOpen: (note: MeetingNote) => void;
}

/** Compact meeting-note card — click to open the full raw text + summary. */
export function MeetingNoteCard({ note, onOpen }: MeetingNoteCardProps) {
  const preview = (note.summary ?? note.rawText)
    .replace(/[#*_>`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(note)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(note);
        }
      }}
      className="hover:border-primary/40 cursor-pointer transition-colors"
    >
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <CalendarClockIcon className="size-3.5" aria-hidden="true" />
          <span>{formatRelativeTime(note.createdAt)}</span>
          {note.createdBy?.name && <span>· {note.createdBy.name}</span>}
          {note.status === "EXTRACTING" && (
            <Badge variant="secondary" className="ml-auto gap-1">
              <Spinner className="size-3" />
              Extracting
            </Badge>
          )}
          {note.status === "FAILED" && (
            <Badge variant="destructive" className="ml-auto">
              Failed
            </Badge>
          )}
        </div>
        <p className="line-clamp-3 text-sm">
          {note.status === "EXTRACTING"
            ? "Extracting summary, decisions & action items…"
            : preview || "No summary"}
        </p>
      </CardContent>
    </Card>
  );
}
