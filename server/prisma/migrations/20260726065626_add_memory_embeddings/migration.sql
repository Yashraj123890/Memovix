CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable

CREATE TABLE "MemoryEmbedding" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemoryEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemoryEmbedding_memoryId_key"
ON "MemoryEmbedding"("memoryId");

-- AddForeignKey
ALTER TABLE "MemoryEmbedding"
ADD CONSTRAINT "MemoryEmbedding_memoryId_fkey"
FOREIGN KEY ("memoryId")
REFERENCES "memories"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;