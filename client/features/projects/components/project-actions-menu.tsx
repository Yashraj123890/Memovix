"use client";

import { useState } from "react";
import {
  ArchiveIcon,
  CircleCheckIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth.store";
import { useUpdateProjectMutation } from "@/features/projects/hooks/use-update-project-mutation";
import { useDeleteProjectMutation } from "@/features/projects/hooks/use-delete-project-mutation";
import type { Project, ProjectStatus } from "@/types/project";

/**
 * Project lifecycle actions in the header ⋯ menu (kept off the project cards).
 * Each status has exactly one forward/restore transition, plus Delete:
 *   ACTIVE    → "Mark as completed"  (COMPLETED)
 *   COMPLETED → "Archive"            (ARCHIVED, confirmed)
 *   ARCHIVED  → "Restore"            (ACTIVE)
 * All transitions reuse PUT /projects/:id with just `{ status }`; Delete reuses
 * DELETE /projects/:id. RBAC mirrors the backend — status changes need
 * OWNER/MEMBER, Delete needs OWNER — so the menu renders nothing for clients.
 * Confirmation is required for the meaningful/destructive actions (Archive, Delete).
 */

interface LifecycleTransition {
  label: string;
  target: ProjectStatus;
  icon: typeof CircleCheckIcon;
  confirm: boolean;
  done: string;
}

const LIFECYCLE: Record<ProjectStatus, LifecycleTransition> = {
  ACTIVE: {
    label: "Mark as completed",
    target: "COMPLETED",
    icon: CircleCheckIcon,
    confirm: false,
    done: "Project marked as completed",
  },
  COMPLETED: {
    label: "Archive",
    target: "ARCHIVED",
    icon: ArchiveIcon,
    confirm: true,
    done: "Project archived",
  },
  ARCHIVED: {
    label: "Restore",
    target: "ACTIVE",
    icon: RotateCcwIcon,
    confirm: false,
    done: "Project restored",
  },
};

interface ProjectActionsMenuProps {
  project: Project;
}

export function ProjectActionsMenu({ project }: ProjectActionsMenuProps) {
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "OWNER" || role === "MEMBER";
  const isOwner = role === "OWNER";

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const update = useUpdateProjectMutation(project.id);
  const remove = useDeleteProjectMutation();

  // Clients (and any unknown role) get no lifecycle controls.
  if (!canManage) return null;

  const transition = LIFECYCLE[project.status];

  const runTransition = (done: string, onDone?: () => void) =>
    update.mutate(
      { status: transition.target },
      {
        onSuccess: () => {
          toast.success(done);
          onDone?.();
        },
      },
    );

  const onTransitionSelect = () => {
    if (transition.confirm) setArchiveOpen(true);
    else runTransition(transition.done);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            aria-label="Project actions"
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onTransitionSelect}>
            <transition.icon aria-hidden="true" />
            {transition.label}
          </DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash2Icon aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive confirmation (COMPLETED → ARCHIVED) */}
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive project</DialogTitle>
            <DialogDescription>
              &quot;{project.name}&quot; will move to Archived. You can restore it anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setArchiveOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              loading={update.isPending}
              onClick={() => runTransition("Project archived", () => setArchiveOpen(false))}
            >
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation (OWNER only) */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              &quot;{project.name}&quot; and all of its data will be permanently deleted.
              This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              loading={remove.isPending}
              onClick={() => remove.mutate(project.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
