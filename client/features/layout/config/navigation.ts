import { FolderKanban, LayoutDashboard, Settings, Users, type LucideIcon } from "lucide-react";
import {
  DASHBOARD_ROUTE,
  PROJECTS_ROUTE,
  SETTINGS_ROUTE,
  WORKSPACE_MEMBERS_ROUTE,
} from "@/constants/routes";
import type { UserRole } from "@/constants/roles";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles allowed to see this item. Omitted = everyone (OWNER/MEMBER/CLIENT). */
  roles?: UserRole[];
}

/**
 * Centralized nav config (docs/prompts/F3-App-Layout.md: "Navigation
 * should be data-driven instead of hardcoded"). AppSidebar and MobileNav
 * both render this same list via NavList — add a future module here, not
 * inside either component.
 *
 * Deliberately limited to routes that are real, top-level pages. The app
 * is project-centric (see the F6 workspace routing decision): Timeline,
 * Memories, Files, AI Search and Team are all real, backend-integrated
 * features, but they only exist as tabs under /projects/[id]/..., not as
 * standalone routes — so they belong in the Project Workspace nav, not
 * here. Settings has no page at all yet, so it's omitted rather than
 * linking to nothing. Add an entry here only once a feature has a genuine
 * top-level page at that route.
 *
 * "Members" was added because Member Invitation (server/src/routes/member.routes.ts)
 * is tenant-scoped, not project-scoped — it belongs at this level, not as a
 * project workspace tab. See features/team/components/workspace-members-container.tsx.
 * It's OWNER/MEMBER-only (`roles` below) — workspace member management is
 * an internal-team concern, not something a CLIENT viewer should see, even
 * though GET /members/workspace itself has no role restriction server-side.
 * See NavList for where this filter is applied.
 *
 * Notifications is intentionally NOT here — it's reached via the bell in the
 * top-right header (features/notifications/components/notification-bell.tsx),
 * so a sidebar entry would be redundant. The /notifications page still exists.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: DASHBOARD_ROUTE, icon: LayoutDashboard },
  { label: "Projects", href: PROJECTS_ROUTE, icon: FolderKanban },
  { label: "Members", href: WORKSPACE_MEMBERS_ROUTE, icon: Users, roles: ["OWNER", "MEMBER"] },
];

/**
 * Rendered separately at the BOTTOM of the sidebar / mobile drawer (see
 * AppSidebar + MobileNav), visually divided from the main NAV_ITEMS list, so
 * it stays pinned even when the main nav grows. Not part of NAV_ITEMS on
 * purpose — it's a footer-level destination, not a primary section.
 */
export const SETTINGS_NAV_ITEM: NavItem = {
  label: "Settings",
  href: SETTINGS_ROUTE,
  icon: Settings,
};
