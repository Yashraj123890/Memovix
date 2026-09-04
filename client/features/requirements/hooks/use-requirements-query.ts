"use client";

import { useQuery } from "@tanstack/react-query";
import { requirementService } from "@/services/api/requirement.service";
import { requirementKeys } from "@/features/requirements/hooks/query-keys";

export function useRequirementsQuery(projectId: string, baseline?: boolean) {
  return useQuery({
    queryKey: requirementKeys.list(projectId, baseline),
    queryFn: () => requirementService.list(projectId, baseline),
  });
}
