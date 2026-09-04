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
import { useRemoveClientMutation } from "@/features/clients/hooks/use-remove-client-mutation";
import type { ProjectClient } from "@/types/client";

interface RemoveClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  client: ProjectClient;
}

/** Same confirm-dialog shape as RemoveMemberDialog (features/team). */
export function RemoveClientDialog({ open, onOpenChange, projectId, client }: RemoveClientDialogProps) {
  const removeClient = useRemoveClientMutation(projectId);

  function handleConfirm() {
    removeClient.mutate(client.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove client</DialogTitle>
          <DialogDescription>
            {client.name} will lose access to this project. They can be invited again later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={removeClient.isPending}
            onClick={handleConfirm}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
