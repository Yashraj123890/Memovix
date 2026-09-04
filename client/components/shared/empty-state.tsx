import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Typically a <Button>. */
  action?: React.ReactNode;
}

/**
 * Business-independent — per docs/component-guidelines.md ("Shared
 * Components") this lives outside components/ui because it composes
 * layout + typography rather than being a single primitive, but it has
 * no feature-specific logic of its own.
 *
 * Per docs/product-principles.md "Empty States": every empty state should
 * explain what happened and suggest a next action — hence title,
 * description, and action are all first-class props here rather than
 * being left to each caller to remember.
 */
function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center",
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground text-sm font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground max-w-sm text-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export { EmptyState };
