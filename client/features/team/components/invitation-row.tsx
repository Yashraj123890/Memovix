"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CancelInvitationDialog } from "@/features/team/components/cancel-invitation-dialog";
import { INVITATION_STATUS_LABEL, INVITATION_STATUS_BADGE_VARIANT } from "@/features/team/config/invitation-status";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { MemberInvitation } from "@/types/team";

interface InvitationRowProps {
  invitation: MemberInvitation;
}

/**
 * No name/avatar image is available for an invitee who hasn't registered
 * yet (MemberInvitation only stores email — see types/team.ts), so the
 * avatar falls back to the email's first letter instead of initials.
 * Cancel is only offered for PENDING invitations — an ACCEPTED or EXPIRED
 * one is a historical record, not something to "cancel".
 */
export function InvitationRow({ invitation }: InvitationRowProps) {
  const [cancelOpen, setCancelOpen] = useState(false);

  return (
    <li className="flex items-center gap-3 px-6 py-3">
      <Avatar fallback={invitation.email.charAt(0).toUpperCase()} alt={invitation.email} />

      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">{invitation.email}</p>
        <p className="text-muted-foreground truncate text-xs">
          Sent {formatRelativeTime(invitation.createdAt)}
        </p>
      </div>

      <Badge variant={INVITATION_STATUS_BADGE_VARIANT[invitation.status]} className="shrink-0">
        {INVITATION_STATUS_LABEL[invitation.status]}
      </Badge>

      <div className="flex w-8 shrink-0 justify-end">
        {invitation.status === "PENDING" && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive size-8"
            onClick={() => setCancelOpen(true)}
            aria-label={`Cancel invitation for ${invitation.email}`}
          >
            <XIcon className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <CancelInvitationDialog open={cancelOpen} onOpenChange={setCancelOpen} invitation={invitation} />
    </li>
  );
}
