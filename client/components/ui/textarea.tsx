import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Base multiline input — same visual conventions as Input
 * (components/ui/input.tsx), just resizable-off and taller by default.
 * First needed by F11's comment composer.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "border-input flex w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors outline-none",
          "placeholder:text-muted-foreground",
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
Textarea.displayName = "Textarea";

export { Textarea };
