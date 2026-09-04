"use client";

import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/features/layout/components/breadcrumbs";
import { ThemeToggle } from "@/features/layout/components/theme-toggle";
import { UserMenu } from "@/features/layout/components/user-menu";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";
import { usePageHeaderStore } from "@/stores/page-header.store";
import { useSidebarStore } from "@/stores/sidebar.store";

/**
 * Sticky top bar: mobile nav trigger, breadcrumbs + page title (populated
 * by whatever page called usePageHeader), theme toggle, user menu (with
 * logout). Height (h-14) matches AppSidebar's header row so the two align.
 */
export function AppHeader() {
  const title = usePageHeaderStore((state) => state.title);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

  return (
    <header className="border-border bg-background sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <MenuIcon className="size-4" />
      </Button>

      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        <Breadcrumbs />
        <h1 className="text-foreground truncate text-sm font-semibold">
          {title}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <WorkspaceSwitcher />
        <NotificationBell />
        <ThemeToggle />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <UserMenu />
      </div>
    </header>
  );
}
