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
import { useDeleteDeliverableMutation } from "@/features/deliverables/hooks/use-delete-deliverable-mutation";
import type { Deliverable } from "@/types/deliverable";

interface DeleteDeliverableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  deliverable: Pick<Deliverable, "id" | "title">;
  onDeleted?: () => void;
}

/** Same confirm-dialog shape as DeleteFileDialog — one destructive confirm step. */
export function DeleteDeliverableDialog({
  open,
  onOpenChange,
  projectId,
  deliverable,
  onDeleted,
}: DeleteDeliverableDialogProps) {
  const deleteDeliverable = useDeleteDeliverableMutation(projectId);

  function handleConfirm() {
    deleteDeliverable.mutate(deliverable.id, {
      onSuccess: () => {
        onOpenChange(false);
        onDeleted?.();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete deliverable</DialogTitle>
          <DialogDescription>
            {deliverable.title} and all of its versions will be permanently deleted. This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={deleteDeliverable.isPending}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
