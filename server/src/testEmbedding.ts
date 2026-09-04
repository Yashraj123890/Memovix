import "dotenv/config";
import { AIService } from "./services/ai.service";

async function main() {
  console.log(process.env.OPENAI_API_KEY);

  const ai = new AIService();

  const result = await ai.generateEmbedding(
    "JWT Authentication\nUsers log in using JWT tokens."
  );

  console.log("Embedding length:", result.embedding.length);

  console.log("First 10 values:");

  console.log(result.embedding.slice(0, 10));

  console.log("Model:", result.model);
}

main();