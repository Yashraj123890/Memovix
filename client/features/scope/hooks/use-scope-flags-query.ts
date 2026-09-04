"use client";

import { useQuery } from "@tanstack/react-query";
import { scopeService } from "@/services/api/scope.service";
import { scopeFlagKeys } from "@/features/scope/hooks/query-keys";

export function useScopeFlagsQuery(projectId: string, resolution?: string) {
  return useQuery({
    queryKey: scopeFlagKeys.list(projectId, resolution),
    queryFn: () => scopeService.listFlags(projectId, resolution),
  });
}
