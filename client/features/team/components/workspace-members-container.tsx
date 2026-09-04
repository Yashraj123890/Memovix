"use client";

import { useState } from "react";
import { MailIcon, UsersIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TeamSkeleton } from "@/features/team/components/team-skeleton";
import { WorkspaceMembersToolbar } from "@/features/team/components/workspace-members-toolbar";
import { WorkspaceMembersList } from "@/features/team/components/workspace-members-list";
import { InviteMemberModal } from "@/features/team/components/invite-member-modal";
import { PendingInvitationsList } from "@/features/team/components/pending-invitations-list";
import { InvitationsSkeleton } from "@/features/team/components/invitations-skeleton";
import { useWorkspaceMembersQuery } from "@/features/team/hooks/use-workspace-members-query";
import { useInvitationsQuery } from "@/features/team/hooks/use-invitations-query";
import { filterWorkspaceMembers } from "@/features/team/utils/filter-workspace-members";
import { getErrorMessage } from "@/utils/error";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ROLES } from "@/constants/roles";
import type { TeamRole } from "@/types/team";

/**
 * "/members" — the workspace-wide member directory. Member invitations
 * belong here, not on a project's Team page: MemberInvitation
 * (server/prisma/schema.prisma) has no projectId, accepting one makes
 * someone a *workspace* member, not a member of any particular project
 * (see [[member-invitation-is-workspace-scoped-not-project-scoped]] in
 * project memory). Adding someone to a specific project's roster is still
 * done from that project's Team tab, picking from the members listed here.
 *
 * Invite/Pending Invitations are OWNER-only (authorize("OWNER") on
 * POST /members/invite and GET /members server-side) — everyone
 * authenticated can view this page, but only an Owner sees those two
 * pieces. Viewing workspace members has no removal action: there's no
 * backend endpoint to remove/deactivate a User from the workspace.
 */
export function WorkspaceMembersContainer() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<TeamRole | "ALL">("ALL");
  const [inviteOpen, setInviteOpen] = useState(false);

  const isOwner = useAuthStore((state) => state.user?.role === USER_ROLES.OWNER);

  const { data: members, isLoading, isError, error, refetch } = useWorkspaceMembersQuery(true);
  const {
    data: invitations,
    isLoading: invitationsLoading,
    isError: invitationsError,
    error: invitationsErrorObj,
    refetch: refetchInvitations,
  } = useInvitationsQuery(isOwner);

  const filteredMembers = members ? filterWorkspaceMembers(members, { search, role }) : [];
  const hasMembers = (members?.length ?? 0) > 0;
  const hasInvitations = (invitations?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-4">
      <WorkspaceMembersToolbar
        search={search}
        onSearchChange={setSearch}
        role={role}
        onRoleChange={setRole}
        onInviteMember={isOwner ? () => setInviteOpen(true) : undefined}
      />

      {isLoading ? (
        <TeamSkeleton />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="size-5" />}
          title={hasMembers ? "No matching members" : "No workspace members yet"}
          description={
            hasMembers
              ? "Try a different search term or role filter."
              : "Invite someone by email to add them to your workspace."
          }
        />
      ) : (
        <Card>
          <CardContent>
            <WorkspaceMembersList members={filteredMembers} />
          </CardContent>
        </Card>
      )}

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>Invitations sent by email that haven&apos;t been accepted yet.</CardDescription>
          </CardHeader>
          <CardContent>
            {invitationsLoading ? (
              <InvitationsSkeleton />
            ) : invitationsError ? (
              <ErrorState
                description={getErrorMessage(invitationsErrorObj)}
                onRetry={() => refetchInvitations()}
              />
            ) : !hasInvitations ? (
              <EmptyState
                icon={<MailIcon className="size-5" />}
                title="No invitations sent yet"
                description="Invite someone by email to add them to your workspace."
              />
            ) : (
              <PendingInvitationsList invitations={invitations ?? []} />
            )}
          </CardContent>
        </Card>
      )}

      {isOwner && <InviteMemberModal open={inviteOpen} onOpenChange={setInviteOpen} />}
    </div>
  );
}
