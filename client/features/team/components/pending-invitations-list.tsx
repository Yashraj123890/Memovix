import { InvitationRow } from "@/features/team/components/invitation-row";
import type { MemberInvitation } from "@/types/team";

interface PendingInvitationsListProps {
  invitations: MemberInvitation[];
}

/** Same full-bleed-row-inside-a-padded-card pattern as TeamList/FileList. */
export function PendingInvitationsList({ invitations }: PendingInvitationsListProps) {
  return (
    <ul className="divide-border -mx-6 flex flex-col divide-y">
      {invitations.map((invitation) => (
        <InvitationRow key={invitation.id} invitation={invitation} />
      ))}
    </ul>
  );
}
