"use client";

import { useState } from "react";
import { FolderKanbanIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ProjectsToolbar } from "@/features/projects/components/projects-toolbar";
import { ProjectsGrid } from "@/features/projects/components/projects-grid";
import { ProjectsSkeleton } from "@/features/projects/components/projects-skeleton";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";
import { filterProjects } from "@/features/projects/utils/filter-projects";
import { getErrorMessage } from "@/utils/error";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ROLES } from "@/constants/roles";
import type { ProjectStatus } from "@/types/project";

/**
 * Projects feature container — the only place that calls useProjectsQuery
 * and owns search/status filter state, plus the CreateProjectDialog's open
 * state. app/(app)/projects/page.tsx stays a thin route wrapper
 * (usePageHeader + this component), matching the DashboardOverview pattern
 * from F4.
 *
 * GET /projects is role-aware server-side — a CLIENT gets only the
 * projects they're assigned to via ProjectClient, OWNER/MEMBER get every
 * project in the tenant (server/src/services/project.service.ts) — so this
 * component needs no branching to show the right list. The one thing that
 * doesn't apply to a CLIENT is *creating* a project (POST /projects is
 * OWNER/MEMBER-only), so `canCreate` hides that one action, same as
 * DashboardOverview's ProjectsOverview.
 */
export function ProjectsView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);

  const isClient = useAuthStore((state) => state.user?.role === USER_ROLES.CLIENT);

  const { data: projects, isLoading, isError, error, refetch } = useProjectsQuery();

  const filteredProjects = projects ? filterProjects(projects, { search, status }) : [];
  const hasProjects = (projects?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-4">
      <ProjectsToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        onNewProject={() => setCreateOpen(true)}
        canCreate={!isClient}
      />

      {isLoading ? (
        <ProjectsSkeleton />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanbanIcon className="size-5" />}
          title={hasProjects ? "No matching projects" : isClient ? "No projects assigned yet" : "No projects yet"}
          description={
            hasProjects
              ? "Try a different search term or status filter."
              : isClient
                ? "Projects you're invited to as a client will show up here."
                : "Create your first project to start capturing decisions, files and conversations."
          }
          action={
            !hasProjects &&
            !isClient && (
              <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                New project
              </Button>
            )
          }
        />
      ) : (
        <ProjectsGrid projects={filteredProjects} />
      )}

      {!isClient && <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />}
    </div>
  );
}
