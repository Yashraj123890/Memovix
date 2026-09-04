import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Element to render as, e.g. "main" for the page's primary landmark. */
  as?: React.ElementType;
}

/**
 * Shared page-level content wrapper: full available width with responsive
 * horizontal padding (never touching the edges). Content spans the space between
 * the global sidebar and the right edge rather than a narrow centered column.
 * Business-independent — belongs in components/shared, not components/ui,
 * because it's a layout composition rather than a single UI primitive.
 * A page that wants a narrower reading measure can still pass a `max-w-*` via
 * `className` (tailwind-merge lets it override the full-width default).
 */
function PageContainer({
  className,
  as: Component = "div",
  ...props
}: PageContainerProps) {
  return (
    <Component
      className={cn(
        "flex w-full max-w-none flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}

export { PageContainer };
