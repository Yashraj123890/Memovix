"use client";

import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { PageContainer } from "@/components/shared/page-container";
import { usePageHeader } from "@/features/layout/hooks/use-page-header";

/**
 * "/dashboard" - the authenticated home. (Moved from "/" so the public
 * marketing landing can own "/"; the redirect target lives in
 * constants/routes.ts DEFAULT_AUTHENTICATED_ROUTE, unchanged behavior otherwise.)
 */
export default function DashboardPage() {
  usePageHeader({ title: "Dashboard" });

  return (
    <PageContainer>
      <DashboardOverview />
    </PageContainer>
  );
}
