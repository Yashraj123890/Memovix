import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0-100. Values outside that range are clamped. */
  value: number;
}

/**
 * Plain div-based progress bar, no Radix needed — purely visual, no
 * interaction, consistent with how Avatar/Separator/Spinner were built.
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("bg-muted h-2 w-full overflow-hidden rounded-full", className)}
        {...props}
      >
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };
