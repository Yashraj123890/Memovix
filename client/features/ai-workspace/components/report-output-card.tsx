"use client";

import * as React from "react";
import { RefreshCwIcon, SparklesIcon } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FadeIn } from "@/components/motion/fade-in";
import { CopyButton } from "@/features/ai-workspace/components/copy-button";
import { MarkdownReport } from "@/features/ai-workspace/components/markdown-report";
import { AiIconChip } from "@/features/ai-workspace/components/ai-icon-chip";

export interface ReportOutputCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  content?: string;
  onGenerate: () => void;
  generateLabel: string;
  regenerateLabel?: string;
  /** Disables the header action — e.g. Comparison/Scope before a requirement is typed. */
  generateDisabled?: boolean;
  /** Rendered between the header and the report body — e.g. scope classification badges. */
  extra?: React.ReactNode;
  /** Overrides the default MarkdownReport rendering — e.g. Comparison's color-coded sections. */
  renderContent?: (content: string) => React.ReactNode;
}

/**
 * Shared "AI report card" shell used by Summary, Requirements, Comparison
 * and Scope — the four features whose backend response is a single
 * markdown string generated on demand (see server/src/ai/workflows/*).
 * Owns every visual state the UX spec calls for: skeleton while
 * generating, error with retry, empty state before the first generation,
 * and the report itself with Copy + Regenerate — while always preserving
 * the last successful `content` on screen during a regenerate instead of
 * flashing back to a skeleton.
 */
export function ReportOutputCard({
  icon,
  title,
  description,
  emptyTitle,
  emptyDescription,
  isLoading,
  isError,
  errorMessage,
  content,
  onGenerate,
  generateLabel,
  regenerateLabel = "Regenerate",
  generateDisabled = false,
  extra,
  renderContent,
}: ReportOutputCardProps) {
  const hasContent = Boolean(content);

  return (
    <Card className="from-primary/5 via-card to-card gap-0 bg-gradient-to-br">
      <CardHeader className="border-border/60 gap-4 border-b pb-5">
        <div className="flex items-center gap-2.5">
          <AiIconChip icon={icon} />
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <CardAction className="flex items-center gap-2">
          {hasContent && <CopyButton text={content ?? ""} />}
          <Button
            type="button"
            size="sm"
            variant={hasContent ? "outline" : "default"}
            loading={isLoading}
            disabled={generateDisabled}
            onClick={onGenerate}
            className="gap-1.5"
          >
            {hasContent ? (
              <RefreshCwIcon className="size-3.5" aria-hidden="true" />
            ) : (
              <SparklesIcon className="size-3.5" aria-hidden="true" />
            )}
            {hasContent ? regenerateLabel : generateLabel}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-5" aria-live="polite">
        {isLoading && !hasContent ? (
          <div className="flex flex-col gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="mt-2 h-4 w-1/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ) : isError && !hasContent ? (
          <ErrorState
            description={errorMessage ?? "We couldn't generate this. Please try again."}
            onRetry={onGenerate}
          />
        ) : hasContent ? (
          <FadeIn className="flex flex-col gap-3">
            {isLoading && (
              <Badge variant="secondary" className="w-fit gap-1.5">
                <RefreshCwIcon className="size-3 animate-spin" aria-hidden="true" />
                Regenerating…
              </Badge>
            )}
            {extra}
            {renderContent ? (
              <div className="max-h-[28rem] overflow-y-auto rounded-lg">{renderContent(content ?? "")}</div>
            ) : (
              <MarkdownReport content={content ?? ""} />
            )}
          </FadeIn>
        ) : (
          <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
        )}
      </CardContent>
    </Card>
  );
}
