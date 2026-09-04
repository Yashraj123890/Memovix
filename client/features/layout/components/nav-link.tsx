"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsActivePath } from "@/features/layout/hooks/use-active-path";
import type { NavItem } from "@/features/layout/config/navigation";

interface NavLinkProps {
  item: NavItem;
  /** Icon-only rail mode (desktop/tablet only — see nav-list.tsx). */
  collapsed?: boolean;
  /** Called after navigating, e.g. to close the mobile drawer. */
  onNavigate?: () => void;
}

/**
 * Single nav entry. Shared by AppSidebar and MobileNav via NavList so
 * active-state logic and markup exist exactly once (docs/coding-standards.md
 * "Never duplicate business logic").
 */
export function NavLink({ item, collapsed = false, onNavigate }: NavLinkProps) {
  const isActive = useIsActivePath(item.href);
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-2",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
