/**
 * Central route constants for auth-driven redirects (see
 * features/auth/components/require-auth.tsx and require-guest.tsx) and for
 * the nav config (see features/layout/config/navigation.ts).
 */
export const LOGIN_ROUTE = "/login";
export const REGISTER_ROUTE = "/register";

/**
 * Post-login workspace chooser for CLIENTs that belong to more than one
 * workspace (M11). A top-level route (outside the app shell) — see
 * app/choose-workspace/. Single-workspace clients and owners/members never
 * land here.
 */
export const CHOOSE_WORKSPACE_ROUTE = "/choose-workspace";

/**
 * Redirect target for an already-authenticated user (e.g. after login, or
 * when a signed-in user visits /login) - also the Dashboard nav entry's
 * href. F3 (App Layout) puts a placeholder page here; F4 (Dashboard) will
 * fill it in without changing this constant.
 */
export const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard";
export const DASHBOARD_ROUTE = DEFAULT_AUTHENTICATED_ROUTE;

export const PROJECTS_ROUTE = "/projects";
export const NOTIFICATIONS_ROUTE = "/notifications";

/**
 * Account/workspace settings. Rendered as a bottom-pinned sidebar entry (see
 * features/layout/config/navigation.ts SETTINGS_NAV_ITEM). Currently a minimal
 * placeholder page — the actual settings UI is a separate, later task.
 */
export const SETTINGS_ROUTE = "/settings";

/**
 * Workspace-wide member directory + invitations — a real top-level page
 * (not project-scoped), since MemberInvitation/GET /members/workspace are
 * tenant-scoped on the backend, not per-project. See
 * features/team/components/workspace-members-container.tsx.
 */
export const WORKSPACE_MEMBERS_ROUTE = "/members";

/**
 * NOT real top-level pages. Memories, Files and AI Search all shipped as
 * project-scoped tabs under /projects/[id]/... instead (F7/F8/F9/F13,
 * per the F6 project-centric architecture decision), so these three
 * routes have no page.tsx behind them and are no longer linked from
 * global navigation (see features/layout/config/navigation.ts). Kept only
 * because features/dashboard's Quick Actions and AI shortcut still link to
 * them (real navigation config, not mock data — see
 * features/dashboard/config/quick-actions.ts) since none of Memories/
 * Files/AI Search have a project-agnostic creation flow yet. If those
 * widgets are redesigned to link into a specific project instead, these
 * can be deleted too.
 */
export const MEMORIES_ROUTE = "/memories";
export const FILES_ROUTE = "/files";
export const AI_SEARCH_ROUTE = "/ai-search";
