import { AIService } from "../services/ai.service";

async function main() {
  const ai = new AIService();

  const result = await ai.generateEmbedding(
    "Memovix Project Memory"
  );

  console.log(result.model);
  console.log(result.embedding.length);
}

main();