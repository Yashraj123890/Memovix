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
import { useDeleteFileMutation } from "@/features/files/hooks/use-delete-file-mutation";
import type { ProjectFile } from "@/types/file";

interface DeleteFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  file: ProjectFile;
  onDeleted?: () => void;
}

/** Same confirm-dialog shape as RemoveMemberDialog (F10) — destructive action, one confirm step. */
export function DeleteFileDialog({ open, onOpenChange, projectId, file, onDeleted }: DeleteFileDialogProps) {
  const deleteFile = useDeleteFileMutation(projectId);

  function handleConfirm() {
    deleteFile.mutate(file.id, {
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
          <DialogTitle>Delete file</DialogTitle>
          <DialogDescription>
            {file.originalName} will be permanently deleted. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={deleteFile.isPending}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
