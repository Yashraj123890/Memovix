"use client";

import { PageContainer } from "@/components/shared/page-container";
import { usePageHeader } from "@/features/layout/hooks/use-page-header";
import { OwnerSettingsView } from "@/features/settings/components/owner-settings-view";

/**
 * "/settings" — account, security and workspace settings for the signed-in
 * user (built for the OWNER; the same universal account data renders for any
 * role). Member/Client-specific settings are a separate, later task.
 */
export default function SettingsPage() {
  usePageHeader({ title: "Settings" });

  return (
    <PageContainer>
      <OwnerSettingsView />
    </PageContainer>
  );
}
