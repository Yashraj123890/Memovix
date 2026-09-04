/**
 * Client management types — Clients are project-scoped (unlike workspace
 * Members): ClientInvitation has a projectId column
 * (server/prisma/schema.prisma), and ProjectClient links a client User to
 * exactly one project. See services/api/client.service.ts for the routes.
 */

/**
 * GET /api/projects/:projectId/client-invitations only ever returns
 * PENDING rows (server/src/repositories/clientInvitation.repository.ts
 * findPendingByProject filters status: "PENDING" server-side) — ACCEPTED
 * invitations disappear from this endpoint entirely once the client
 * registers, they don't show up with a different status. This type still
 * covers all three enum values for completeness/future-proofing, but the
 * UI never has to branch on ACCEPTED/EXPIRED here.
 */
export type ClientInvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED";

export interface ClientInvitation {
  id: string;
  email: string;
  status: ClientInvitationStatus;
  tenantId: string;
  projectId: string;
  invitedById: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * GET /api/projects/:projectId/clients
 * (server/src/services/projectClient.service.ts getProjectClients maps
 * `clients.map(item => item.client)` off the ProjectClient join) — only
 * the client User's id/name/email are selected server-side, so there's no
 * "added to project on" timestamp available here even though ProjectClient
 * itself has a createdAt column; it's dropped in that mapping.
 */
export interface ProjectClient {
  id: string;
  name: string;
  email: string;
}
