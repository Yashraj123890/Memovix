"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ProjectOverview } from "@/features/projects/components/project-overview";
import { GettingStartedChecklist } from "@/features/projects/components/getting-started-checklist";
import { useProjectQuery } from "@/features/projects/hooks/use-project-query";

/**
 * "/projects/[id]" — the Overview tab (index route). By the time this
 * mounts, the parent layout has already loaded the project successfully
 * (it gates {children} on that), so this read is a guaranteed cache hit —
 * no new network request, no separate loading state needed here.
 *
 * GettingStartedChecklist reads useSearchParams, which Next.js requires to
 * be wrapped in Suspense (otherwise this route opts out of static
 * rendering); the fallback is null since the checklist itself renders
 * nothing until it confirms `?onboarding=1` is present.
 */
export default function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProjectQuery(id);

  if (!project) return null;

  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={null}>
        <GettingStartedChecklist projectId={project.id} />
      </Suspense>
      <ProjectOverview project={project} />
    </div>
  );
}
