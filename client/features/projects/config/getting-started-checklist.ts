import { getWorkspaceTabHref } from "@/features/projects/config/workspace-tabs";

export interface GettingStartedItem {
  id: string;
  label: string;
  description: string;
  /** Present = a real destination exists today; absent = not built on the frontend yet (shown as "Coming soon", never a dead link). */
  href?: string;
}

/**
 * Backs the first-project onboarding nudge (see getting-started-checklist.tsx).
 * "Invite team members" links to the Team tab, which supports adding an
 * existing workspace member to this project — inviting a brand-new person
 * by email now lives on the top-level "/members" page instead (Member
 * Invitation is workspace-scoped on the backend, not project-scoped), so
 * this item is intentionally still scoped to what the Team tab itself does.
 * "Invite a client" now links to the real Clients tab
 * (server/src/routes/clientInvitation.routes.ts POST
 * /projects/:projectId/invite-client, wired up in features/clients/).
 */
export function getGettingStartedChecklist(projectId: string): GettingStartedItem[] {
  return [
    {
      id: "invite-team",
      label: "Invite team members",
      description: "Add teammates from your workspace to this project.",
      href: getWorkspaceTabHref(projectId, "team"),
    },
    {
      id: "invite-client",
      label: "Invite a client",
      description: "Give a client access to this project.",
      href: getWorkspaceTabHref(projectId, "clients"),
    },
    {
      id: "upload-files",
      label: "Upload files",
      description: "Share documents your team and clients need.",
      href: getWorkspaceTabHref(projectId, "files"),
    },
    {
      id: "add-memory",
      label: "Add your first memory",
      description: "Capture a decision, note or update.",
      href: getWorkspaceTabHref(projectId, "memories"),
    },
  ];
}
