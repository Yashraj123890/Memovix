import "dotenv/config";
import { PrismaClient } from "@prisma/client";

import { runWithTenantContext } from "../lib/tenant-context";
import searchableIndexService from "../services/searchableIndex.service";

/**
 * Backfill / rebuild the Unified Retrieval index (phase P1). Populates
 * searchable_chunks from every existing source row across all projects.
 * Idempotent — replaceBySource makes each source's chunks all-or-nothing, so a
 * re-run refreshes rather than duplicates.
 *
 * Cross-tenant, but RLS-correct: an ADMIN connection (DATABASE_URL) enumerates
 * the projects + their tenant (bypassing RLS just for the census), then each
 * project is indexed inside runWithTenantContext(tenantId) so the shared
 * app-role client reads/writes exactly that tenant's rows under RLS — the same
 * path the runtime hooks use.
 *
 *   npm run db:reindex-searchable
 */
const admin = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  log: ["error"],
});

interface ProjectRow {
  id: string;
  tenantId: string;
  name: string;
}

/**
 * Retry transient Neon transaction errors ("Unable to start a transaction in the
 * given time" / "Transaction not found") — the backfill fires many interactive
 * transactions in tight succession and the serverless pool occasionally can't
 * start one in time. Idempotent (replaceBySource), so a retry is safe. Runtime
 * hooks do a single transaction per request and never hit this.
 */
async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const transient = /transaction/i.test(message);
      if (!transient || attempt === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 750 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function main() {
  const projects: ProjectRow[] = await admin.$queryRawUnsafe(
    `SELECT "id", "tenantId", "name" FROM "projects" ORDER BY "createdAt" ASC`,
  );
  console.log(`Reindexing ${projects.length} project(s) into searchable_chunks...\n`);

  const totals: Record<string, number> = {};
  let failed = 0;

  for (const project of projects) {
    try {
      const summary = await withRetry(() =>
        runWithTenantContext({ tenantId: project.tenantId }, () =>
          searchableIndexService.indexProject(project.id),
        ),
      );
      for (const [type, count] of Object.entries(summary)) {
        totals[type] = (totals[type] ?? 0) + count;
      }
      const written = Object.values(summary).reduce((a, b) => a + b, 0);
      console.log(`  ✓ ${project.name} (${project.id}): ${written} chunks ${JSON.stringify(summary)}`);
    } catch (error) {
      failed += 1;
      console.error(
        `  ✗ ${project.name} (${project.id}): ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  console.log(`\nDone. totals by source type: ${JSON.stringify(totals)}; failed projects: ${failed}.`);
}

main()
  .then(async () => {
    await admin.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("❌ Reindex failed:", error);
    await admin.$disconnect();
    process.exit(1);
  });
