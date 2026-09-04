import { ProviderFactory } from "../factory/provider.factory";
import { buildSummaryPrompt } from "../prompts/summary.prompt";
import { ragRetrievalWorkflow } from "./rag-retrieval.workflow";
import { sourceLabel } from "../retrieval/citation";

export interface SummaryWorkflowInput {
  projectId: string;
  projectName: string;
}

export interface SummaryWorkflowResponse {
  summary: string;
}

/** Per-source excerpt length + output cap so the local CPU model stays under the backend timeout. */
const SUMMARY_SOURCE_CHARS = 500;
const SUMMARY_MAX_OUTPUT_TOKENS = 700;

export class SummaryWorkflow {
  private provider = ProviderFactory.getChatProvider();

  async execute(
    input: SummaryWorkflowInput
  ): Promise<SummaryWorkflowResponse> {
    const { projectId, projectName } = input;

    if (!projectId) {
      throw new Error("Project ID is required.");
    }

    if (!projectName) {
      throw new Error("Project name is required.");
    }

    // P3: summarize over the UNIFIED index — the top project content across every
    // type (memories, documents, requirements, decisions, meeting notes,
    // deliverables, comments), not memories alone. maxDistance is relaxed so this
    // gathers a representative top-N by the project name, matching the previous
    // "top 20" behavior rather than applying a strict similarity cutoff.
    const items = await ragRetrievalWorkflow.retrieve(projectId, projectName, {
      limit: 20,
      maxDistance: 2,
      strictRelevance: false,
    });

    // Bound each source to a snippet: the unified index now includes long
    // document chunks, and feeding 20 of them in full ballooned the prompt past
    // what the local CPU model can summarize inside the backend timeout. A short
    // excerpt per source is enough to summarize from.
    const context = items
      .map((item) => `${sourceLabel(item)}:\n${item.content.slice(0, SUMMARY_SOURCE_CHARS)}`)
      .join("\n------------------------\n");

    const prompt = buildSummaryPrompt({
      projectName,
      context,
    });

    const response = await this.provider.generateResponse({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      // Bound generation so a summary can't run past the backend timeout.
      options: { num_predict: SUMMARY_MAX_OUTPUT_TOKENS },
    });

    return {
      summary: response.message,
    };
  }
}

export const summaryWorkflow = new SummaryWorkflow();
