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
import { useDeleteRequirementMutation } from "@/features/requirements/hooks/use-requirement-mutations";
import type { Requirement } from "@/types/requirement";

interface DeleteRequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  requirement: Requirement | null;
}

/** Confirm before deleting a persisted requirement. */
export function DeleteRequirementDialog({
  open,
  onOpenChange,
  projectId,
  requirement,
}: DeleteRequirementDialogProps) {
  const deleteRequirement = useDeleteRequirementMutation(projectId);

  function handleDelete() {
    if (!requirement) return;
    deleteRequirement.mutate(requirement.id, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete requirement</DialogTitle>
          <DialogDescription>
            {requirement
              ? `"${requirement.title}" will be permanently removed. This cannot be undone.`
              : "This requirement will be permanently removed."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteRequirement.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            loading={deleteRequirement.isPending}
            disabled={deleteRequirement.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
