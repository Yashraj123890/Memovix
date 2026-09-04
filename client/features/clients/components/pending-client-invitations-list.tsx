import { ClientInvitationRow } from "@/features/clients/components/client-invitation-row";
import type { ClientInvitation } from "@/types/client";

interface PendingClientInvitationsListProps {
  invitations: ClientInvitation[];
  projectId: string;
}

/** Same full-bleed-row-inside-a-padded-card pattern as PendingInvitationsList (features/team). */
export function PendingClientInvitationsList({ invitations, projectId }: PendingClientInvitationsListProps) {
  return (
    <ul className="divide-border -mx-6 flex flex-col divide-y">
      {invitations.map((invitation) => (
        <ClientInvitationRow key={invitation.id} invitation={invitation} projectId={projectId} />
      ))}
    </ul>
  );
}
