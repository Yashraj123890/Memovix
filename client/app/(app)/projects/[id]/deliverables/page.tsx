"use client";

import { useParams } from "next/navigation";
import { DeliverablesContainer } from "@/features/deliverables/components/deliverables-container";

/**
 * "/projects/[id]/deliverables" — the deliverables list for a project
 * (blueprint §3.1.5). Same thin page → container shape as the Files tab.
 */
export default function ProjectDeliverablesPage() {
  const { id } = useParams<{ id: string }>();

  return <DeliverablesContainer projectId={id} />;
}
