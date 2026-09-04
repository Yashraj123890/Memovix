const EMBEDDING_MAX_TOKENS = Number(process.env.EMBEDDING_MAX_TOKENS) || 2048;

const REQUESTED_CHUNK_SIZE = Number(process.env.RAG_CHUNK_SIZE) || 500;

// Clamp so a chunk can never be larger than the embedding model can encode.
const CHUNK_SIZE = Math.min(REQUESTED_CHUNK_SIZE, EMBEDDING_MAX_TOKENS);

if (REQUESTED_CHUNK_SIZE > EMBEDDING_MAX_TOKENS) {
  console.warn(
    `[AIConfig] RAG_CHUNK_SIZE (${REQUESTED_CHUNK_SIZE}) exceeds EMBEDDING_MAX_TOKENS ` +
      `(${EMBEDDING_MAX_TOKENS}); clamping chunk size to ${CHUNK_SIZE} to keep chunks embeddable.`,
  );
}

export const AIConfig = {
  provider: process.env.AI_PROVIDER || "ollama",
  chatProvider:
    process.env.CHAT_PROVIDER || process.env.AI_PROVIDER || "ollama",
  embeddingProvider:
    process.env.EMBEDDING_PROVIDER || process.env.AI_PROVIDER || "ollama",

  ollama: {
    url: process.env.OLLAMA_URL || "http://localhost:11434",
    embeddingModel:
      process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
    chatModel:
      process.env.OLLAMA_CHAT_MODEL || "llama3.1:8b",
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    embeddingModel:
      process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    chatModel:
      process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini",
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    baseUrl:
      process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
    chatModel:
      process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-20b",
    reasoningEffort:
      process.env.GROQ_REASONING_EFFORT || "low",
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    baseUrl:
      process.env.GEMINI_BASE_URL ||
      "https://generativelanguage.googleapis.com/v1beta",
    embeddingModel:
      process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2",
  },

  /**
   * Embedding vector dimension. MUST match the output size of the configured
   * embedding model (Ollama nomic-embed-text and configured Gemini output =
   * 768, matching the existing vector columns). Drives the pgvector dimension for
   * document_chunks. Env-overridable to avoid a magic number; changing it
   * requires re-creating the column and re-embedding.
   */
  embeddingDimension: Number(process.env.EMBEDDING_DIMENSION) || 768,

  /**
   * Embedding model context window in tokens (nomic-embed-text ≈ 2048).
   * chunkSize is clamped to this below so a chunk can never exceed what the
   * embedding model can encode (an over-long chunk fails to embed).
   */
  embeddingMaxTokens: EMBEDDING_MAX_TOKENS,

  /**
   * RAG chunking parameters (blueprint §8.4), expressed in tokens and
   * env-overridable. The chunker approximates ~4 characters per token when
   * turning these into character windows. chunkSize is clamped to
   * embeddingMaxTokens at startup.
   */
  chunkSize: CHUNK_SIZE,
  chunkOverlap: Number(process.env.RAG_CHUNK_OVERLAP) || 50,

  /**
   * Retrieval parameters (blueprint §8.7), env-overridable.
   * - ragTopK: how many combined (memory + document) results feed the LLM.
   * - ragMaxDistance: cosine-distance cutoff (pgvector <=>, range 0..2; lower =
   *   more similar). Default is lenient to preserve existing chat recall;
   *   lower it (e.g. 0.7) for stricter grounding.
   */
  ragTopK: Number(process.env.RAG_TOP_K) || 8,
  ragMaxDistance: Number(process.env.RAG_MAX_DISTANCE) || 1.0,

  /**
   * Meeting-extraction (Meeting Notes v2) — the single combined
   * summary+decisions+action-items generation. Runs in a detached background
   * job, so its timeout is deliberately well above the 120s inline default:
   * Phase 0 measured ~138s for a ~7-min meeting on the local CPU model
   * (llama3.2:3b). `maxOutputTokens` caps generation (summary + a handful of
   * decisions/action items fit comfortably). Both env-overridable so a GPU or
   * hosted-LLM swap can retune without code changes.
   */
  meetingExtraction: {
    timeoutMs: Number(process.env.MEETING_EXTRACTION_TIMEOUT_MS) || 300000,
    maxOutputTokens: Number(process.env.MEETING_EXTRACTION_MAX_TOKENS) || 1024,
  },
} as const;
