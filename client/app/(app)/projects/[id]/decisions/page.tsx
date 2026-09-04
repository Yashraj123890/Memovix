"use client";

import { useParams } from "next/navigation";
import { DecisionsContainer } from "@/features/decisions/components/decisions-container";

/**
 * "/projects/[id]/decisions" — the project Decision Log (blueprint §3.2.9).
 * Same thin page → container shape as the Deliverables and Files tabs.
 */
export default function ProjectDecisionsPage() {
  const { id } = useParams<{ id: string }>();

  return <DecisionsContainer projectId={id} />;
}
