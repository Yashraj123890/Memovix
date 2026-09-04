import { buildChatPrompt } from "../prompts/chat.prompt";
import { ProviderFactory } from "../factory/provider.factory";
import { ragRetrievalWorkflow } from "./rag-retrieval.workflow";
import {
  UnifiedCitation,
  dedupeCitations,
  groupRetrievedSources,
  sourceLabel,
} from "../retrieval/citation";
import { assessCitations } from "../citation-check";

export interface ChatWorkflowInput {
  projectId: string;
  question: string;
}

/**
 * Chat citation (P2): unified across every project content type. `sourceType` +
 * `sourceId` let the frontend deep-link; `label` is the display name and `score`
 * is 1 - distance.
 */
export type ChatWorkflowSource = UnifiedCitation;

export interface ChatWorkflowResponse {
  answer: string;
  sources: ChatWorkflowSource[];
  confidence: number;
  /** True when the model returned a non-fallback answer with no [Source: N] citation. */
  uncited: boolean;
}

/** Retrieval output shared by the one-shot and streaming paths. */
interface GroundedContext {
  prompt: string;
  sources: ChatWorkflowSource[];
  confidence: number;
}

export interface ChatStreamResult {
  sources: ChatWorkflowSource[];
  confidence: number;
  /** Answer token deltas, streamed from the LLM. */
  stream: AsyncIterable<string>;
}

export class ChatWorkflow {
  private provider = ProviderFactory.getChatProvider();

  /**
   * Shared RAG step: retrieve project-scoped context from the unified index,
   * build the grounded prompt, and derive citations + confidence. Used by both
   * `execute` (one-shot) and `streamAnswer` (SSE), so the grounding logic never
   * drifts between them.
   */
  private async ground(input: ChatWorkflowInput): Promise<GroundedContext> {
    const { projectId, question } = input;

    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    if (!question.trim()) {
      throw new Error("Question is required.");
    }

    const retrievedItems = await ragRetrievalWorkflow.retrieve(projectId, question);
    const items = groupRetrievedSources(retrievedItems);

    const context = items
      .map((item, index) => {
        const suffix =
          item.chunkIndex > 0 ? ` (part ${item.chunkIndex + 1})` : "";
        return `Source ${index + 1} [${sourceLabel(item)}${suffix}]\n${item.content}`;
      })
      .join("\n------------------------\n");

    return {
      prompt: buildChatPrompt({ question, context }),
      sources: dedupeCitations(items),
      confidence: items.length > 0 ? Number((1 - items[0].distance).toFixed(2)) : 0,
    };
  }

  async execute(input: ChatWorkflowInput): Promise<ChatWorkflowResponse> {
    const { prompt, sources, confidence } = await this.ground(input);

    const response = await this.provider.generateResponse({
      messages: [{ role: "user", content: prompt }],
    });

    const answer = response.message;
    const assessment = assessCitations(answer, confidence);
    if (assessment.uncited) {
      console.warn(
        `[ChatWorkflow] Uncited answer (model omitted [Source: N]) for project ${input.projectId}: "${input.question.slice(0, 80)}"`,
      );
    }

    return {
      answer,
      sources,
      confidence: assessment.confidence,
      uncited: assessment.uncited,
    };
  }

  /**
   * Streaming variant (blueprint §8.8). Grounding (retrieval) happens up front
   * so `sources`/`confidence` are known before the first token — the caller can
   * emit citations immediately, then stream the answer.
   */
  async streamAnswer(input: ChatWorkflowInput): Promise<ChatStreamResult> {
    const { prompt, sources, confidence } = await this.ground(input);

    const stream = this.provider.streamResponse({
      messages: [{ role: "user", content: prompt }],
    });

    return { sources, confidence, stream };
  }
}

export const chatWorkflow = new ChatWorkflow();
