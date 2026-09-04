"use client";

import { useParams } from "next/navigation";
import { MemoryDetailView } from "@/features/memories/components/memory-detail-view";

/**
 * "/projects/[id]/memories/[memoryId]" — F12. The outer segment keeps the
 * existing `[id]` param name used throughout F6–F11 rather than renaming it
 * to `[projectId]`; the resulting URL is identical either way since Next.js
 * dynamic segment folder names never appear in the URL itself, and renaming
 * `[id]` would ripple into every sibling route under this layout for no
 * functional gain.
 */
export default function MemoryDetailPage() {
  const { id, memoryId } = useParams<{ id: string; memoryId: string }>();

  return <MemoryDetailView projectId={id} memoryId={memoryId} />;
}
