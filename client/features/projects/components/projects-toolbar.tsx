"use client";

import { PlusIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { STATUS_FILTER_OPTIONS } from "@/features/projects/config/status-filter";
import type { ProjectStatus } from "@/types/project";

interface ProjectsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: ProjectStatus | "ALL";
  onStatusChange: (value: ProjectStatus | "ALL") => void;
  onNewProject: () => void;
  /** Defaults to true (owner/member). False for a CLIENT viewer — see ProjectsView. */
  canCreate?: boolean;
}

/**
 * Search + status filter, plus the primary "New Project" entry point for
 * this page (mirrors the same action the dashboard's Quick Actions
 * shortcut triggers — both open the shared CreateProjectDialog). Search
 * and status are page-local UI state (see ProjectsView) filtered entirely
 * client-side — see features/projects/utils/filter-projects.ts for why.
 */
export function ProjectsToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onNewProject,
  canCreate = true,
}: ProjectsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <SearchIcon
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search projects..."
          className="pl-9"
          aria-label="Search projects"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by status">
          {STATUS_FILTER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={status === option.value ? "default" : "ghost"}
              onClick={() => onStatusChange(option.value)}
              aria-pressed={status === option.value}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {canCreate && (
          <Button type="button" size="sm" onClick={onNewProject}>
            <PlusIcon className="size-4" aria-hidden="true" />
            New project
          </Button>
        )}
      </div>
    </div>
  );
}
