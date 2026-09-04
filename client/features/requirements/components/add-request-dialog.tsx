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
import { useAddRequestMutation } from "@/features/requirements/hooks/use-requirement-mutations";
import {
  requirementEditSchema,
  type RequirementEditValues,
} from "@/features/requirements/schemas/requirement.schema";
import { REQUIREMENT_CATEGORIES } from "@/features/requirements/config/requirement-category";

interface AddRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

/**
 * Manually add a New Request — a candidate requirement that lands in the New
 * Requests lane (isBaseline=false) so it can be checked against the Baseline
 * Scope by "Compare to baseline". Reuses the same form shape as the edit dialog.
 */
export function AddRequestDialog({
  open,
  onOpenChange,
  projectId,
}: AddRequestDialogProps) {
  const addRequest = useAddRequestMutation(projectId);

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

  // Reset to a blank form each time the dialog opens.
  useEffect(() => {
    if (open) {
      reset({
        title: "",
        category: REQUIREMENT_CATEGORIES[0],
        description: "",
      });
    }
  }, [open, reset]);

  const onSubmit = handleSubmit((values) => {
    addRequest.mutate(
      {
        title: values.title,
        category: values.category,
        description:
          values.description.trim() === "" ? null : values.description,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Add new request</DialogTitle>
            <DialogDescription>
              Capture a new or changed requirement. It joins the New Requests
              lane and is compared against the Baseline Scope.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="request-title">Title</Label>
            <Input
              id="request-title"
              aria-invalid={Boolean(errors.title)}
              disabled={addRequest.isPending}
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
                  disabled={addRequest.isPending}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="request-description">Description</Label>
            <Textarea
              id="request-description"
              rows={4}
              disabled={addRequest.isPending}
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addRequest.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={addRequest.isPending}
              disabled={addRequest.isPending}
            >
              Add request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
