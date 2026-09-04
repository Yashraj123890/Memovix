import { EmbeddingWorkflow } from "../ai/workflows/embedding.workflow";

export class AIService {
  private embeddingWorkflow = new EmbeddingWorkflow();

  async generateEmbedding(text: string) {
    return this.embeddingWorkflow.generate(text);
  }
}