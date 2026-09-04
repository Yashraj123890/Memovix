"use client";

import { useQuery } from "@tanstack/react-query";
import { clientService } from "@/services/api/client.service";
import { clientKeys } from "@/features/clients/hooks/query-keys";

export function useProjectClientsQuery(projectId: string) {
  return useQuery({
    queryKey: clientKeys.activeClients(projectId),
    queryFn: () => clientService.getProjectClients(projectId),
  });
}
