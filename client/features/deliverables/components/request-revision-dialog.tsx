"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRequestRevisionMutation } from "@/features/deliverables/hooks/use-request-revision-mutation";

interface RequestRevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  deliverableId: string;
}

/**
 * Client "Request changes" dialog: a required message describing what needs to
 * change, submitted to POST /deliverables/:id/request-revision (moves the
 * deliverable to REVISION_REQUESTED and records an open RevisionRequest).
 */
export function RequestRevisionDialog({
  open,
  onOpenChange,
  projectId,
  deliverableId,
}: RequestRevisionDialogProps) {
  const requestRevision = useRequestRevisionMutation(projectId, deliverableId);
  const [comment, setComment] = useState("");

  function handleOpenChange(next: boolean) {
    if (!next) setComment("");
    onOpenChange(next);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = comment.trim();
    if (!trimmed) return;
    requestRevision.mutate(trimmed, { onSuccess: () => handleOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Request changes</DialogTitle>
            <DialogDescription>
              Tell the team what needs changing. This sends the deliverable back for revision.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="revision-comment">What should change?</Label>
            <Textarea
              id="revision-comment"
              rows={4}
              placeholder="Could we try a warmer color palette?"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={requestRevision.isPending}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={requestRevision.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={requestRevision.isPending}
              disabled={requestRevision.isPending || !comment.trim()}
            >
              Request changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
