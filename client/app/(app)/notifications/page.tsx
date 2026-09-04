"use client";

import { NotificationsContainer } from "@/features/notifications/components/notifications-container";
import { PageContainer } from "@/components/shared/page-container";
import { usePageHeader } from "@/features/layout/hooks/use-page-header";

/**
 * "/notifications" — F14. Top-level authenticated page (notifications
 * span every project), same shape as the Dashboard page: PageContainer +
 * usePageHeader, then hands off entirely to its feature container.
 */
export default function NotificationsPage() {
  usePageHeader({ title: "Notifications" });

  return (
    <PageContainer>
      <NotificationsContainer />
    </PageContainer>
  );
}
