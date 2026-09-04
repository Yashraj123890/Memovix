"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { projectService } from "@/services/api/project.service";
import { projectKeys } from "@/features/projects/hooks/query-keys";
import { getWorkspaceTabHref } from "@/features/projects/config/workspace-tabs";
import { getErrorMessage } from "@/utils/error";
import type { CreateProjectRequest, Project } from "@/types/project";

/**
 * Creates a project, then redirects straight to its Overview page — the
 * same route ProjectCard links already point at (getWorkspaceTabHref with
 * segment: null). Whether this is the owner's *first* project is decided
 * here, from the projects-list cache as it stood immediately before this
 * mutation ran (i.e. before invalidateQueries below refetches it) — if
 * that list was empty or never fetched, `?onboarding=1` is appended so the
 * Overview page knows to show the Getting Started checklist (see
 * features/projects/components/getting-started-checklist.tsx).
 */
export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateProjectRequest) => projectService.createProject(payload),
    onSuccess: (project: Project) => {
      const previousProjects = queryClient.getQueryData<Project[]>(projectKeys.lists());
      const isFirstProject = !previousProjects || previousProjects.length === 0;

      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success(`${project.name} created`);

      const href = getWorkspaceTabHref(project.id, null);
      router.push(isFirstProject ? `${href}?onboarding=1` : href);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
