"use client";

import { useParams } from "next/navigation";
import { DeliverableDetailView } from "@/features/deliverables/components/deliverable-detail-view";

/**
 * "/projects/[id]/deliverables/[deliverableId]" — a single deliverable with
 * its version history (blueprint §3.1.6). Same nested-detail pattern as the
 * File and Memory detail pages.
 */
export default function DeliverableDetailPage() {
  const { id, deliverableId } = useParams<{ id: string; deliverableId: string }>();

  return <DeliverableDetailView projectId={id} deliverableId={deliverableId} />;
}
