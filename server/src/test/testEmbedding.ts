import { ProviderFactory } from "../ai/factory/provider.factory";

async function main() {
  const provider = ProviderFactory.getEmbeddingProvider();

  const result = await provider.generateEmbedding({
    text: "Memovix AI Memory Search",
  });

  console.log(result.model);
  console.log(result.embedding.length);
}

main();