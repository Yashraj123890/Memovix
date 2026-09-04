"use client";

import { useParams } from "next/navigation";
import { TimelineContainer } from "@/features/timeline/components/timeline-container";

/**
 * "/projects/[id]/timeline" — F7 replaces the F6 placeholder with the real
 * activity feed. The parent workspace layout has already resolved the
 * project by the time this mounts; this route only needs the id param to
 * fetch the timeline itself.
 */
export default function ProjectTimelinePage() {
  const { id } = useParams<{ id: string }>();

  return <TimelineContainer projectId={id} />;
}
