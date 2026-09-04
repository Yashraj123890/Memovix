"use client";

import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
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
import { CategoryPicker } from "@/features/memories/components/category-picker";
import { useCreateMemoryMutation } from "@/features/memories/hooks/use-create-memory-mutation";
import { useUpdateMemoryMutation } from "@/features/memories/hooks/use-update-memory-mutation";
import { memorySchema, type MemoryFormValues } from "@/features/memories/schemas/memory.schema";
import type { Memory } from "@/types/memory";

interface MemoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  /** Present = editing this memory (PUT); absent = creating a new one (POST). */
  memory?: Memory;
}

const DEFAULT_VALUES: MemoryFormValues = {
  title: "",
  category: "NOTE",
  customCategory: "",
  content: "",
};

function valuesForMemory(memory: Memory): MemoryFormValues {
  return {
    title: memory.title,
    category:
      memory.category === "OTHER" ? "CUSTOM" : memory.category,
    customCategory: memory.customCategory ?? "",
    content: memory.content,
  };
}

/**
 * One dialog for both Create and Edit — same shape as the backend, which
 * only differs between POST /memories and PUT /memories/:memoryId in
 * which fields are required (create) vs optional (update); the form
 * always sends all three either way, which satisfies both.
 * `key={memory?.id ?? "create"}` on the mount site (memories-container.tsx
 * / memory-detail-view.tsx) resets form state between "create" and
 * "edit this specific memory" without needing manual reset() bookkeeping
 * here beyond the on-close reset below.
 */
export function MemoryFormDialog({ open, onOpenChange, projectId, memory }: MemoryFormDialogProps) {
  const isEditing = Boolean(memory);
  const createMemory = useCreateMemoryMutation(projectId);
  const updateMemory = useUpdateMemoryMutation(projectId, memory?.id ?? "");
  const { mutate, isPending } = isEditing ? updateMemory : createMemory;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemoryFormValues>({
    resolver: zodResolver(memorySchema),
    defaultValues: memory
      ? valuesForMemory(memory)
      : DEFAULT_VALUES,
  });

  const selectedCategory = useWatch({ control, name: "category" });

  useEffect(() => {
    if (open) {
      reset(
        memory
          ? valuesForMemory(memory)
          : DEFAULT_VALUES,
      );
    }
  }, [open, memory, reset]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset(DEFAULT_VALUES);
    }
    onOpenChange(next);
  }

  const onSubmit = handleSubmit((values) => {
    mutate(
      {
        title: values.title,
        content: values.content,
        category: values.category === "CUSTOM" ? "OTHER" : values.category,
        customCategory:
          values.category === "CUSTOM" ? values.customCategory.trim() : null,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit memory" : "New memory"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this decision, note or piece of project knowledge."
                : "Capture a decision, note or update for this project."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="memory-title">Title</Label>
            <Input
              id="memory-title"
              autoComplete="off"
              placeholder="Decided to use Postgres for the main database"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "memory-title-error" : undefined}
              disabled={isPending}
              {...register("title")}
            />
            {errors.title && (
              <p id="memory-title-error" role="alert" className="text-destructive text-sm">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="memory-category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <CategoryPicker value={field.value} onChange={field.onChange} disabled={isPending} />
              )}
            />
            {selectedCategory === "CUSTOM" && (
              <div className="mt-1 flex flex-col gap-2">
                <Label htmlFor="memory-custom-category">Custom category</Label>
                <Input
                  id="memory-custom-category"
                  autoComplete="off"
                  placeholder="e.g. Security, Timeline, Research"
                  aria-invalid={Boolean(errors.customCategory)}
                  aria-describedby={
                    errors.customCategory ? "memory-custom-category-error" : undefined
                  }
                  disabled={isPending}
                  {...register("customCategory")}
                />
                <p className="text-muted-foreground text-xs">
                  Use this when none of the preset categories fit.
                </p>
                {errors.customCategory && (
                  <p
                    id="memory-custom-category-error"
                    role="alert"
                    className="text-destructive text-sm"
                  >
                    {errors.customCategory.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="memory-content">Content</Label>
            <Textarea
              id="memory-content"
              rows={5}
              placeholder="What happened, why, and anything the team should remember later..."
              aria-invalid={Boolean(errors.content)}
              aria-describedby={errors.content ? "memory-content-error" : undefined}
              disabled={isPending}
              {...register("content")}
            />
            {errors.content && (
              <p id="memory-content-error" role="alert" className="text-destructive text-sm">
                {errors.content.message}
              </p>
            )}
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
              {isEditing ? "Save changes" : "Add memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
