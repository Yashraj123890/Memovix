"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useCreateDeliverableMutation } from "@/features/deliverables/hooks/use-create-deliverable-mutation";
import { useUpdateDeliverableMutation } from "@/features/deliverables/hooks/use-update-deliverable-mutation";
import {
  deliverableSchema,
  type DeliverableFormValues,
} from "@/features/deliverables/schemas/deliverable.schema";
import type { Deliverable } from "@/types/deliverable";

interface DeliverableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  /** Present = editing (PATCH); absent = creating (POST). */
  deliverable?: Deliverable;
}

const DEFAULT_VALUES: DeliverableFormValues = { title: "", description: "", dueDate: "" };

/** Converts a stored ISO timestamp to the yyyy-mm-dd an <input type="date"> expects. */
function toDateInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : "";
}

/**
 * One dialog for both Create and Edit, mirroring MemoryFormDialog. On create
 * it POSTs a new deliverable (status DRAFT); on edit it PATCHes title /
 * description / dueDate. Status transitions (submit / back-to-draft) are
 * handled separately in the detail view, not here.
 */
export function DeliverableFormDialog({
  open,
  onOpenChange,
  projectId,
  deliverable,
}: DeliverableFormDialogProps) {
  const isEditing = Boolean(deliverable);
  const createDeliverable = useCreateDeliverableMutation(projectId);
  const updateDeliverable = useUpdateDeliverableMutation(projectId, deliverable?.id ?? "");
  // Call the specific mutation per branch (not a unioned `mutate`) — the two
  // payload types differ (update allows null to clear a field, create does not).
  const isPending = isEditing ? updateDeliverable.isPending : createDeliverable.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeliverableFormValues>({
    resolver: zodResolver(deliverableSchema),
    defaultValues: deliverable
      ? {
          title: deliverable.title,
          description: deliverable.description ?? "",
          dueDate: toDateInput(deliverable.dueDate),
        }
      : DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        deliverable
          ? {
              title: deliverable.title,
              description: deliverable.description ?? "",
              dueDate: toDateInput(deliverable.dueDate),
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, deliverable, reset]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset(DEFAULT_VALUES);
    }
    onOpenChange(next);
  }

  const onSubmit = handleSubmit((values) => {
    const description = values.description?.trim() ? values.description.trim() : undefined;
    const dueDate = values.dueDate ? values.dueDate : undefined;

    if (isEditing) {
      // On edit, send null to explicitly clear a previously-set value.
      updateDeliverable.mutate(
        {
          title: values.title,
          description: description ?? null,
          dueDate: dueDate ?? null,
        },
        { onSuccess: () => handleOpenChange(false) },
      );
    } else {
      createDeliverable.mutate(
        { title: values.title, description, dueDate },
        { onSuccess: () => handleOpenChange(false) },
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit deliverable" : "New deliverable"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this deliverable's details."
                : "Create a deliverable, then upload versions of the work product."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="deliverable-title">Title</Label>
            <Input
              id="deliverable-title"
              autoComplete="off"
              placeholder="Logo concept"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "deliverable-title-error" : undefined}
              disabled={isPending}
              {...register("title")}
            />
            {errors.title && (
              <p id="deliverable-title-error" role="alert" className="text-destructive text-sm">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="deliverable-description">Description (optional)</Label>
            <Textarea
              id="deliverable-description"
              rows={4}
              placeholder="What this deliverable covers, notes for the client..."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "deliverable-description-error" : undefined}
              disabled={isPending}
              {...register("description")}
            />
            {errors.description && (
              <p id="deliverable-description-error" role="alert" className="text-destructive text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="deliverable-due-date">Due date (optional)</Label>
            <Input
              id="deliverable-due-date"
              type="date"
              disabled={isPending}
              {...register("dueDate")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending} disabled={isPending}>
              {isEditing ? "Save changes" : "Create deliverable"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
