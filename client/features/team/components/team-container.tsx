"use client";

import { useState } from "react";
import { UsersIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TeamToolbar } from "@/features/team/components/team-toolbar";
import { TeamList } from "@/features/team/components/team-list";
import { TeamSkeleton } from "@/features/team/components/team-skeleton";
import { AddMemberModal } from "@/features/team/components/add-member-modal";
import { useProjectMembersQuery } from "@/features/team/hooks/use-project-members-query";
import { filterMembers } from "@/features/team/utils/filter-members";
import { getErrorMessage } from "@/utils/error";
import type { TeamRole } from "@/types/team";

interface TeamContainerProps {
  projectId: string;
}

/**
 * The only place in this feature that calls useProjectMembersQuery and
 * owns search/role-filter/modal state — same shape as the other workspace
 * tabs (ProjectsView, TimelineContainer, MemoriesContainer, FilesContainer).
 *
 * Add/Remove are available to any authenticated viewer — the backend's
 * project-member routes (server/src/routes/projectMember.routes.ts) only
 * require authentication, no role check, so the frontend doesn't invent a
 * restriction the API doesn't enforce.
 *
 * Deliberately roster-only: view this project's members, add an existing
 * workspace member, remove a member. Inviting a brand-new person by email
 * moved to the top-level "/members" page (see
 * features/team/components/workspace-members-container.tsx) — Member
 * Invitation is a *workspace*-scoped concept on the backend
 * (MemberInvitation has no projectId), not a project one, so it doesn't
 * belong on this page. See
 * [[member-invitation-is-workspace-scoped-not-project-scoped]] in project
 * memory for the full reasoning.
 */
export function TeamContainer({ projectId }: TeamContainerProps) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<TeamRole | "ALL">("ALL");
  const [addOpen, setAddOpen] = useState(false);

  const { data: members, isLoading, isError, error, refetch } = useProjectMembersQuery(projectId);

  const filteredMembers = members ? filterMembers(members, { search, role }) : [];
  const hasMembers = (members?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-4">
      <TeamToolbar
        search={search}
        onSearchChange={setSearch}
        role={role}
        onRoleChange={setRole}
        onAddMember={() => setAddOpen(true)}
      />

      {isLoading ? (
        <TeamSkeleton />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="size-5" />}
          title={hasMembers ? "No matching team members" : "No team members yet"}
          description={
            hasMembers
              ? "Try a different search term or role filter."
              : "Add teammates from your workspace to give them access to this project."
          }
        />
      ) : (
        <Card>
          <CardContent>
            <TeamList members={filteredMembers} projectId={projectId} />
          </CardContent>
        </Card>
      )}

      <AddMemberModal
        open={addOpen}
        onOpenChange={setAddOpen}
        projectId={projectId}
        projectMembers={members ?? []}
      />
    </div>
  );
}
