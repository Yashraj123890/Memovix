import { AIConfig } from "../config/ai.config";
import { AIHttpClient } from "../config/http-client";
import { wrapAiError } from "../ai-error";
import { EmbeddingRequest, EmbeddingResult } from "../types/embedding.types";

import { EmbeddingProvider } from "./embedding.provider";

interface GeminiEmbeddingResponse {
  embedding?: { values?: number[] };
}

/** Hosted Gemini embeddings, fixed to the pgvector dimension used by Memovix. */
export class GeminiEmbeddingProvider implements EmbeddingProvider {
  async generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResult> {
    if (!AIConfig.gemini.apiKey) {
      throw new Error("GEMINI_API_KEY is required when EMBEDDING_PROVIDER=gemini.");
    }

    try {
      const model = AIConfig.gemini.embeddingModel;
      const response = await AIHttpClient.post<GeminiEmbeddingResponse>(
        `${AIConfig.gemini.baseUrl}/models/${model}:embedContent`,
        {
          model: `models/${model}`,
          content: { parts: [{ text: request.text }] },
          output_dimensionality: AIConfig.embeddingDimension,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": AIConfig.gemini.apiKey,
          },
        },
      );

      const embedding = response.data.embedding?.values;
      if (!embedding || embedding.length !== AIConfig.embeddingDimension) {
        throw new Error(
          `Gemini returned ${embedding?.length ?? 0} dimensions; expected ${AIConfig.embeddingDimension}.`,
        );
      }

      return { embedding, model };
    } catch (error) {
      throw wrapAiError(error);
    }
  }
}
