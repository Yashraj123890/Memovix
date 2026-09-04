import Link from "next/link";
import { FolderKanbanIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PROJECTS_ROUTE } from "@/constants/routes";
import { getWorkspaceTabHref } from "@/features/projects/config/workspace-tabs";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { Project, ProjectStatus } from "@/types/project";

interface ProjectsOverviewProps {
  projects: Project[];
  isLoading: boolean;
  isError: boolean;
  onNewProject: () => void;
  /**
   * Defaults to true (owner/member). Set false for a CLIENT viewer — POST
   * /projects only allows OWNER/MEMBER server-side (project.routes.ts
   * authorize(UserRole.OWNER, UserRole.MEMBER)), so a client would only hit
   * a 403 if this button did anything; the empty state copy changes to
   * match instead of showing a dead-end action.
   */
  canCreate?: boolean;
}

const STATUS_VARIANT: Record<ProjectStatus, "success" | "secondary" | "outline"> = {
  ACTIVE: "success",
  COMPLETED: "secondary",
  ARCHIVED: "outline",
};

/**
 * Real GET /projects data only — no member count or growth trend, since
 * the backend doesn't compute either (see types/project.ts's Project,
 * which mirrors the Prisma row exactly). "Most recently updated" is a real
 * sort on real `updatedAt`, not decorative copy. GET /projects itself is
 * now role-aware server-side (CLIENT gets only their assigned projects via
 * ProjectClient, OWNER/MEMBER get the whole tenant) — this component
 * doesn't need to know which, it just renders whatever list it's handed.
 */
export function ProjectsOverview({
  projects,
  isLoading,
  isError,
  onNewProject,
  canCreate = true,
}: ProjectsOverviewProps) {
  const activeCount = projects.filter((project) => project.status === "ACTIVE").length;
  const completedCount = projects.filter((project) => project.status === "COMPLETED").length;
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  return (
    <SectionCard
      title="Projects"
      description="Your most recently updated work"
      action={
        <Link href={PROJECTS_ROUTE} className="text-primary text-xs font-medium hover:underline">
          View all
        </Link>
      }
    >
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <ErrorState description="We couldn't load your projects." className="py-8" />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanbanIcon className="size-5" />}
          title={canCreate ? "No projects yet" : "No projects assigned yet"}
          description={
            canCreate
              ? "Create your first project to start capturing decisions, files and conversations."
              : "Projects you're invited to as a client will show up here."
          }
          action={
            canCreate ? (
              <Button type="button" size="sm" onClick={onNewProject}>
                New project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Active" value={activeCount} />
            <StatCard label="Completed" value={completedCount} />
            <StatCard label="Total" value={projects.length} />
          </div>

          <ul className="flex flex-col gap-1">
            {recentProjects.map((project) => (
              <li key={project.id}>
                <Link
                  href={getWorkspaceTabHref(project.id, null)}
                  className="hover:bg-accent -mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors"
                >
                  <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
                    <FolderKanbanIcon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{project.name}</span>
                  <Badge variant={STATUS_VARIANT[project.status]} className="shrink-0 capitalize">
                    {project.status.toLowerCase()}
                  </Badge>
                  <span className="text-muted-foreground w-20 shrink-0 text-right text-xs">
                    {formatRelativeTime(project.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </SectionCard>
  );
}
