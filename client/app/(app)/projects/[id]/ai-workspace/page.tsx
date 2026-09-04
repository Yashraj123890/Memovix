"use client";

import { useParams } from "next/navigation";
import { AiWorkspaceTabs } from "@/features/ai-workspace/components/ai-workspace-tabs";
import { useProjectQuery } from "@/features/projects/hooks/use-project-query";

/**
 * "/projects/[id]/ai-workspace" — Chat and Project Summary, backed by
 * POST /api/ai/{ask,summary}. (Requirement extraction, comparison and scope
 * analysis moved to the dedicated Requirements tab.) The parent layout
 * (app/(app)/projects/[id]/layout.tsx) already loaded the project
 * successfully before rendering {children}, so this `useProjectQuery` call
 * is a cache hit — same pattern as the Overview tab.
 */
export default function ProjectAiWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProjectQuery(id);

  if (!project) return null;

  return <AiWorkspaceTabs projectId={project.id} projectName={project.name} />;
}
