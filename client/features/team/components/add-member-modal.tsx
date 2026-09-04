"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { WorkspaceMemberSelect } from "@/features/team/components/workspace-member-select";
import { useWorkspaceMembersQuery } from "@/features/team/hooks/use-workspace-members-query";
import { useAddMemberMutation } from "@/features/team/hooks/use-add-member-mutation";
import { getAddableMembers } from "@/features/team/utils/get-addable-members";
import type { ProjectMember, WorkspaceMember } from "@/types/team";

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectMembers: ProjectMember[];
}

export function AddMemberModal({ open, onOpenChange, projectId, projectMembers }: AddMemberModalProps) {
  const [selected, setSelected] = useState<WorkspaceMember | null>(null);

  const { data: workspaceMembers, isLoading } = useWorkspaceMembersQuery(open);
  const addMember = useAddMemberMutation(projectId);

  const addableMembers = workspaceMembers ? getAddableMembers(workspaceMembers, projectMembers) : [];

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSelected(null);
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    if (!selected) {
      return;
    }
    addMember.mutate(selected.id, {
      onSuccess: () => handleOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>Add someone from your workspace to this project.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label>Workspace member</Label>
          <WorkspaceMemberSelect
            members={addableMembers}
            isLoading={isLoading}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selected}
            loading={addMember.isPending}
            onClick={handleSubmit}
          >
            Add member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
