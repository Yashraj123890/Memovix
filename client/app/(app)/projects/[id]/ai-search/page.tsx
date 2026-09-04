"use client";

import { useParams } from "next/navigation";
import { AiSearchContainer } from "@/features/ai-search/components/ai-search-container";

/**
 * "/projects/[id]/ai-search" — F13 replaces the F6 placeholder with the
 * real semantic search view, calling POST /api/ai/search.
 */
export default function ProjectAiSearchPage() {
  const { id } = useParams<{ id: string }>();

  return <AiSearchContainer projectId={id} />;
}
