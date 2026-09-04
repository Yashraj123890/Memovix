import { NOTIFICATIONS_ROUTE } from "@/constants/routes";
import type { Notification } from "@/types/notification";

/**
 * Resolves the best available click-through target. The Notification
 * model has no entityId/entityType (see types/notification.ts), so this
 * can never link to a *specific* memory/file/comment — only to the
 * project it belongs to (when `projectId` is set) at the finest
 * granularity the data actually supports:
 *
 * - MEMORY_CREATED -> that project's Memories list (not the specific memory)
 * - FILE_UPLOADED   -> that project's Files list (not the specific file)
 * - COMMENT_ADDED    -> that project's overview (can't tell memory vs file —
 *                       server/src/services/comment.service.ts's
 *                       COMMENT_ADDED notification uses a static message
 *                       and doesn't carry memoryId/fileId)
 * - CLIENT_INVITED   -> that project's overview
 * - MEMBER_INVITED   -> Notifications page (this notification type never
 *                       carries a projectId at all — workspace-level invite)
 *
 * Falls back to the Notifications page for any notification without a
 * resolvable target, matching the "unknown destinations" rule.
 */
export function getNotificationHref(notification: Notification): string {
  const { type, projectId } = notification;

  if (!projectId) {
    return NOTIFICATIONS_ROUTE;
  }

  switch (type) {
    case "MEMORY_CREATED":
      return `/projects/${projectId}/memories`;
    case "FILE_UPLOADED":
      return `/projects/${projectId}/files`;
    case "COMMENT_ADDED":
    case "CLIENT_INVITED":
      return `/projects/${projectId}`;
    case "DELIVERABLE_SUBMITTED":
    case "DELIVERABLE_APPROVED":
    case "DELIVERABLE_REVISION_REQUESTED":
      return `/projects/${projectId}/deliverables`;
    case "MEMBER_INVITED":
    default:
      return NOTIFICATIONS_ROUTE;
  }
}
