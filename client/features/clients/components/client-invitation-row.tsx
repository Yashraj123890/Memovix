"use client";

import { useState } from "react";
import { XIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CancelClientInvitationDialog } from "@/features/clients/components/cancel-client-invitation-dialog";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { ClientInvitation } from "@/types/client";

interface ClientInvitationRowProps {
  invitation: ClientInvitation;
  projectId: string;
}

/**
 * No name/avatar image for an invitee who hasn't registered yet (only
 * email is known), so the avatar falls back to the email's first letter —
 * same treatment as InvitationRow (features/team). Every row here is
 * PENDING (the list endpoint filters to that status server-side, see the
 * doc comment on ClientInvitation in types/client.ts), so the status badge
 * is fixed rather than looked up from a status->label map.
 */
export function ClientInvitationRow({ invitation, projectId }: ClientInvitationRowProps) {
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

      <Badge variant="outline" className="shrink-0">
        Pending
      </Badge>

      <div className="flex w-8 shrink-0 justify-end">
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
      </div>

      <CancelClientInvitationDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        projectId={projectId}
        invitation={invitation}
      />
    </li>
  );
}
