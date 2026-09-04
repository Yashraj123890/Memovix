import type { ProjectStatus } from "@/types/project";

export interface StatusFilterOption {
  value: ProjectStatus | "ALL";
  label: string;
}

/** Options for the status filter control (ProjectsToolbar). */
export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

/**
 * Badge variant per status — matches
 * features/dashboard/components/projects-overview.tsx so status badges
 * look identical between the dashboard and this page.
 */
export const PROJECT_STATUS_BADGE_VARIANT: Record<
  ProjectStatus,
  "success" | "secondary" | "outline"
> = {
  ACTIVE: "success",
  COMPLETED: "secondary",
  ARCHIVED: "outline",
};
