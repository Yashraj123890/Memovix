"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  PROJECT_WORKSPACE_TABS,
  getWorkspaceTabHref,
} from "@/features/projects/config/workspace-tabs";
import { PROJECT_STATUS_BADGE_VARIANT } from "@/features/projects/config/status-filter";
import { ProjectActionsMenu } from "@/features/projects/components/project-actions-menu";
import { useAuthStore } from "@/stores/auth.store";
import { useProjectSidebarStore } from "@/stores/project-sidebar.store";
import type { Project } from "@/types/project";

interface ProjectSidebarProps {
  projectId: string;
  /** Undefined while the project query is loading — the identity shows a skeleton. */
  project?: Project;
}

/**
 * Project-scoped sidebar — the SECOND navigation level (Asana-style
 * two-sidebar architecture): global sidebar → project sidebar → content.
 * Sits beside the global AppSidebar, sharing its structure, design tokens
 * (`bg-sidebar`, header row, scrollable body) AND its collapse behaviour — a
 * toggle button rails it to icons (with tooltips), persisted per the
 * useProjectSidebarStore, just like the global sidebar.
 *
 * Vertically stacked nav (NOT a horizontal tab bar), reusing the same active/
 * hover treatment as the global NavLink. Each item is a real nested route under
 * /projects/[id]; nothing here changes routes. Desktop only (`lg`+) — below that
 * the layout falls back to a horizontal scrollable nav (see the project layout).
 * Role-filtered (a tab with no `roles` is visible to everyone) — a UI-visibility
 * choice, not a security boundary.
 */
export function ProjectSidebar({ projectId, project }: ProjectSidebarProps) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);
  const isCollapsed = useProjectSidebarStore((state) => state.isCollapsed);
  const toggleCollapsed = useProjectSidebarStore((state) => state.toggleCollapsed);

  const tabs = PROJECT_WORKSPACE_TABS.filter((tab) => !tab.roles || (role && tab.roles.includes(role)));

  // Active section = the segment after /projects/[id] (Overview is the index,
  // segment `null`), derived the same way as the layout's breadcrumb, so a tab
  // stays highlighted on its detail sub-routes too.
  const activeSegment = pathname.split("/").filter(Boolean)[2] ?? null;

  return (
    <aside
      aria-label="Project navigation"
      className={cn(
        "bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-[calc(100dvh-3.5rem)] shrink-0 flex-col border-r transition-[width] duration-200 lg:flex",
        isCollapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "border-sidebar-border flex flex-col gap-2 border-b",
          isCollapsed ? "items-center p-2" : "p-4",
        )}
      >
        <div className={cn("flex w-full items-center", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <span className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
              Project
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? "Expand project sidebar" : "Collapse project sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpenIcon className="size-4" />
            ) : (
              <PanelLeftCloseIcon className="size-4" />
            )}
          </Button>
        </div>

        {!isCollapsed &&
          (project ? (
            <>
              <h2 className="text-foreground truncate text-sm font-semibold" title={project.name}>
                {project.name}
              </h2>
              <div className="flex items-center justify-between gap-2">
                <Badge variant={PROJECT_STATUS_BADGE_VARIANT[project.status]} className="w-fit capitalize">
                  {project.status.toLowerCase()}
                </Badge>
                <ProjectActionsMenu project={project} />
              </div>
            </>
          ) : (
            <>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </>
          ))}
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Project sections">
        <ul className="flex flex-col gap-1">
          {tabs.map((tab) => {
            const href = getWorkspaceTabHref(projectId, tab.segment);
            const isActive = tab.segment === activeSegment;
            const Icon = tab.icon;

            const link = (
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isCollapsed && "justify-center px-2",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span className="truncate">{tab.label}</span>}
              </Link>
            );

            return (
              <li key={tab.label}>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{tab.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  link
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
