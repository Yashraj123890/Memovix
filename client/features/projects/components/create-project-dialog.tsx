"use client";

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
import { useCreateProjectMutation } from "@/features/projects/hooks/use-create-project-mutation";
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from "@/features/projects/schemas/create-project.schema";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Only asks for what POST /projects actually accepts — name and
 * description (status defaults to Active server-side). Client company,
 * start/target dates and a project color or icon aren't offered here: the
 * Project table has no columns for them today, so showing those fields
 * would mean nothing typed into them is ever saved. See CreateProjectRequest
 * (types/project.ts) for the same note against the API contract.
 */
export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { mutate, isPending } = useCreateProjectMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "" },
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset();
    }
    onOpenChange(next);
  }

  const onSubmit = handleSubmit((values) => {
    mutate(
      { name: values.name, description: values.description || undefined },
      { onSuccess: () => handleOpenChange(false) },
    );
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>Start tracking a new client project.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              autoComplete="off"
              placeholder="Acme Website Redesign"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "project-name-error" : undefined}
              disabled={isPending}
              {...register("name")}
            />
            {errors.name && (
              <p id="project-name-error" role="alert" className="text-destructive text-sm">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              rows={3}
              placeholder="What's this project about?"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "project-description-error" : undefined}
              disabled={isPending}
              {...register("description")}
            />
            {errors.description && (
              <p id="project-description-error" role="alert" className="text-destructive text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending} disabled={isPending}>
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
