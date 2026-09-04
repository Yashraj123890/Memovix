export interface EmbeddingResult {
  embedding: number[];
  model: string;
}

export interface EmbeddingRequest {
  text: string;
}