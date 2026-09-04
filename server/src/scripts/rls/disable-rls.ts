import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { RLS_TABLES, POLICY_NAME } from "./policies";

/**
 * Idempotent rollback for enable-rls.ts: drop the tenant_isolation policy and
 * turn RLS off on every table. Runs as the ADMIN/owner role (DATABASE_URL =
 * neondb_owner). Re-runnable: DROP POLICY IF EXISTS and NO FORCE / DISABLE are
 * no-ops when already absent/off.
 *
 * The application role and its grants are left intact (they are provisioned
 * independently of RLS and are harmless without policies).
 *
 *   npm run db:rls:disable
 */

async function main() {
    const admin = new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL } },
    });

    for (const t of RLS_TABLES) {
        await admin.$executeRawUnsafe(`DROP POLICY IF EXISTS "${POLICY_NAME}" ON ${t.table}`);
        await admin.$executeRawUnsafe(`ALTER TABLE ${t.table} NO FORCE ROW LEVEL SECURITY`);
        await admin.$executeRawUnsafe(`ALTER TABLE ${t.table} DISABLE ROW LEVEL SECURITY`);
        console.log(`↩️  ${t.table}  — policy dropped, RLS disabled`);
    }

    console.log(
        `\n↩️  RLS rolled back on ${RLS_TABLES.length} tables. (App role and grants left intact.)`
    );
    await admin.$disconnect();
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("❌ disable-rls failed:", e);
        process.exit(1);
    });
