import {
  LayoutDashboardIcon,
  CalendarClockIcon,
  NotebookPenIcon,
  FolderIcon,
  PackageIcon,
  UsersIcon,
  Contact2Icon,
  SparklesIcon,
  BrainCircuitIcon,
  ScrollTextIcon,
  ListChecksIcon,
  MessagesSquareIcon,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/constants/roles";

export interface WorkspaceTab {
  /** null = the index route (Overview), e.g. /projects/[id]. */
  segment: string | null;
  label: string;
  icon: LucideIcon;
  /** Copy for this tab's placeholder page.tsx, until a future phase replaces it. */
  placeholderDescription?: string;
  /**
   * Roles allowed to see this tab. Omitted = everyone (OWNER/MEMBER/CLIENT).
   * This is a frontend-only visibility choice, not a security boundary —
   * several of the underlying routes (memory/timeline/comment/audit) have
   * no `authorize()` role check server-side, only `authenticate`. It hides
   * internal-team tabs (roster management, client management, internal AI
   * tooling, audit trail) from an external client viewer, matching what a
   * client portal should reasonably show — see ProjectTabs for where this
   * filter is applied.
   */
  roles?: UserRole[];
}

/**
 * Single source of truth for the project workspace's tabs — drives both
 * the tab nav (ProjectTabs) and each placeholder route's copy/icon, so the
 * two never drift apart. Adding a new tab later means adding one entry
 * here plus one route folder; nothing about the shell changes.
 */
export const PROJECT_WORKSPACE_TABS: WorkspaceTab[] = [
  { segment: null, label: "Overview", icon: LayoutDashboardIcon },
  {
    segment: "deliverables",
    label: "Deliverables",
    icon: PackageIcon,
    placeholderDescription:
      "Deliverables and their version history will appear here.",
  },
  {
    segment: "requirements",
    label: "Requirements",
    icon: ListChecksIcon,
    placeholderDescription:
      "Structured requirements, baseline scope and scope-creep flags will appear here.",
    roles: ["OWNER", "MEMBER"],
  },
  {
    segment: "meeting-notes",
    label: "Meeting Notes",
    icon: MessagesSquareIcon,
    placeholderDescription: "AI-summarized meeting notes will appear here.",
    roles: ["OWNER", "MEMBER"],
  },
  {
    segment: "decisions",
    label: "Decision Log",
    icon: ScrollTextIcon,
    placeholderDescription:
      "The permanent record of key project decisions will appear here.",
  },
  {
    segment: "timeline",
    label: "Timeline",
    icon: CalendarClockIcon,
    placeholderDescription:
      "Project timeline and milestones will appear here in a future phase.",
  },
  {
    segment: "memories",
    label: "Memories",
    icon: NotebookPenIcon,
    placeholderDescription:
      "Decisions, notes and project memory will appear here in a future phase.",
  },
  {
    segment: "files",
    label: "Files",
    icon: FolderIcon,
    placeholderDescription:
      "Uploaded files and documents will appear here in a future phase.",
  },
  {
    segment: "team",
    label: "Team",
    icon: UsersIcon,
    placeholderDescription:
      "Team members and roles will appear here in a future phase.",
    roles: ["OWNER", "MEMBER"],
  },
  {
    segment: "clients",
    label: "Clients",
    icon: Contact2Icon,
    placeholderDescription:
      "Clients invited to this project will appear here in a future phase.",
    roles: ["OWNER", "MEMBER"],
  },
  {
    segment: "ai-workspace",
    label: "AI Workspace",
    icon: BrainCircuitIcon,
    placeholderDescription: "Chat and AI project summaries will appear here.",
    roles: ["OWNER", "MEMBER"],
  },
  {
    segment: "ai-search",
    label: "AI Search",
    icon: SparklesIcon,
    placeholderDescription:
      "Ask questions across this project's memory in a future phase.",
  },
  {
    segment: "audit-logs",
    label: "Audit Logs",
    icon: ScrollTextIcon,
    placeholderDescription:
      "A record of activity across this project will appear here in a future phase.",
    roles: ["OWNER", "MEMBER"],
  },
];

export function getWorkspaceTabHref(
  projectId: string,
  segment: string | null,
): string {
  return segment
    ? `/projects/${projectId}/${segment}`
    : `/projects/${projectId}`;
}
