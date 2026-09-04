import * as React from "react";
import { renderMarkdown } from "@/features/ai-workspace/utils/parse-markdown";
import { cn } from "@/lib/utils";

interface MarkdownReportProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string;
}

/**
 * Renders an AI-generated markdown report (summary/requirements/comparison/
 * scope) via the hand-rolled parser in utils/parse-markdown — see that
 * file's header comment for why this isn't react-markdown. Scrollable up to
 * a max height so long reports stay inside their card instead of pushing
 * the rest of the panel (Copy/Regenerate buttons) off screen.
 */
export function MarkdownReport({ content, className, ...props }: MarkdownReportProps) {
  return (
    <div
      className={cn("max-h-[28rem] overflow-y-auto rounded-lg border border-border/60 bg-muted/20 p-4", className)}
      {...props}
    >
      {renderMarkdown(content)}
    </div>
  );
}
