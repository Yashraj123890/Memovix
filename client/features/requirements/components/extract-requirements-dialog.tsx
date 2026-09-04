"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { fileService } from "@/services/api/file.service";
import { RequirementReviewList } from "@/features/requirements/components/requirement-review-list";
import {
  useExtractRequirementsMutation,
  useConfirmRequirementsMutation,
  useRejectRequirementsMutation,
} from "@/features/requirements/hooks/use-requirement-mutations";
import type {
  ConfirmRequirementInput,
  ExtractRequirementsResult,
} from "@/types/requirement";

interface ExtractRequirementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const MEMORY_SOURCE = "__memory__";

/**
 * Extract → review → accept/reject flow (blueprint §3.2.4). Step 1 optionally
 * scopes extraction to an indexed file (else it uses project memory); step 2
 * reviews the ephemeral proposals before anything is persisted.
 */
export function ExtractRequirementsDialog({
  open,
  onOpenChange,
  projectId,
}: ExtractRequirementsDialogProps) {
  const [sourceFileId, setSourceFileId] = useState<string>(MEMORY_SOURCE);
  const [result, setResult] = useState<ExtractRequirementsResult | null>(null);

  const extract = useExtractRequirementsMutation(projectId);
  const confirm = useConfirmRequirementsMutation(projectId);
  const reject = useRejectRequirementsMutation(projectId);

  const filesQuery = useQuery({
    queryKey: ["files", "project", projectId, "for-extract"],
    queryFn: () => fileService.getProjectFiles(projectId),
    enabled: open,
  });
  const indexedFiles = (filesQuery.data ?? []).filter(
    (file) => file.ingestStatus === "INDEXED",
  );

  useEffect(() => {
    if (open) {
      setSourceFileId(MEMORY_SOURCE);
      setResult(null);
    }
  }, [open]);

  function handleExtract() {
    const fileId = sourceFileId === MEMORY_SOURCE ? undefined : sourceFileId;
    extract.mutate(fileId, { onSuccess: (data) => setResult(data) });
  }

  function handleAccept(
    kept: ConfirmRequirementInput[],
    rejectedTitles: string[],
  ) {
    confirm.mutate(kept, {
      onSuccess: () => {
        if (rejectedTitles.length > 0) {
          reject.mutate(rejectedTitles);
        }
        onOpenChange(false);
      },
    });
  }

  function handleRejectAll(titles: string[]) {
    reject.mutate(titles, { onSuccess: () => onOpenChange(false) });
  }

  const isSubmitting = confirm.isPending || reject.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Extract requirements</DialogTitle>
          <DialogDescription>
            {result
              ? "Review, edit, and accept the AI's proposed requirements. Nothing is saved until you accept."
              : "The AI proposes structured requirements from a document or this project's memory. You review them before anything is saved."}
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="requirement-source">Source</Label>
              <select
                id="requirement-source"
                className="border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-2"
                value={sourceFileId}
                disabled={extract.isPending}
                onChange={(event) => setSourceFileId(event.target.value)}
              >
                <option value={MEMORY_SOURCE}>
                  Project memory (all indexed content)
                </option>
                {indexedFiles.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.originalName}
                  </option>
                ))}
              </select>
              {sourceFileId === MEMORY_SOURCE ? (
                <p className="text-muted-foreground text-xs">
                  Extracts from this project's indexed memories and documents.
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Extracts from the selected document; each requirement keeps a
                  link to its source.
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleExtract}
                loading={extract.isPending}
                disabled={extract.isPending}
              >
                <SparklesIcon aria-hidden="true" />
                Extract requirements
              </Button>
            </div>
          </div>
        ) : result.requirements.length === 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm">
              The AI didn't find any requirements in the selected source. Try a
              different document or add requirements manually later.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResult(null)}
              >
                Back
              </Button>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <RequirementReviewList
            proposals={result.requirements}
            sourceFileId={result.sourceFileId}
            isSubmitting={isSubmitting}
            onAccept={handleAccept}
            onRejectAll={handleRejectAll}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
