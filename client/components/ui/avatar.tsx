"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt?: string;
  /** Shown while there is no image, or if it fails to load (e.g. initials). */
  fallback?: React.ReactNode;
}

/**
 * Plain <img> with error-fallback state, rather than next/image — avatar
 * sources will come from user-provided/external URLs whose domains aren't
 * known yet, and next/image requires each remote domain to be allow-listed
 * in next.config.ts ahead of time.
 */
const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, src, alt = "", fallback, ...props }, ref) => {
    const [imageFailed, setImageFailed] = React.useState(false);
    const showImage = Boolean(src) && !imageFailed;

    return (
      <span
        ref={ref}
        className={cn(
          "bg-muted relative flex size-9 shrink-0 overflow-hidden rounded-full",
          className,
        )}
        {...props}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src as string}
            alt={alt}
            className="aspect-square size-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="text-muted-foreground flex size-full items-center justify-center text-xs font-medium">
            {fallback}
          </span>
        )}
      </span>
    );
  },
);
Avatar.displayName = "Avatar";

export { Avatar };
