"use client";

import { WorkspaceMembersContainer } from "@/features/team/components/workspace-members-container";
import { PageContainer } from "@/components/shared/page-container";
import { usePageHeader } from "@/features/layout/hooks/use-page-header";

/**
 * "/members" — top-level, workspace-wide member directory + invitations.
 * Same shape as the Dashboard/Notifications pages: PageContainer +
 * usePageHeader, then hands off entirely to its feature container. Moved
 * out of the project Team page because Member Invitation
 * (server/src/routes/member.routes.ts) is tenant-scoped, not project-scoped
 * — see workspace-members-container.tsx.
 */
export default function WorkspaceMembersPage() {
  usePageHeader({ title: "Members" });

  return (
    <PageContainer>
      <WorkspaceMembersContainer />
    </PageContainer>
  );
}
