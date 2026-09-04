import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Per-request tenant context (M9 Phase 3 — Row-Level Security plumbing).
 *
 * The authenticated tenantId (from the verified JWT, never client input) is
 * placed here once by the `authenticate` middleware. The Prisma extension in
 * ./prisma reads it to apply a transaction-local Postgres GUC
 * (`app.current_tenant_id`) so RLS policies can enforce tenant isolation as a
 * second layer beneath the application-level query filtering.
 */
export interface TenantContextStore {
    tenantId?: string;
    /**
     * True once the tenant GUC has been applied on the current DB connection —
     * either by the $allOperations auto-wrap or by withTenantTx. Guards the
     * extension against (a) re-entering on its own set_config call and
     * (b) re-wrapping operations already running inside a tenant-scoped
     * transaction (which would nest a transaction and fail).
     */
    contextApplied?: boolean;
}

export const tenantContext = new AsyncLocalStorage<TenantContextStore>();

export function getTenantContext(): TenantContextStore | undefined {
    return tenantContext.getStore();
}

/** Run `callback` with the given tenant context bound for its async lifetime. */
export function runWithTenantContext<T>(
    store: TenantContextStore,
    callback: () => T
): T {
    return tenantContext.run(store, callback);
}
