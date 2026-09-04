"use client";

import { useParams } from "next/navigation";
import { RequirementsContainer } from "@/features/requirements/components/requirements-container";

/**
 * "/projects/[id]/requirements" — Structured Requirements + Baseline Scope
 * (blueprint §3.2.4). Same thin page → container shape as the other tabs.
 */
export default function ProjectRequirementsPage() {
  const { id } = useParams<{ id: string }>();

  return <RequirementsContainer projectId={id} />;
}
