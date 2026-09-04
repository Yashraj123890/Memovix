"use client";

import { useParams } from "next/navigation";
import { MemoriesContainer } from "@/features/memories/components/memories-container";

/**
 * "/projects/[id]/memories" — F8 replaces the F6 placeholder with the real
 * knowledge-base browsing view.
 */
export default function ProjectMemoriesPage() {
  const { id } = useParams<{ id: string }>();

  return <MemoriesContainer projectId={id} />;
}
