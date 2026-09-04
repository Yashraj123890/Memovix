"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PROJECT_WORKSPACE_TABS, getWorkspaceTabHref } from "@/features/projects/config/workspace-tabs";
import { useAuthStore } from "@/stores/auth.store";

interface ProjectTabsProps {
  projectId: string;
}

/**
 * Project-level navigation bar. Mirrors the global sidebar's NavLink styling
 * (rounded pills, `bg-accent` active state, muted→accent hover) but laid out
 * horizontally and scoped to the current project — a project nav that reads like
 * the app's global nav, one level down.
 *
 * Each item is a real nested route under /projects/[id] (docs: F6 routing
 * decision), so every section stays deep-linkable with its own history entry.
 * The bar scrolls horizontally when the items exceed the available width, so it
 * works on smaller screens. Filtered by the current user's role (a tab with no
 * `roles` is visible to everyone) — a UI-visibility choice, not a security
 * boundary (see the WorkspaceTab `roles` doc).
 */
export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);
  const tabs = PROJECT_WORKSPACE_TABS.filter((tab) => !tab.roles || (role && tab.roles.includes(role)));

  // Active section = the segment after /projects/[id] (Overview is the index,
  // segment `null`). Derived the same way as the layout's breadcrumb, so a tab
  // stays highlighted on its detail sub-routes too (e.g. a deliverable detail).
  const activeSegment = pathname.split("/").filter(Boolean)[2] ?? null;

  return (
    <nav
      className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto rounded-lg border bg-card p-1"
      aria-label="Project sections"
    >
      {tabs.map((tab) => {
        const href = getWorkspaceTabHref(projectId, tab.segment);
        const isActive = tab.segment === activeSegment;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.label}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
