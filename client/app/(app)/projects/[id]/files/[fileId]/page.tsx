"use client";

import { useParams } from "next/navigation";
import { FileDetailView } from "@/features/files/components/file-detail-view";

/**
 * "/projects/[id]/files/[fileId]" — F12. Same `[id]` param-naming rationale
 * as the memory detail route (see that page's comment).
 */
export default function FileDetailPage() {
  const { id, fileId } = useParams<{ id: string; fileId: string }>();

  return <FileDetailView projectId={id} fileId={fileId} />;
}
