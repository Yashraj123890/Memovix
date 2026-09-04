"use client";

import { useParams } from "next/navigation";
import { MeetingNotesContainer } from "@/features/meeting-notes/components/meeting-notes-container";

/**
 * "/projects/[id]/meeting-notes" — Meeting Notes Summarizer (blueprint §3.2.7).
 * Same thin page → container shape as the other tabs.
 */
export default function ProjectMeetingNotesPage() {
  const { id } = useParams<{ id: string }>();

  return <MeetingNotesContainer projectId={id} />;
}
