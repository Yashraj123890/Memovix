import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Passed through to the underlying Spinner's screen-reader label. */
  label?: string;
}

/**
 * Business-independent full-section loading placeholder (see
 * docs/component-guidelines.md "Shared Components"). Prefer skeletons for
 * content that has a known shape; use this for boundary-level states where
 * there's nothing to lay out yet — e.g. the auth route guards deciding
 * whether a session is valid.
 */
function LoadingState({ className, label = "Loading", ...props }: LoadingStateProps) {
  return (
    <div
      className={cn("flex flex-1 items-center justify-center py-16", className)}
      {...props}
    >
      <Spinner size="lg" label={label} />
    </div>
  );
}

export { LoadingState };
