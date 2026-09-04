"use client";

import { useParams } from "next/navigation";
import { ClientsContainer } from "@/features/clients/components/clients-container";

/**
 * "/projects/[id]/clients" — real project-scoped client directory:
 * active clients, pending client invitations, invite/cancel/remove, all
 * against server/src/routes/clientInvitation.routes.ts and
 * projectClient.routes.ts.
 */
export default function ProjectClientsPage() {
  const { id } = useParams<{ id: string }>();

  return <ClientsContainer projectId={id} />;
}
