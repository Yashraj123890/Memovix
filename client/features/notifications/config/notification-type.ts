import {
  NotebookPenIcon,
  FolderIcon,
  MessageSquareIcon,
  UserPlusIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  SendIcon,
  BellIcon,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/types/notification";

export interface NotificationTypeConfigEntry {
  icon: LucideIcon;
  label: string;
}

/**
 * Centralized NotificationType -> icon/label lookup — same pattern as
 * F7's ACTIVITY_CONFIG, F8's CATEGORY_LABEL, F9's FILE_TYPE_CONFIG, F10's
 * ROLE_LABEL. No components ever branch on the raw type string.
 */
export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfigEntry> = {
  MEMORY_CREATED: { icon: NotebookPenIcon, label: "Memory" },
  FILE_UPLOADED: { icon: FolderIcon, label: "File" },
  COMMENT_ADDED: { icon: MessageSquareIcon, label: "Comment" },
  MEMBER_INVITED: { icon: UserPlusIcon, label: "Member" },
  CLIENT_INVITED: { icon: UserPlusIcon, label: "Client" },
  DELIVERABLE_SUBMITTED: { icon: SendIcon, label: "Deliverable" },
  DELIVERABLE_APPROVED: { icon: CheckCircle2Icon, label: "Deliverable" },
  DELIVERABLE_REVISION_REQUESTED: { icon: RefreshCwIcon, label: "Revision" },
  SYSTEM: { icon: BellIcon, label: "System" },
};
