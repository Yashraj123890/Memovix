"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { RequirementCategoryPicker } from "@/features/requirements/components/requirement-category-picker";
import { useUpdateRequirementMutation } from "@/features/requirements/hooks/use-requirement-mutations";
import {
  requirementEditSchema,
  type RequirementEditValues,
} from "@/features/requirements/schemas/requirement.schema";
import { REQUIREMENT_CATEGORIES } from "@/features/requirements/config/requirement-category";
import type { Requirement } from "@/types/requirement";

interface EditRequirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  requirement: Requirement | null;
}

/** Edit a persisted requirement (title / category / description). */
export function EditRequirementDialog({
  open,
  onOpenChange,
  projectId,
  requirement,
}: EditRequirementDialogProps) {
  const updateRequirement = useUpdateRequirementMutation(projectId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequirementEditValues>({
    resolver: zodResolver(requirementEditSchema),
    defaultValues: {
      title: "",
      category: REQUIREMENT_CATEGORIES[0],
      description: "",
    },
  });

  useEffect(() => {
    if (open && requirement) {
      reset({
        title: requirement.title,
        category: (REQUIREMENT_CATEGORIES as readonly string[]).includes(
          requirement.category ?? "",
        )
          ? (requirement.category as RequirementEditValues["category"])
          : REQUIREMENT_CATEGORIES[0],
        description: requirement.description ?? "",
      });
    }
  }, [open, requirement, reset]);

  const onSubmit = handleSubmit((values) => {
    if (!requirement) return;
    updateRequirement.mutate(
      {
        requirementId: requirement.id,
        payload: {
          title: values.title,
          category: values.category,
          description:
            values.description.trim() === "" ? null : values.description,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Edit requirement</DialogTitle>
            <DialogDescription>
              Update the requirement's title, category, or description.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="requirement-title">Title</Label>
            <Input
              id="requirement-title"
              aria-invalid={Boolean(errors.title)}
              disabled={updateRequirement.isPending}
              {...register("title")}
            />
            {errors.title && (
              <p role="alert" className="text-destructive text-sm">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <RequirementCategoryPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={updateRequirement.isPending}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="requirement-description">Description</Label>
            <Textarea
              id="requirement-description"
              rows={4}
              disabled={updateRequirement.isPending}
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateRequirement.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={updateRequirement.isPending}
              disabled={updateRequirement.isPending}
            >
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
