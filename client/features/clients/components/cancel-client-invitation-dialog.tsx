"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCancelClientInvitationMutation } from "@/features/clients/hooks/use-cancel-client-invitation-mutation";
import type { ClientInvitation } from "@/types/client";

interface CancelClientInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  invitation: ClientInvitation;
}

/** Same confirm-dialog shape as CancelInvitationDialog (features/team). */
export function CancelClientInvitationDialog({
  open,
  onOpenChange,
  projectId,
  invitation,
}: CancelClientInvitationDialogProps) {
  const cancelInvitation = useCancelClientInvitationMutation(projectId);

  function handleConfirm() {
    cancelInvitation.mutate(invitation.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel invitation</DialogTitle>
          <DialogDescription>
            The invitation sent to {invitation.email} will no longer be valid.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Keep invitation
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={cancelInvitation.isPending}
            onClick={handleConfirm}
          >
            Cancel invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
