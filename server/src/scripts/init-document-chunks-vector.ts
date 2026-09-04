import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { AIConfig } from "../ai/config/ai.config";

/**
 * One-time (idempotent) setup for the document_chunks vector column.
 *
 * `prisma db push` creates the `embedding` column as an untyped `vector`
 * (Prisma can't express a pgvector dimension or index). This script sets the
 * dimension from AIConfig.embeddingDimension (env-driven, no magic number) and
 * adds the HNSW cosine index. Safe to re-run.
 *
 * IMPORTANT: this is DDL, which requires the TABLE OWNER. It therefore uses a
 * dedicated connection on DATABASE_URL (neondb_owner) rather than the shared
 * ../lib/prisma client, which runs as the least-privilege `memovix_app` role
 * (subject to RLS, NOT a table owner) — under that role the ALTER/CREATE INDEX
 * fails with "must be owner of table" (42501). This is why the index was
 * previously missing.
 *
 * Run after every `db push` that (re)creates the table:
 *   npm run db:init-vectors
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

  // Set the column to a fixed dimension (required before an HNSW index exists).
  await admin.$executeRawUnsafe(
    `ALTER TABLE "document_chunks" ALTER COLUMN "embedding" TYPE vector(${dimension});`,
  );

  // Approximate-nearest-neighbour index for cosine distance (<=> operator).
  await admin.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "document_chunks_embedding_hnsw" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);`,
  );

  console.log(
    `✅ document_chunks.embedding set to vector(${dimension}) with HNSW cosine index.`,
  );
}

main()
  .then(async () => {
    await admin.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("❌ Failed to initialize document_chunks vector column.");
    console.error(error);
    await admin.$disconnect();
    process.exit(1);
  });
