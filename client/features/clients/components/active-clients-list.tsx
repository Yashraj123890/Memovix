import { ClientRow } from "@/features/clients/components/client-row";
import type { ProjectClient } from "@/types/client";

interface ActiveClientsListProps {
  clients: ProjectClient[];
  projectId: string;
}

/** Same full-bleed-row-inside-a-padded-card pattern as TeamList/FileList. */
export function ActiveClientsList({ clients, projectId }: ActiveClientsListProps) {
  return (
    <ul className="divide-border -mx-6 flex flex-col divide-y">
      {clients.map((client) => (
        <ClientRow key={client.id} client={client} projectId={projectId} />
      ))}
    </ul>
  );
}
