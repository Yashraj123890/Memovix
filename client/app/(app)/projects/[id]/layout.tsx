"use client";

import { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { ErrorState } from "@/components/shared/error-state";
import { ProjectSidebar } from "@/features/projects/components/project-sidebar";
import { ProjectTabs } from "@/features/projects/components/project-tabs";
import { ProjectWorkspaceSkeleton } from "@/features/projects/components/project-workspace-skeleton";
import { useProjectQuery } from "@/features/projects/hooks/use-project-query";
import { usePageHeader } from "@/features/layout/hooks/use-page-header";
import { getErrorMessage } from "@/utils/error";
import { PROJECTS_ROUTE } from "@/constants/routes";
import { PROJECT_WORKSPACE_TABS } from "@/features/projects/config/workspace-tabs";
import type { Breadcrumb } from "@/stores/page-header.store";

/**
 * Shared shell for the whole project workspace (F6 routing decision: nested
 * routes per tab). Fetches the project once via useProjectQuery — every tab
 * route below reads the same cached query.
 *
 * Two-sidebar layout (Asana-style information architecture): the global
 * AppSidebar (app level) sits to the left; this layout adds a project-scoped
 * ProjectSidebar (project level) beside the content, so navigation reads as
 * GLOBAL SIDEBAR → PROJECT SIDEBAR → CONTENT. The content column takes all the
 * remaining width. Below `lg` the project sidebar is hidden and a horizontal
 * scrollable nav stands in, so small screens don't break.
 *
 * Also declares the header breadcrumb trail (Projects › {project} › {tab}) so
 * the top bar always shows where you are and links back up.
 */
export default function ProjectWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const { data: project, isLoading, isError, error, refetch } = useProjectQuery(id);

  const projectName = project?.name ?? "Project";

  // The active tab's segment is the path part after /projects/[id]; the Overview
  // tab is the index route (segment `null`). Map it to the tab's label.
  const activeTabLabel = useMemo(() => {
    const segment = pathname.split("/").filter(Boolean)[2] ?? null;
    return PROJECT_WORKSPACE_TABS.find((tab) => tab.segment === segment)?.label ?? null;
  }, [pathname]);

  const breadcrumbs = useMemo<Breadcrumb[]>(() => {
    const trail: Breadcrumb[] = [
      { label: "Projects", href: PROJECTS_ROUTE },
      { label: projectName, href: `/projects/${id}` },
    ];
    if (activeTabLabel) {
      trail.push({ label: activeTabLabel });
    }
    return trail;
  }, [projectName, id, activeTabLabel]);

  usePageHeader({ title: projectName, breadcrumbs });

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)]">
      {/* Project-scoped sidebar — the second nav level, beside the global one. */}
      <ProjectSidebar projectId={id} project={project} />

      {/* Project content fills the remaining width; responsive padding keeps it
          off the edges. */}
      <div className="flex min-w-0 flex-1 flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        {/* Small screens (project sidebar hidden): a horizontal scrollable nav. */}
        <div className="lg:hidden">
          <ProjectTabs projectId={id} />
        </div>

        {isLoading ? (
          <ProjectWorkspaceSkeleton />
        ) : isError ? (
          <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
        ) : project ? (
          children
        ) : null}
      </div>
    </div>
  );
}
