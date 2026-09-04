/**
 * Mirrors the Notification model in server/prisma/schema.prisma exactly —
 * every field GET /notifications and GET /notifications/unread return.
 *
 * Note: there is no entityId/entityType field on this model, so a
 * notification cannot be traced back to the specific memory/file/comment
 * that triggered it — only `projectId` (nullable) is available. See
 * features/notifications/utils/get-notification-href.ts for how
 * click-through navigation works within that constraint.
 */
export type NotificationType =
  | "MEMORY_CREATED"
  | "FILE_UPLOADED"
  | "COMMENT_ADDED"
  | "MEMBER_INVITED"
  | "CLIENT_INVITED"
  | "DELIVERABLE_SUBMITTED"
  | "DELIVERABLE_APPROVED"
  | "DELIVERABLE_REVISION_REQUESTED"
  // System/security messages (e.g. "Password Changed"). Must mirror the backend
  // NotificationType enum — omitting it here let a real SYSTEM notification
  // render an undefined icon and crash the dashboard.
  | "SYSTEM";

export interface Notification {
  id: string;
  userId: string;
  projectId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
