import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { RLS_TABLES, POLICY_NAME, policyExpr } from "./policies";

/**
 * Idempotent: enable Row-Level Security on every tenant-owned table and (re)create
 * the `tenant_isolation` policy (blueprint §3.1.2 — second enforcement layer).
 *
 * Runs as the ADMIN/owner role (DATABASE_URL = neondb_owner) — NOT the runtime
 * app role — because ALTER TABLE / CREATE POLICY / GRANT require ownership.
 * Re-runnable: ENABLE/FORCE are no-ops when already set, and each policy is
 * DROP …​ IF EXISTS then CREATE. Grants are idempotent.
 *
 *   npm run db:rls:enable
 */

const APP_ROLE = process.env.RLS_APP_ROLE ?? "memovix_app";

async function main() {
    const admin = new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL } },
    });

    // 0. Ensure the least-privilege runtime role has the DML grants it needs.
    const exists = await admin.$queryRawUnsafe<{ n: number }[]>(
        `SELECT count(*)::int AS n FROM pg_roles WHERE rolname = '${APP_ROLE}'`
    );
    if (!exists[0]?.n) {
        throw new Error(
            `Role "${APP_ROLE}" does not exist — provision it (Step 2B) before enabling RLS.`
        );
    }
    for (const stmt of [
        `GRANT USAGE ON SCHEMA public TO "${APP_ROLE}"`,
        `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${APP_ROLE}"`,
        `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "${APP_ROLE}"`,
        `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${APP_ROLE}"`,
        `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO "${APP_ROLE}"`,
    ]) {
        await admin.$executeRawUnsafe(stmt);
    }
    console.log(`✅ least-privilege grants ensured for "${APP_ROLE}"`);

    // 1. Enable + FORCE RLS and (re)create the tenant-isolation policy per table.
    //    FORCE is belt-and-suspenders: the runtime app role is a non-owner (so RLS
    //    applies without it), but FORCE also constrains any future non-BYPASSRLS
    //    owner connection.
    for (const t of RLS_TABLES) {
        await admin.$executeRawUnsafe(`ALTER TABLE ${t.table} ENABLE ROW LEVEL SECURITY`);
        await admin.$executeRawUnsafe(`ALTER TABLE ${t.table} FORCE ROW LEVEL SECURITY`);
        await admin.$executeRawUnsafe(`DROP POLICY IF EXISTS "${POLICY_NAME}" ON ${t.table}`);
        const expr = policyExpr(t);
        await admin.$executeRawUnsafe(
            `CREATE POLICY "${POLICY_NAME}" ON ${t.table} FOR ALL USING (${expr}) WITH CHECK (${expr})`
        );
        console.log(`✅ ${t.table}  [${t.mode}]  (${t.derivation})`);
    }

    console.log(`\n✅ RLS enabled on ${RLS_TABLES.length} tables. Runtime role: ${APP_ROLE}`);
    await admin.$disconnect();
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("❌ enable-rls failed:", e);
        process.exit(1);
    });
