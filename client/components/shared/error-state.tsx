import * as React from "react";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

/**
 * Business-independent — per docs/component-guidelines.md "Shared
 * Components". Mirrors EmptyState's layout so the two states never look
 * out of place next to each other. Per docs/api-notes.md "Error Handling"
 * / docs/design-system.md "Error States", this only ever shows the
 * user-facing message from utils/error.ts — never a raw error/stack trace.
 */
function ErrorState({
  className,
  title = "Something went wrong",
  description = "We couldn't load this. Please try again.",
  onRetry,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center",
        className,
      )}
      {...props}
    >
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <AlertCircleIcon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground text-sm font-semibold">{title}</h3>
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}

export { ErrorState };
