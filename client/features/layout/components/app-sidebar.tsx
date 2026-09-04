"use client";

import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavList } from "@/features/layout/components/nav-list";
import { NavLink } from "@/features/layout/components/nav-link";
import { SETTINGS_NAV_ITEM } from "@/features/layout/config/navigation";
import { useSidebarStore } from "@/stores/sidebar.store";

/**
 * Persistent desktop/tablet sidebar (docs/prompts/F3-App-Layout.md
 * "Desktop: Persistent sidebar" / "Tablet: Collapsible sidebar" — this is
 * the same component at both sizes, just collapsible to an icon rail via
 * the sidebar store; only mobile switches to an off-canvas drawer, see
 * mobile-nav.tsx). Hidden below the `lg` breakpoint.
 */
export function AppSidebar() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground border-sidebar-border hidden shrink-0 flex-col border-r transition-[width] duration-200 lg:flex",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "border-sidebar-border flex h-14 shrink-0 items-center gap-2 border-b",
          isCollapsed ? "justify-center px-2" : "px-3",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpenIcon className="size-4" /> : <PanelLeftCloseIcon className="size-4" />}
        </Button>
        {!isCollapsed && (
          <>
            <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md text-sm font-semibold">
              M
            </span>
            <span className="truncate text-sm font-semibold">Memovix</span>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <NavList collapsed={isCollapsed} />
      </div>

      <div className="border-sidebar-border border-t p-2">
        <NavLink item={SETTINGS_NAV_ITEM} collapsed={isCollapsed} />
      </div>
    </aside>
  );
}
