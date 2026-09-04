"use client";

import { useState } from "react";
import { MailIcon, UsersIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ClientsToolbar } from "@/features/clients/components/clients-toolbar";
import { ActiveClientsList } from "@/features/clients/components/active-clients-list";
import { ClientsSkeleton } from "@/features/clients/components/clients-skeleton";
import { PendingClientInvitationsList } from "@/features/clients/components/pending-client-invitations-list";
import { ClientInvitationsSkeleton } from "@/features/clients/components/client-invitations-skeleton";
import { InviteClientModal } from "@/features/clients/components/invite-client-modal";
import { useProjectClientsQuery } from "@/features/clients/hooks/use-project-clients-query";
import { useClientInvitationsQuery } from "@/features/clients/hooks/use-client-invitations-query";
import { filterClients } from "@/features/clients/utils/filter-clients";
import { getErrorMessage } from "@/utils/error";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ROLES } from "@/constants/roles";

interface ClientsContainerProps {
  projectId: string;
}

/**
 * "/projects/[id]/clients" — Clients are project-scoped (ClientInvitation
 * and ProjectClient both carry a projectId, unlike MemberInvitation),
 * so unlike Member Invitation this stays a project workspace tab rather
 * than moving to a workspace-level page. See
 * server/src/routes/clientInvitation.routes.ts and projectClient.routes.ts.
 *
 * Invite is OWNER-only (authorize(UserRole.OWNER) on
 * POST /projects/:projectId/invite-client); viewing both lists and
 * cancel/remove allow OWNER or MEMBER (authorize(UserRole.OWNER,
 * UserRole.MEMBER)) — so only the Invite button is gated here, matching
 * the backend split exactly rather than inventing a stricter frontend
 * restriction.
 */
export function ClientsContainer({ projectId }: ClientsContainerProps) {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const isOwner = useAuthStore((state) => state.user?.role === USER_ROLES.OWNER);

  const {
    data: clients,
    isLoading: clientsLoading,
    isError: clientsError,
    error: clientsErrorObj,
    refetch: refetchClients,
  } = useProjectClientsQuery(projectId);

  const {
    data: invitations,
    isLoading: invitationsLoading,
    isError: invitationsError,
    error: invitationsErrorObj,
    refetch: refetchInvitations,
  } = useClientInvitationsQuery(projectId);

  const filteredClients = clients ? filterClients(clients, { search }) : [];
  const hasClients = (clients?.length ?? 0) > 0;
  const hasInvitations = (invitations?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-4">
      <ClientsToolbar
        search={search}
        onSearchChange={setSearch}
        onInviteClient={isOwner ? () => setInviteOpen(true) : undefined}
      />

      {clientsLoading ? (
        <ClientsSkeleton />
      ) : clientsError ? (
        <ErrorState description={getErrorMessage(clientsErrorObj)} onRetry={() => refetchClients()} />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="size-5" />}
          title={hasClients ? "No matching clients" : "No clients yet"}
          description={
            hasClients
              ? "Try a different search term."
              : "Invite a client by email to give them access to this project."
          }
        />
      ) : (
        <Card>
          <CardContent>
            <ActiveClientsList clients={filteredClients} projectId={projectId} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
          <CardDescription>Client invitations sent by email that haven&apos;t been accepted yet.</CardDescription>
        </CardHeader>
        <CardContent>
          {invitationsLoading ? (
            <ClientInvitationsSkeleton />
          ) : invitationsError ? (
            <ErrorState
              description={getErrorMessage(invitationsErrorObj)}
              onRetry={() => refetchInvitations()}
            />
          ) : !hasInvitations ? (
            <EmptyState
              icon={<MailIcon className="size-5" />}
              title="No invitations sent yet"
              description="Invite a client by email to give them access to this project."
            />
          ) : (
            <PendingClientInvitationsList invitations={invitations ?? []} projectId={projectId} />
          )}
        </CardContent>
      </Card>

      {isOwner && (
        <InviteClientModal open={inviteOpen} onOpenChange={setInviteOpen} projectId={projectId} />
      )}
    </div>
  );
}
