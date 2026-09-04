import { ProviderFactory } from "../factory/provider.factory";

export class EmbeddingWorkflow {
  private provider = ProviderFactory.getEmbeddingProvider();

  async generate(text: string) {
    return this.provider.generateEmbedding({
      text,
    });
  }
}