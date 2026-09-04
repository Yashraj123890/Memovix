import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Base text input. Composing this with Label + a helper/error message is
 * left to feature-level form components (see docs/coding-standards.md
 * "Forms") — this primitive only owns its own visual and disabled/invalid
 * states via `disabled` and `aria-invalid`.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        // Password managers / autofill extensions inject attributes (e.g.
        // aria-autocomplete="list", data-* markers) onto inputs after SSR but
        // before hydration, which React flags as a hydration mismatch. This is
        // the sanctioned escape hatch for third-party DOM mutation — it does
        // not affect accessibility or password-manager behavior, and only
        // suppresses the warning for THIS element's own attributes.
        suppressHydrationWarning
        className={cn(
          "border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none",
          "placeholder:text-muted-foreground",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
