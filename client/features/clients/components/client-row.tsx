"use client";

import { useState } from "react";
import { UserMinusIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RemoveClientDialog } from "@/features/clients/components/remove-client-dialog";
import { getInitials } from "@/utils/get-initials";
import type { ProjectClient } from "@/types/client";

interface ClientRowProps {
  client: ProjectClient;
  projectId: string;
}

/**
 * No "added on" timestamp here — GET /projects/:projectId/clients drops
 * ProjectClient's own createdAt in its mapping (see the doc comment on
 * ProjectClient in types/client.ts), so unlike TeamMemberRow's "Joined
 * ... ago" there's nothing real to show for that column.
 */
export function ClientRow({ client, projectId }: ClientRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <li className="flex items-center gap-3 px-6 py-3">
      <Avatar fallback={getInitials(client.name)} alt={client.name} />

      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">{client.name}</p>
        <p className="text-muted-foreground truncate text-xs">{client.email}</p>
      </div>

      <div className="flex w-8 shrink-0 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive size-8"
          onClick={() => setConfirmOpen(true)}
          aria-label={`Remove ${client.name}`}
        >
          <UserMinusIcon className="size-4" aria-hidden="true" />
        </Button>
        <RemoveClientDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          projectId={projectId}
          client={client}
        />
      </div>
    </li>
  );
}
