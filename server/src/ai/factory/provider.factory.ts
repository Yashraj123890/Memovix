import { AIConfig } from "../config/ai.config";
import { EmbeddingProvider } from "../providers/embedding.provider";
import { OllamaProvider } from "../providers/ollama.provider";
import { OpenAIProvider } from "../providers/openai.provider";
import { ChatProvider } from "../providers/chat.provider";
import { GroqProvider } from "../providers/groq.provider";
import { GeminiEmbeddingProvider } from "../providers/gemini-embedding.provider";

export class ProviderFactory {
  private static embeddingProvider: EmbeddingProvider;
  private static chatProvider: ChatProvider;

  static getEmbeddingProvider(): EmbeddingProvider {
    if (!this.embeddingProvider) {
      switch (AIConfig.embeddingProvider) {
        case "gemini":
          this.embeddingProvider = new GeminiEmbeddingProvider();
          break;

        case "openai":
          this.embeddingProvider = new OpenAIProvider();
          break;

        case "ollama":
        default:
          this.embeddingProvider = new OllamaProvider();
          break;
      }
    }

    return this.embeddingProvider;
  }

  static getChatProvider(): ChatProvider {
    if (!this.chatProvider) {
      switch (AIConfig.chatProvider) {
        case "groq":
          this.chatProvider = new GroqProvider();
          break;

        case "openai":
          this.chatProvider = new OpenAIProvider();
          break;

        case "ollama":
        default:
          this.chatProvider = new OllamaProvider();
          break;
      }
    }

    return this.chatProvider;
  }
}
