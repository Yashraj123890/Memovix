import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { AIConfig } from "../ai/config/ai.config";

/**
 * One-time (idempotent) setup for the searchable_chunks vector column (Unified
 * Retrieval phase — P0).
 *
 * `prisma db push` creates the `embedding` column as an untyped `vector`
 * (Prisma can't express a pgvector dimension or index). This script sets the
 * dimension from AIConfig.embeddingDimension and adds the HNSW cosine index so
 * the future unified retriever queries it with the `<=>` operator via an ANN
 * index rather than a sequential scan. Safe to re-run.
 *
 * IMPORTANT: DDL requires the TABLE OWNER, so this uses a dedicated connection
 * on DATABASE_URL (neondb_owner), NOT the shared ../lib/prisma client (which
 * runs as the least-privilege `memovix_app` role and cannot alter/index a table
 * it doesn't own — 42501 "must be owner of table").
 *
 * Run after every `db push` that (re)creates the table:
 *   npm run db:init-searchable-vector
 */
const admin = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
  log: ["error"],
});

async function main() {
  const dimension = AIConfig.embeddingDimension;

  if (!Number.isInteger(dimension) || dimension <= 0) {
    throw new Error(`Invalid EMBEDDING_DIMENSION: ${dimension}`);
  }

  // Fixed-dimension vector (required before an HNSW index can be built).
  await admin.$executeRawUnsafe(
    `ALTER TABLE "searchable_chunks" ALTER COLUMN "embedding" TYPE vector(${dimension});`,
  );

  // Approximate-nearest-neighbour index for cosine distance (<=> operator).
  await admin.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "searchable_chunks_embedding_hnsw" ON "searchable_chunks" USING hnsw ("embedding" vector_cosine_ops);`,
  );

  console.log(
    `✅ searchable_chunks.embedding set to vector(${dimension}) with HNSW cosine index.`,
  );
}

main()
  .then(async () => {
    await admin.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("❌ Failed to initialize searchable_chunks vector column.");
    console.error(error);
    await admin.$disconnect();
    process.exit(1);
  });
