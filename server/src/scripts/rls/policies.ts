/**
 * M9 Phase 3 — RLS policy definitions (single source of truth).
 *
 * Mirrors server/docs/rls-tenant-mapping.md. Consumed by enable-rls.ts and
 * disable-rls.ts so the enable/rollback pair can never drift apart.
 *
 * IDs are cuid (text) → all comparisons are plain text equality (no ::uuid cast).
 * Every identifier is quoted because column names are camelCase and several
 * tables keep their PascalCase Prisma model name (no @@map).
 */

/** Transaction-local GUC set by the Phase 1 tenant-context plumbing. */
export const TENANT_GUC = "app.current_tenant_id";

/** `current_setting(..., true)` → returns NULL (no error) when the GUC is unset. */
const CTX = `current_setting('${TENANT_GUC}', true)`;

// ---- predicate builders (kept identical to the mapping document) ------------
const viaProject = (col = `"projectId"`) =>
    `${col} IN (SELECT "id" FROM "projects" WHERE "tenantId" = ${CTX})`;

const viaDeliverable = (col = `"deliverableId"`) =>
    `${col} IN (SELECT "id" FROM "deliverables" WHERE "projectId" IN ` +
    `(SELECT "id" FROM "projects" WHERE "tenantId" = ${CTX}))`;

const viaMemory = (col = `"memoryId"`) =>
    `${col} IN (SELECT "id" FROM "memories" WHERE "projectId" IN ` +
    `(SELECT "id" FROM "projects" WHERE "tenantId" = ${CTX}))`;

const viaFile = (col = `"fileId"`) =>
    `${col} IN (SELECT "id" FROM "ProjectFile" WHERE "projectId" IN ` +
    `(SELECT "id" FROM "projects" WHERE "tenantId" = ${CTX}))`;

const viaUser = (col = `"userId"`) =>
    `${col} IN (SELECT "id" FROM "users" WHERE "tenantId" = ${CTX})`;

// M11 (client-only multi-workspace): a user is also visible in a workspace where
// they are a CLIENT on one of its projects (via project_clients), in addition to
// their home tenantId. Owners/members already satisfy `tenantId = CTX`, so this
// only adds cross-workspace visibility for clients — no change for single-workspace.
const clientVisibleInTenant = () =>
    `"id" IN (SELECT pc."clientId" FROM "project_clients" pc ` +
    `JOIN "projects" p ON p."id" = pc."projectId" WHERE p."tenantId" = ${CTX})`;

// M11: a notification is scoped by its PROJECT's tenant (so a client whose home
// tenant differs from the notifying workspace still sees it in that workspace);
// system notifications (null projectId) fall back to the recipient's home tenant.
// For single-workspace users project.tenantId == recipient.tenantId, so this is a
// no-op relative to the previous `viaUser` policy.
const notificationPredicate = () =>
    `("projectId" IS NOT NULL AND ${viaProject()}) OR ` +
    `("projectId" IS NULL AND ${viaUser()})`;

export type RlsMode = "strict" | "permissive";

export interface RlsTable {
    /** Quoted SQL table identifier. */
    table: string;
    mode: RlsMode;
    /** Tenant-match expression (permissive tables get the CTX-null OR wrapper). */
    predicate: string;
    /** Derivation label, for reporting only. */
    derivation: string;
}

export const POLICY_NAME = "tenant_isolation";

/**
 * STRICT tables are fail-closed: when CTX is NULL (pre-auth / missing context)
 * the predicate is NULL/false → 0 rows. PERMISSIVE tables add `CTX IS NULL OR …`
 * so the narrow pre-auth paths (login, register, invite-accept) still work.
 */
export const RLS_TABLES: RlsTable[] = [
    // --- direct tenantId ---
    { table: `"projects"`, mode: "strict", predicate: `"tenantId" = ${CTX}`, derivation: "direct tenantId" },
    { table: `"AuditLog"`, mode: "strict", predicate: `"tenantId" = ${CTX}`, derivation: "direct tenantId" },

    // --- via projectId → projects.tenantId ---
    { table: `"memories"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },
    { table: `"document_chunks"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },
    { table: `"searchable_chunks"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },
    { table: `"ProjectFile"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },
    { table: `"Timeline"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },
    { table: `"ProjectMember"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },
    // Permissive, not strict: the client-invite-accept flow (POST /client/register)
    // inserts a project_clients row PRE-AUTH (no tenant context). Authenticated
    // reads still enforce tenant isolation via the strict branch.
    { table: `"project_clients"`, mode: "permissive", predicate: viaProject(), derivation: "via projectId (client-accept writes pre-auth)" },
    { table: `"deliverables"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },
    { table: `"decision_log"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },
    { table: `"requirements"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },
    { table: `"scope_flags"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },
    { table: `"meeting_notes"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },
    { table: `"action_items"`, mode: "strict", predicate: viaProject(), derivation: "via projectId" },

    // --- Notification: via project tenant, system-notifications via user (M11) ---
    { table: `"Notification"`, mode: "strict", predicate: notificationPredicate(), derivation: "via projectId; system (null projectId) via userId" },

    // --- via parent chain (second-degree) ---
    { table: `"deliverable_versions"`, mode: "strict", predicate: viaDeliverable(), derivation: "parent chain: deliverable→project" },
    { table: `"revision_requests"`, mode: "strict", predicate: viaDeliverable(), derivation: "parent chain: deliverable→project" },
    { table: `"MemoryEmbedding"`, mode: "strict", predicate: viaMemory(), derivation: "parent chain: memory→project" },
    {
        table: `"Comment"`,
        mode: "strict",
        predicate: `(${viaMemory()}) OR (${viaFile()})`,
        derivation: "parent chain: memory/file→project",
    },

    // --- permissive (pre-auth reachable; strict once a context exists) ---
    { table: `"tenants"`, mode: "permissive", predicate: `"id" = ${CTX}`, derivation: "own tenant (registration pre-auth)" },
    { table: `"users"`, mode: "permissive", predicate: `"tenantId" = ${CTX} OR ${clientVisibleInTenant()}`, derivation: "home tenantId, or client-via-project_clients (M11); login pre-auth" },
    { table: `"member_invitations"`, mode: "permissive", predicate: `"tenantId" = ${CTX}`, derivation: "direct tenantId (accept-by-token pre-auth)" },
    { table: `"client_invitations"`, mode: "permissive", predicate: `"tenantId" = ${CTX}`, derivation: "direct tenantId (accept-by-token pre-auth)" },
];

/** Tenant-owned tables intentionally NOT under RLS (see mapping doc §3). */
export const EXCLUDED_TABLES = [
    { table: "refresh_tokens", reason: "pre-auth session allowlist (sha256(jti)); no tenant-owned data" },
    { table: "password_reset_tokens", reason: "pre-auth reset flow keyed by random token; no tenant-owned data" },
];

/**
 * Final USING/WITH CHECK expression for a table.
 *
 * Permissive tables add a "no tenant context" escape hatch for pre-auth flows.
 * NOTE: after a transaction-local `set_config(..., true)`, PostgreSQL leaves the
 * custom GUC as an EMPTY STRING (not NULL) on a pooled connection — so the escape
 * hatch must treat '' as "unset" too, via NULLIF, or login/register/invite-accept
 * break intermittently on recycled connections. Strict tables need no such guard:
 * `"tenantId" = ''` is simply false (fail-closed), which is exactly what we want.
 */
export function policyExpr(t: RlsTable): string {
    return t.mode === "permissive"
        ? `NULLIF(${CTX}, '') IS NULL OR (${t.predicate})`
        : t.predicate;
}
