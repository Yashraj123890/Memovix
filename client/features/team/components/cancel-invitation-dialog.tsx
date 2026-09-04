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
import { useCancelInvitationMutation } from "@/features/team/hooks/use-cancel-invitation-mutation";
import type { MemberInvitation } from "@/types/team";

interface CancelInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: MemberInvitation;
}

export function CancelInvitationDialog({ open, onOpenChange, invitation }: CancelInvitationDialogProps) {
  const cancelInvitation = useCancelInvitationMutation();

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
