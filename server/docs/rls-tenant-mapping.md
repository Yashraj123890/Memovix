# M9 Phase 3 — RLS Tenant Mapping (review gate, pre-policy)

Authoritative mapping of every table to its tenant derivation and the exact policy
predicate that will be applied in Phase 2. **No policies are applied yet.**

- IDs are **cuid (text)**, so all comparisons are plain text equality (no `::uuid` cast).
- `CTX` below is shorthand for `current_setting('app.current_tenant_id', true)`
  (the transaction-local GUC set by the Phase 1 plumbing; `true` = don't error when unset → returns `NULL`).
- Table names follow Prisma `@@map`; models without `@@map` keep their quoted PascalCase name
  (`"Timeline"`, `"Comment"`, `"MemoryEmbedding"`, `"Notification"`, `"AuditLog"`, `"ProjectMember"`, `"ProjectFile"`).
- Every policy uses the **same predicate for `USING` and `WITH CHECK`** (read + write symmetry: you can neither see nor insert another tenant's row).

## Enforcement modes

- **STRICT (fail-closed):** predicate is just the tenant match. When `CTX` is `NULL`
  (pre-auth, scripts, a forgotten context) the predicate is `NULL`/false → **0 rows**.
  Used for all tenant-owned *project data*. Every access path to these is authenticated,
  so context is always present in legitimate use.
- **PERMISSIVE (context-aware):** predicate is `CTX IS NULL OR <match>`. Protects
  authenticated access (context present → strict) while allowing the narrow pre-auth
  paths that must read/write these before a tenant is known (login, register, invite-accept).

---

## 1. STRICT tables (fail-closed)

### 1a. Direct `tenantId`

| Table | Derivation | Predicate |
|-------|------------|-----------|
| `projects` | direct `tenantId` | `"tenantId" = CTX` |
| `"AuditLog"` | direct `tenantId` (also has nullable `projectId`; `tenantId` is always set) | `"tenantId" = CTX` |

### 1b. Via `projectId` → `projects.tenantId`

Predicate shape: `"projectId" IN (SELECT id FROM projects WHERE "tenantId" = CTX)`

| Table | Derivation |
|-------|------------|
| `memories` | `projectId` |
| `document_chunks` | `projectId` (denormalized column) |
| `"ProjectFile"` | `projectId` |
| `"Timeline"` | `projectId` |
| `"ProjectMember"` | `projectId` |
| `project_clients` | `projectId` |
| `deliverables` | `projectId` |
| `decision_log` | `projectId` |
| `requirements` | `projectId` |
| `scope_flags` | `projectId` |
| `meeting_notes` | `projectId` |

### 1c. Via `userId` → `users.tenantId`

| Table | Derivation | Predicate |
|-------|------------|-----------|
| `"Notification"` | `userId` (its `projectId` is nullable — SYSTEM notes have none — so tenant is derived from the always-present recipient user) | `"userId" IN (SELECT id FROM users WHERE "tenantId" = CTX)` |

### 1d. Via parent chain (second-degree)

| Table | FK chain | Predicate |
|-------|----------|-----------|
| `deliverable_versions` | `deliverableId` → `deliverables.projectId` → `projects.tenantId` | `"deliverableId" IN (SELECT id FROM deliverables WHERE "projectId" IN (SELECT id FROM projects WHERE "tenantId" = CTX))` |
| `revision_requests` | `deliverableId` → `deliverables.projectId` → `projects.tenantId` | `"deliverableId" IN (SELECT id FROM deliverables WHERE "projectId" IN (SELECT id FROM projects WHERE "tenantId" = CTX))` |
| `"MemoryEmbedding"` | `memoryId` → `memories.projectId` → `projects.tenantId` | `"memoryId" IN (SELECT id FROM memories WHERE "projectId" IN (SELECT id FROM projects WHERE "tenantId" = CTX))` |
| `"Comment"` | polymorphic: `memoryId?` → `memories` **or** `fileId?` → `"ProjectFile"`, each → `projects.tenantId` | `("memoryId" IN (SELECT id FROM memories WHERE "projectId" IN (SELECT id FROM projects WHERE "tenantId" = CTX))) OR ("fileId" IN (SELECT id FROM "ProjectFile" WHERE "projectId" IN (SELECT id FROM projects WHERE "tenantId" = CTX)))` |

---

## 2. PERMISSIVE tables (context-aware; pre-auth paths must reach these)

Predicate shape: `CTX IS NULL OR <match>` for both `USING` and `WITH CHECK`.

| Table | Match | Why permissive (pre-auth path) |
|-------|-------|-------------------------------|
| `tenants` | `id = CTX` | Registration **creates** a tenant before any context exists; authenticated reads see only their own tenant |
| `users` | `"tenantId" = CTX` | Login looks up by email pre-auth; register/invite-accept insert users pre-auth. Authenticated reads (member lists, `include: { user }`) are strict — and all users in a workspace share the freelancer's `tenantId`, so nothing legitimate is hidden |
| `member_invitations` | `"tenantId" = CTX` | Accept-by-token (member registration) runs pre-auth; create/list run authenticated (strict) |
| `client_invitations` | `"tenantId" = CTX` | Accept-by-token (`POST /client/register`) runs pre-auth; create/list/cancel run authenticated (strict) |

**Note on invitations:** these were candidates for outright *exclusion* (token-gated). Keeping
them PERMISSIVE instead is strictly stronger — it still enforces tenant isolation on every
*authenticated* create/list/cancel, while only the token-keyed pre-auth accept runs unrestricted.

---

## 3. Tables intentionally excluded from RLS

Making the security boundary explicit: these carry **no tenant-owned project data** and are
reached **only** on pre-auth, token-keyed paths where a tenant context cannot exist by design.
Their security boundary is the unguessable token / userId key, not tenant scoping.

| Table | Why excluded |
|-------|--------------|
| `refresh_tokens` | Session allowlist keyed by `sha256(jti)`. The refresh path is inherently pre-auth (you are exchanging a token precisely because you are *not* yet authenticated), so no tenant context exists. Stores only `userId`, a hash, and expiry — nothing cross-tenant-readable. A tenant predicate would break silent refresh for zero data-protection gain. |
| `password_reset_tokens` | Forgot-password flow is pre-auth by definition and keyed by a random single-use `token`. Stores only `userId`, token, expiry. Same reasoning as above. |

*(Not tenant tables at all: none — every remaining model is covered above.)*

---

## 4. Coverage check

24 models total = **18 STRICT + 4 PERMISSIVE (22 under RLS) + 2 excluded**. No tenant-owned
table is unaccounted for.

---

## 5. ⚠ Enforcement prerequisite (BLOCKER — see handoff)

The app connects as Postgres role **`neondb_owner`**, which has **`rolbypassrls = true`**
(verified read-only against the live Neon DB). A role with the `BYPASSRLS` attribute
**always bypasses RLS, even with `FORCE ROW LEVEL SECURITY`**. Therefore, applying these
policies while the app connects as `neondb_owner` would produce policies that **never enforce**
for application queries (security theater).

Making RLS actually enforce requires the app to connect as a **non-`BYPASSRLS` role** — i.e.
the dedicated application role that was deferred in decision D3. This must be resolved before
Phase 2 policies are meaningful. See the conversation handoff for options.
