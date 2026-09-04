"use client";

import { NAV_ITEMS } from "@/features/layout/config/navigation";
import { NavLink } from "@/features/layout/components/nav-link";
import { useAuthStore } from "@/stores/auth.store";

interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

/**
 * Renders NAV_ITEMS as NavLinks — the one place that maps config to UI.
 * Filters by the current user's role first (an item with no `roles` is
 * visible to everyone) — this is the single place that decision is made,
 * so AppSidebar and MobileNav (both render this component) never drift.
 */
export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const role = useAuthStore((state) => state.user?.role);
  const items = NAV_ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role)));

  return (
    <nav className="flex flex-col gap-1 p-2" aria-label="Main navigation">
      {items.map((item) => (
        <NavLink key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
