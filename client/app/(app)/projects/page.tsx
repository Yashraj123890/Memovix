"use client";

import { PageContainer } from "@/components/shared/page-container";
import { usePageHeader } from "@/features/layout/hooks/use-page-header";
import { ProjectsView } from "@/features/projects/components/projects-view";

/**
 * "/projects" — first real backend-integrated feature page (F5). Browsing,
 * search and status filtering only; Create/Edit/Delete/Archive and the
 * project detail route are out of scope for this phase.
 */
export default function ProjectsPage() {
  usePageHeader({ title: "Projects" });

  return (
    <PageContainer>
      <ProjectsView />
    </PageContainer>
  );
}
