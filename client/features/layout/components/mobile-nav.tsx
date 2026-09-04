"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NavList } from "@/features/layout/components/nav-list";
import { NavLink } from "@/features/layout/components/nav-link";
import { SETTINGS_NAV_ITEM } from "@/features/layout/config/navigation";
import { useSidebarStore } from "@/stores/sidebar.store";

/**
 * Off-canvas drawer for mobile (docs/prompts/F3-App-Layout.md "Mobile:
 * Drawer navigation"). Opened via the hamburger button in AppHeader; both
 * read/write the same sidebar store so they stay in sync without prop
 * drilling between components that don't otherwise share a parent.
 */
export function MobileNav() {
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
        <SheetHeader className="border-border flex-row items-center gap-2 space-y-0 border-b">
          <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md text-sm font-semibold">
            M
          </span>
          <SheetTitle>Memovix</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <NavList collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </div>
        <div className="border-border border-t p-2">
          <NavLink
            item={SETTINGS_NAV_ITEM}
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
