import { FileIngestStatus, SearchableSourceType } from "@prisma/client";

import { ProjectFileRepository } from "../../repositories/project-file.repository";
import documentChunkRepository from "../../repositories/document-chunk.repository";
import searchableIndexService from "../../services/searchableIndex.service";
import { S3StorageProvider } from "../../storage";

import { extractText } from "./text-extraction";
import { chunkText } from "./chunking";
import { EmbeddingWorkflow } from "../workflows/embedding.workflow";

export interface IngestionResult {
    status: FileIngestStatus;
    chunkCount: number;
    reason?: string;
}

/**
 * Synchronous document ingestion pipeline (blueprint §8.1–8.5):
 *   download -> extract -> chunk -> embed -> store DocumentChunks -> INDEXED.
 *
 * Milestone 5 runs this inline (no background queue yet, by design). It never
 * throws for content/processing problems — every outcome is recorded on the
 * file's ingestStatus so an upload/reindex request always completes:
 *   - unsupported format (image, etc.) -> SKIPPED
 *   - supported but no extractable text -> SKIPPED
 *   - extraction/embedding/storage error -> FAILED (+ ingestError)
 *   - chunks stored -> INDEXED
 * (The only throw is an unknown fileId, before processing starts.)
 */
export class IngestionWorkflow {
    private fileRepository = new ProjectFileRepository();
    private storage = new S3StorageProvider();
    private embeddingWorkflow = new EmbeddingWorkflow();

    async processFile(fileId: string): Promise<IngestionResult> {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new Error("File not found");
        }

        await this.fileRepository.updateIngestStatus(fileId, FileIngestStatus.PROCESSING, null);

        try {
            const buffer = await this.storage.download(file.storageKey);
            const extraction = await extractText(buffer, file.mimeType, file.originalName);

            if (!extraction.supported) {
                await documentChunkRepository.deleteByFile(fileId);
                await this.fileRepository.updateIngestStatus(
                    fileId,
                    FileIngestStatus.SKIPPED,
                    extraction.reason
                );
                await searchableIndexService.removeSafe(SearchableSourceType.DOCUMENT, fileId);
                return { status: FileIngestStatus.SKIPPED, chunkCount: 0, reason: extraction.reason };
            }

            const chunks = chunkText(extraction.text);

            if (chunks.length === 0) {
                await documentChunkRepository.deleteByFile(fileId);
                await this.fileRepository.updateIngestStatus(
                    fileId,
                    FileIngestStatus.SKIPPED,
                    "No extractable text"
                );
                await searchableIndexService.removeSafe(SearchableSourceType.DOCUMENT, fileId);
                return { status: FileIngestStatus.SKIPPED, chunkCount: 0, reason: "No extractable text" };
            }

            // Embed each chunk (sequential — the provider has no batch endpoint).
            const rows = [];
            for (const chunk of chunks) {
                const { embedding } = await this.embeddingWorkflow.generate(chunk.content);
                rows.push({ ...chunk, embedding });
            }

            await documentChunkRepository.replaceChunks(fileId, file.projectId, rows);
            await this.fileRepository.updateIngestStatus(fileId, FileIngestStatus.INDEXED, null);

            // Mirror the freshly embedded chunks into the unified retrieval
            // index without embedding the same document text a second time.
            await searchableIndexService.syncPreparedSafe(
                file.projectId,
                SearchableSourceType.DOCUMENT,
                fileId,
                rows.map((row) => ({
                    chunkIndex: row.chunkIndex,
                    content: row.content,
                    metadata: { fileName: file.originalName },
                    embedding: row.embedding,
                })),
            );

            return { status: FileIngestStatus.INDEXED, chunkCount: rows.length };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Ingestion failed";
            await this.fileRepository.updateIngestStatus(
                fileId,
                FileIngestStatus.FAILED,
                message.slice(0, 1000)
            );
            return { status: FileIngestStatus.FAILED, chunkCount: 0, reason: message };
        }
    }
}

export const ingestionWorkflow = new IngestionWorkflow();
