"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectService } from "@/services/api/project.service";
import { projectKeys } from "@/features/projects/hooks/query-keys";
import { getErrorMessage } from "@/utils/error";
import type { UpdateProjectRequest } from "@/types/project";

/**
 * Updates a project via the existing PUT /projects/:id (name/description/status).
 * Used by the project lifecycle transitions, which send only `{ status }`.
 * Invalidates both the list (so status filters reflect the change) and the
 * detail (so the project header badge updates immediately). Success toasts are
 * left to the caller so each transition can label itself ("Marked as completed",
 * etc.); this hook owns invalidation + error surfacing.
 */
export function useUpdateProjectMutation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProjectRequest) =>
      projectService.updateProject(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
