"use client";

import { useQuery } from "@tanstack/react-query";
import { decisionService } from "@/services/api/decision.service";
import { decisionKeys } from "@/features/decisions/hooks/query-keys";
import type { DecisionCategory } from "@/types/decision";

export function useDecisionsQuery(projectId: string, category?: DecisionCategory) {
  return useQuery({
    queryKey: decisionKeys.list(projectId, category),
    queryFn: () => decisionService.list(projectId, category),
  });
}
