import {
  NotebookPenIcon,
  FolderIcon,
  MessageSquareIcon,
  UserPlusIcon,
  type LucideIcon,
} from "lucide-react";
import type { BadgeProps } from "@/components/ui/badge";

export interface ActionConfigEntry {
  label: string;
  icon: LucideIcon;
  variant: NonNullable<BadgeProps["variant"]>;
}

/**
 * `action` is a free string on the backend (no Prisma enum — see
 * types/audit-log.ts), so this is keyed by every literal value found by
 * tracing every auditService.createLog call site in server/src/services
 * during F15's backend inspection, plus a DEFAULT fallback for anything
 * not in that inventory (a future feature calling createLog with a new
 * action string should never break this table, just render generically).
 */
export const ACTION_CONFIG: Record<string, ActionConfigEntry> = {
  MEMORY_CREATED: { label: "Memory created", icon: NotebookPenIcon, variant: "success" },
  MEMORY_UPDATED: { label: "Memory updated", icon: NotebookPenIcon, variant: "info" },
  MEMORY_DELETED: { label: "Memory deleted", icon: NotebookPenIcon, variant: "destructive" },
  FILE_UPLOADED: { label: "File uploaded", icon: FolderIcon, variant: "success" },
  FILE_DELETED: { label: "File deleted", icon: FolderIcon, variant: "destructive" },
  COMMENT_CREATED: { label: "Comment added", icon: MessageSquareIcon, variant: "secondary" },
  CLIENT_INVITED: { label: "Client invited", icon: UserPlusIcon, variant: "secondary" },
  MEMBER_INVITED: { label: "Member invited", icon: UserPlusIcon, variant: "secondary" },
};

export const DEFAULT_ACTION_CONFIG: ActionConfigEntry = {
  label: "Unknown action",
  icon: NotebookPenIcon,
  variant: "outline",
};

export function getActionConfig(action: string): ActionConfigEntry {
  return ACTION_CONFIG[action] ?? { ...DEFAULT_ACTION_CONFIG, label: action };
}

/**
 * `entityType` is likewise a free string (COMMENT/MEMORY/FILE/
 * CLIENT_INVITATION/MEMBER_INVITATION found in the same trace). Falls
 * back to the raw value itself rather than a generic "Unknown" label,
 * since an unrecognized entity type string is still meaningful to show
 * as-is.
 */
const ENTITY_TYPE_LABEL: Record<string, string> = {
  MEMORY: "Memory",
  FILE: "File",
  COMMENT: "Comment",
  CLIENT_INVITATION: "Client Invitation",
  MEMBER_INVITATION: "Member Invitation",
};

export function getEntityTypeLabel(entityType: string): string {
  return ENTITY_TYPE_LABEL[entityType] ?? entityType;
}
