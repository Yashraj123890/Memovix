"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { projectService } from "@/services/api/project.service";
import { projectKeys } from "@/features/projects/hooks/query-keys";
import { PROJECTS_ROUTE } from "@/constants/routes";
import { getErrorMessage } from "@/utils/error";

/**
 * Deletes a project via the existing DELETE /projects/:id (OWNER-only, enforced
 * server-side). Since the action is taken from inside the project workspace,
 * success invalidates the list and navigates back to the projects index.
 */
export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (projectId: string) => projectService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success("Project deleted");
      router.push(PROJECTS_ROUTE);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
