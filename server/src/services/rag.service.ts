import { chatWorkflow } from "../ai/workflows/chat.workflow";

class RAGService {
  async ask(projectId: string, question: string) {
    return chatWorkflow.execute({ projectId, question });
  }

  /** Streaming variant — returns citations/confidence plus a token stream. */
  async askStream(projectId: string, question: string) {
    return chatWorkflow.streamAnswer({ projectId, question });
  }
}

export default new RAGService();
