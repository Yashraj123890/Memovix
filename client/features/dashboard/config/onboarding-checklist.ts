export interface OnboardingChecklistItem {
  id: string;
  label: string;
  description: string;
  /** Present = actionable today; absent = unlocks once the workspace has at least one project. */
  action?: "create-project";
}

/**
 * Shown on the dashboard only when the owner has zero projects (see
 * dashboard-overview.tsx). Unlike GettingStartedChecklist (which is scoped
 * to one already-created project and links into that project's tabs), this
 * list has no projectId to link to yet — every step except creating the
 * first project depends on a project existing, so those are shown as
 * locked/"Coming next" rather than dead links.
 */
export const ONBOARDING_CHECKLIST: OnboardingChecklistItem[] = [
  {
    id: "create-project",
    label: "Create your first project",
    description: "Set up a workspace for a client engagement.",
    action: "create-project",
  },
  {
    id: "invite-team",
    label: "Invite your team",
    description: "Add teammates to a project once it exists.",
  },
  {
    id: "upload-files",
    label: "Upload files",
    description: "Share documents your team and clients need.",
  },
  {
    id: "add-memory",
    label: "Capture your first memory",
    description: "Record a decision, note or update.",
  },
];
