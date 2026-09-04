import { EmbeddingRequest, EmbeddingResult } from "../types/embedding.types";

export interface EmbeddingProvider {
  generateEmbedding(
    request: EmbeddingRequest
  ): Promise<EmbeddingResult>;
}