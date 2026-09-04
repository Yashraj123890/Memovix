import * as React from "react";
import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

/**
 * Native <label>, not a Radix primitive — a plain, correctly-associated
 * (via htmlFor) label is already fully accessible on its own. Pair with a
 * `peer` class on the associated control to pick up the disabled styling
 * below.
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm leading-none font-medium select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = "Label";

export { Label };
