import { FileTextIcon } from "lucide-react";
import { ReportOutputCard } from "@/features/ai-workspace/components/report-output-card";

interface SummaryPanelProps {
  content?: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onGenerate: () => void;
}

/**
 * Purely presentational — the useAiReports("summary") instance and its
 * mutation state live in ai-workspace-tabs.tsx (lifted up so the "Generate
 * Summary" quick action can trigger the same generation this panel
 * displays), per the project's UI/business-logic separation rule.
 */
export function SummaryPanel({ content, isLoading, isError, errorMessage, onGenerate }: SummaryPanelProps) {
  return (
    <ReportOutputCard
      icon={<FileTextIcon className="size-4" aria-hidden="true" />}
      title="Project Summary"
      description="A concise, professional recap generated from this project's memory."
      emptyTitle="Generate a project summary."
      emptyDescription="Covers the project overview, key features, progress, decisions and open risks."
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      content={content}
      onGenerate={onGenerate}
      generateLabel="Generate Summary"
    />
  );
}
