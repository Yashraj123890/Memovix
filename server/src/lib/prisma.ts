import { PrismaClient, Prisma } from "@prisma/client";
import { getTenantContext, tenantContext } from "./tenant-context";

declare global {
    // eslint-disable-next-line no-var
    var prismaBase: PrismaClient | undefined;
}

const basePrisma =
    global.prismaBase ??
    new PrismaClient({
        log: ["query", "error", "warn"],
        // Runtime uses the least-privilege application role (APP_DATABASE_URL =
        // memovix_app, subject to RLS). Prisma migrations/db push keep using the
        // schema's url = env("DATABASE_URL") (neondb_owner, admin). Falls back to
        // DATABASE_URL when APP_DATABASE_URL is unset so dev without the app role
        // still runs. (M9 Phase 3 — connection wiring only; plumbing unchanged.)
        datasources: {
            db: {
                url: process.env.APP_DATABASE_URL ?? process.env.DATABASE_URL,
            },
        },
    });

if (process.env.NODE_ENV !== "production") {
    global.prismaBase = basePrisma;
}

/**
 * Tenant-context extension (M9 Phase 3 — Row-Level Security plumbing).
 *
 * When an authenticated request has populated the tenant context (see
 * ./tenant-context), every Prisma operation — model methods AND raw queries —
 * runs inside a one-shot transaction that first executes
 *   SELECT set_config('app.current_tenant_id', <tenantId>, true)
 * so Postgres RLS policies can read the tenant from a transaction-local GUC on
 * the SAME connection as the query.
 *
 * `contextApplied` prevents (a) the extension re-entering on its own
 * set_config call and (b) double-wrapping operations already inside a
 * withTenantTx transaction. With no tenant context (pre-auth flows, scripts,
 * background jobs) operations run unchanged.
 *
 * NOTE: RLS policies are NOT enabled yet (Phase 2 applies them via a raw-SQL
 * script). Until then set_config is inert and behavior is identical.
 */
const tenantExtension = Prisma.defineExtension((client) =>
    client.$extends({
        query: {
            async $allOperations({ args, query }) {
                const ctx = getTenantContext();

                if (!ctx?.tenantId || ctx.contextApplied) {
                    return query(args);
                }

                return tenantContext.run(
                    { ...ctx, contextApplied: true },
                    async () => {
                        const [, result] = await client.$transaction([
                            client.$executeRawUnsafe(
                                "SELECT set_config('app.current_tenant_id', $1, true)",
                                ctx.tenantId
                            ),
                            query(args) as Prisma.PrismaPromise<unknown>,
                        ]);
                        return result;
                    }
                );
            },
        },
    })
);

const prisma = basePrisma.$extends(tenantExtension);

export type ExtendedPrismaClient = typeof prisma;

/**
 * Interactive transaction with the tenant GUC applied on the transaction's
 * connection before the callback runs. Use in place of
 * `prisma.$transaction(async (tx) => …)` for any multi-statement transaction
 * touching tenant-owned tables, so the inner operations are RLS-scoped and the
 * $allOperations auto-wrap does not attempt to nest a transaction.
 *
 * With no tenant context the transaction runs without set_config (behavior
 * identical to a plain interactive transaction).
 */
export function withTenantTx<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
    const ctx = getTenantContext();

    return prisma.$transaction((tx) =>
        tenantContext.run(
            { ...(ctx ?? {}), contextApplied: true },
            async () => {
                if (ctx?.tenantId) {
                    await tx.$executeRawUnsafe(
                        "SELECT set_config('app.current_tenant_id', $1, true)",
                        ctx.tenantId
                    );
                }
                return fn(tx as Prisma.TransactionClient);
            }
        )
    );
}

export default prisma;
