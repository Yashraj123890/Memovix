import type { ProjectClient } from "@/types/client";

export interface ClientFilters {
  search: string;
}

/**
 * Client-side search only — GET /projects/:id/clients takes no query
 * params, same situation as F9 Files/F10 Team. No role filter here (every
 * row returned by this endpoint is already role CLIENT).
 */
export function filterClients(clients: ProjectClient[], { search }: ClientFilters): ProjectClient[] {
  const normalizedSearch = search.trim().toLowerCase();
  if (normalizedSearch.length === 0) {
    return clients;
  }

  return clients.filter(
    (client) =>
      client.name.toLowerCase().includes(normalizedSearch) ||
      client.email.toLowerCase().includes(normalizedSearch),
  );
}
