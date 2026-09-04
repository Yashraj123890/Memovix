import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "size-4",
  default: "size-5",
  lg: "size-8",
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof SIZE_CLASSES;
  /** Screen-reader-only text describing what is loading. */
  label?: string;
}

/**
 * For small/inline loading (buttons, cards, sections). Per
 * docs/design-system.md, full-page loading should prefer skeleton
 * placeholders over a spinner where possible.
 */
function Spinner({
  className,
  size = "default",
  label = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <Loader2Icon
        className={cn(
          "text-muted-foreground animate-spin",
          SIZE_CLASSES[size],
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export { Spinner };
