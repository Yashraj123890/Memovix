import {
  NotebookPenIcon,
  PencilLineIcon,
  Trash2Icon,
  UploadIcon,
  FileMinusIcon,
  MessageSquareIcon,
  ActivityIcon,
  type LucideIcon,
} from "lucide-react";

export type ActivityTone = "success" | "warning" | "destructive" | "info" | "secondary";

export interface ActivityConfigEntry {
  icon: LucideIcon;
  label: string;
  tone: ActivityTone;
}

/**
 * Centralized action -> icon/label/tone mapping (F7 architecture decision:
 * event rendering). TimelineItem never branches on `event.action` itself —
 * it only looks values up here, so supporting a new event type (Team
 * Member Added, Client Assigned, AI Summary Generated, ...) means adding
 * one entry to this object, not touching any Timeline component.
 *
 * Keys match the exact `action` strings the backend currently writes (see
 * server/src/services/memory.service.ts, project-file.service.ts,
 * comment.service.ts). `action` is a free-form string on the Timeline
 * model (server/prisma/schema.prisma), not a fixed enum, so
 * DEFAULT_ACTIVITY covers any future/unrecognized action gracefully
 * instead of the UI breaking or silently rendering nothing.
 */
export const ACTIVITY_CONFIG: Record<string, ActivityConfigEntry> = {
  MEMORY_CREATED: { icon: NotebookPenIcon, label: "created a memory", tone: "success" },
  MEMORY_UPDATED: { icon: PencilLineIcon, label: "updated a memory", tone: "info" },
  MEMORY_DELETED: { icon: Trash2Icon, label: "deleted a memory", tone: "destructive" },
  FILE_UPLOADED: { icon: UploadIcon, label: "uploaded a file", tone: "success" },
  FILE_DELETED: { icon: FileMinusIcon, label: "deleted a file", tone: "destructive" },
  COMMENT_CREATED: { icon: MessageSquareIcon, label: "added a comment", tone: "info" },
};

export const DEFAULT_ACTIVITY: ActivityConfigEntry = {
  icon: ActivityIcon,
  label: "made an update",
  tone: "secondary",
};

export function getActivityConfig(action: string): ActivityConfigEntry {
  return ACTIVITY_CONFIG[action] ?? DEFAULT_ACTIVITY;
}
