/**
 * Mirrors the AuditLog model in server/prisma/schema.prisma. `action` and
 * `entityType` are plain strings on the backend, not Prisma enums — there
 * is no fixed set of values to type against, so both stay `string` here
 * and are resolved through a lookup with a fallback (see
 * features/audit-logs/config/audit-log-config.ts) rather than a union
 * type that a new backend action could silently fall outside of.
 *
 * `details` is a free-form JSON payload that varies per action (e.g.
 * `{ title, category }` for MEMORY_* actions, `{ fileName, mimeType,
 * size }` for FILE_* actions) — modeled as an open record, rendered
 * generically in the detail drawer.
 */
export interface AuditLogUser {
  id: string;
  name: string;
  email: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string | null;
  projectId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  user: AuditLogUser | null;
}
