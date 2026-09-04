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
import { useDeleteMemoryMutation } from "@/features/memories/hooks/use-delete-memory-mutation";
import type { Memory } from "@/types/memory";

interface DeleteMemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  memory: Memory;
  onDeleted?: () => void;
}

/** Same confirm-dialog shape as DeleteFileDialog (features/files). */
export function DeleteMemoryDialog({ open, onOpenChange, projectId, memory, onDeleted }: DeleteMemoryDialogProps) {
  const deleteMemory = useDeleteMemoryMutation(projectId);

  function handleConfirm() {
    deleteMemory.mutate(memory.id, {
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
          <DialogTitle>Delete memory</DialogTitle>
          <DialogDescription>
            &quot;{memory.title}&quot; will be permanently deleted. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={deleteMemory.isPending}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
