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
import { DecisionCategoryPicker } from "@/features/decisions/components/decision-category-picker";
import { useCreateDecisionMutation } from "@/features/decisions/hooks/use-create-decision-mutation";
import {
  decisionSchema,
  type DecisionFormValues,
} from "@/features/decisions/schemas/decision.schema";

interface AddDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

const DEFAULT_VALUES: DecisionFormValues = {
  category: "SCOPE",
  customCategory: "",
  description: "",
};

/** Create-only dialog for a manual decision entry (decisions are append-only). */
export function AddDecisionDialog({ open, onOpenChange, projectId }: AddDecisionDialogProps) {
  const createDecision = useCreateDecisionMutation(projectId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DecisionFormValues>({
    resolver: zodResolver(decisionSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const selectedCategory = useWatch({ control, name: "category" });

  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES);
    }
  }, [open, reset]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset(DEFAULT_VALUES);
    }
    onOpenChange(next);
  }

  const onSubmit = handleSubmit((values) => {
    createDecision.mutate(
      {
        category: values.category === "CUSTOM" ? "OTHER" : values.category,
        customCategory:
          values.category === "CUSTOM" ? values.customCategory.trim() : null,
        description: values.description,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Log a decision</DialogTitle>
            <DialogDescription>
              Record an explicit project decision. Entries are permanent — corrections are
              added as new entries.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="decision-category">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <DecisionCategoryPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={createDecision.isPending}
                />
              )}
            />
            {selectedCategory === "CUSTOM" && (
              <div className="mt-1 flex flex-col gap-2">
                <Label htmlFor="decision-custom-category">Custom category</Label>
                <Input
                  id="decision-custom-category"
                  autoComplete="off"
                  placeholder="e.g. Security, Compliance, Integration"
                  aria-invalid={Boolean(errors.customCategory)}
                  aria-describedby={
                    errors.customCategory ? "decision-custom-category-error" : undefined
                  }
                  disabled={createDecision.isPending}
                  {...register("customCategory")}
                />
                <p className="text-muted-foreground text-xs">
                  Use this when none of the preset categories fit.
                </p>
                {errors.customCategory && (
                  <p
                    id="decision-custom-category-error"
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
            <Label htmlFor="decision-description">Decision</Label>
            <Textarea
              id="decision-description"
              rows={4}
              placeholder="Client confirmed via call that the launch date moves to March 15..."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "decision-description-error" : undefined}
              disabled={createDecision.isPending}
              {...register("description")}
            />
            {errors.description && (
              <p id="decision-description-error" role="alert" className="text-destructive text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createDecision.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createDecision.isPending} disabled={createDecision.isPending}>
              Log decision
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
