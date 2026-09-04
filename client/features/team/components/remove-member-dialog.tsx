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
import { useRemoveMemberMutation } from "@/features/team/hooks/use-remove-member-mutation";
import type { ProjectMember } from "@/types/team";

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  member: ProjectMember;
}

export function RemoveMemberDialog({ open, onOpenChange, projectId, member }: RemoveMemberDialogProps) {
  const removeMember = useRemoveMemberMutation(projectId);

  function handleConfirm() {
    removeMember.mutate(member.userId, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove team member</DialogTitle>
          <DialogDescription>
            {member.user.name} will lose access to this project. They can be added again later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={removeMember.isPending}
            onClick={handleConfirm}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
