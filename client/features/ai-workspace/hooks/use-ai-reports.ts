"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { aiService } from "@/services/api/ai.service";
import { getErrorMessage } from "@/utils/error";
import type { AiReportKind } from "@/types/ai";

/**
 * On-demand AI report generator. Requirement extraction, comparison and scope
 * analysis were removed with the AI Workspace prototype (that territory now
 * lives in the dedicated Requirements tab), leaving Summary as the single
 * report kind — a markdown string generated on demand via a mutation (not a
 * cacheable query), whose `data` survives between calls so the panel keeps the
 * previous result while regenerating.
 */
const REPORT_FETCHERS: Record<
  AiReportKind,
  (args: { projectId: string; projectName: string }) => Promise<string>
> = {
  summary: async ({ projectId, projectName }) =>
    (await aiService.generateSummary({ projectId, projectName })).summary,
};

const SUCCESS_MESSAGES: Record<AiReportKind, string> = {
  summary: "Summary generated",
};

interface UseAiReportsOptions {
  projectId: string;
  projectName: string;
  kind: AiReportKind;
}

export function useAiReports({
  projectId,
  projectName,
  kind,
}: UseAiReportsOptions) {
  const mutation = useMutation({
    mutationFn: () => REPORT_FETCHERS[kind]({ projectId, projectName }),
    onSuccess: () => toast.success(SUCCESS_MESSAGES[kind]),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return {
    content: mutation.data,
    generate: () => mutation.mutate(),
    isLoading: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.error ? getErrorMessage(mutation.error) : undefined,
  };
}
