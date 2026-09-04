"use client";

import { useState } from "react";
import { WelcomeCard } from "@/features/dashboard/components/welcome-card";
import { OnboardingChecklist } from "@/features/dashboard/components/onboarding-checklist";
import { ProjectsOverview } from "@/features/dashboard/components/projects-overview";
import { RecentMemories } from "@/features/dashboard/components/recent-memories";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { NotificationsSummary } from "@/features/dashboard/components/notifications-summary";
import { CreateProjectDialog } from "@/features/projects/components/create-project-dialog";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects-query";
import { useNotificationsQuery } from "@/features/notifications/hooks/use-notifications-query";
import { useRecentMemories } from "@/features/dashboard/hooks/use-recent-memories";
import { useRecentActivity } from "@/features/dashboard/hooks/use-recent-activity";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ROLES } from "@/constants/roles";

/**
 * Dashboard composition — the single place that sources data and hands it
 * to each widget as props. Every widget below is backed by a real API call
 * (GET /projects, GET /notifications, or the per-project memory/timeline
 * endpoints aggregated client-side — see the two hooks imported above):
 * there is no mock data left in this feature. The Storage widget that used
 * to sit next to Projects was removed outright rather than shown with
 * placeholder numbers — the backend has no storage-usage endpoint yet.
 *
 * "Ask AI about your projects" and "Quick Actions" were removed (not just
 * hidden) — both only duplicated navigation that already lives inside a
 * project, so keeping them meant two paths to the same place. In their
 * place, a zero-projects workspace now shows OnboardingChecklist next to
 * the existing "No projects yet" empty state in ProjectsOverview.
 *
 * CLIENT-role gating: GET /projects is now role-aware server-side (a
 * CLIENT gets only projects they're assigned to via ProjectClient, see
 * server/src/services/project.service.ts), so every widget below already
 * shows the right data for a client without any change — RecentMemories/
 * RecentActivity just fan out per-project over whatever `projectsQuery.data`
 * contains. The only two things that don't make sense for a CLIENT are
 * *creating* a project (POST /projects is OWNER/MEMBER-only) and the
 * first-project onboarding nudge, so those two are the only parts gated
 * here by role.
 */
export function DashboardOverview() {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const isClient = useAuthStore((state) => state.user?.role === USER_ROLES.CLIENT);

  const projectsQuery = useProjectsQuery();
  const notificationsQuery = useNotificationsQuery();
  const { memories, isLoading: memoriesLoading, isError: memoriesError } = useRecentMemories(
    projectsQuery.data,
  );
  const { activity, isLoading: activityLoading, isError: activityError } = useRecentActivity(
    projectsQuery.data,
  );

  const hasNoProjects = projectsQuery.isSuccess && projectsQuery.data.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <WelcomeCard />

      {hasNoProjects && !isClient && (
        <OnboardingChecklist onNewProject={() => setCreateProjectOpen(true)} />
      )}

      <ProjectsOverview
        projects={projectsQuery.data ?? []}
        isLoading={projectsQuery.isLoading}
        isError={projectsQuery.isError}
        onNewProject={() => setCreateProjectOpen(true)}
        canCreate={!isClient}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RecentMemories memories={memories} isLoading={memoriesLoading} isError={memoriesError} />
        <RecentActivity activity={activity} isLoading={activityLoading} isError={activityError} />
        <NotificationsSummary
          notifications={notificationsQuery.data ?? []}
          isLoading={notificationsQuery.isLoading}
          isError={notificationsQuery.isError}
        />
      </div>

      <CreateProjectDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
    </div>
  );
}
