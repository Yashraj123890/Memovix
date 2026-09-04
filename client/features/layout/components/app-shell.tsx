import type { ReactNode } from "react";
import { AppSidebar } from "@/features/layout/components/app-sidebar";
import { AppHeader } from "@/features/layout/components/app-header";
import { MobileNav } from "@/features/layout/components/mobile-nav";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Composition root for the authenticated shell — the one place that
 * assembles sidebar + header + mobile drawer + main content area. Rendered
 * by app/(app)/layout.tsx, inside RequireAuth (route protection lives at
 * the layout level, not here, so this component stays focused on
 * structure).
 *
 * A no-op wrapper otherwise (no hooks of its own), so it stays a Server
 * Component per docs/coding-standards.md "Performance" — everything inside
 * that actually needs the browser declares its own "use client".
 *
 * One TooltipProvider wraps the whole shell so the collapsed sidebar's
 * per-item tooltips (features/layout/components/nav-link.tsx) share a
 * single hover-delay group instead of each re-triggering the delay.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <TooltipProvider>
      <div className="flex h-dvh overflow-hidden">
        <AppSidebar />
        <MobileNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
