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
import { useUploadVersionMutation } from "@/features/deliverables/hooks/use-upload-version-mutation";

interface UploadVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  deliverableId: string;
  nextVersionNumber: number;
}

/**
 * Uploads a new immutable version. Reuses the same accepted-types/size limits
 * the backend enforces (upload.middleware + validateFileSignature).
 */
export function UploadVersionDialog({
  open,
  onOpenChange,
  projectId,
  deliverableId,
  nextVersionNumber,
}: UploadVersionDialogProps) {
  const uploadVersion = useUploadVersionMutation(projectId, deliverableId);
  const [file, setFile] = useState<File | null>(null);
  const [changeSummary, setChangeSummary] = useState("");

  function handleOpenChange(next: boolean) {
    if (!next) {
      setFile(null);
      setChangeSummary("");
    }
    onOpenChange(next);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    uploadVersion.mutate(
      { file, changeSummary },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Upload version {nextVersionNumber}</DialogTitle>
            <DialogDescription>
              Accepted types: PDF, Word, PNG, JPEG and plain text, up to 20 MB.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="version-file">File</Label>
            <input
              id="version-file"
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              disabled={uploadVersion.isPending}
              className="border-input text-muted-foreground file:text-foreground w-full rounded-md border px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="version-change-summary">What changed (optional)</Label>
            <Textarea
              id="version-change-summary"
              rows={3}
              placeholder="Adjusted the palette to warmer tones..."
              value={changeSummary}
              onChange={(event) => setChangeSummary(event.target.value)}
              disabled={uploadVersion.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={uploadVersion.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={uploadVersion.isPending} disabled={uploadVersion.isPending || !file}>
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
