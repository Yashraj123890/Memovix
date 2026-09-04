import * as React from "react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  /** Typically a "View all" link. */
  action?: React.ReactNode;
  contentClassName?: string;
}

/**
 * Consistent titled-card shell composing the existing Card primitives
 * (components/ui/card.tsx) instead of each widget re-implementing its own
 * header/title/action layout. Business-independent — component-guidelines
 * names "SectionHeader" as exactly this kind of shared component — so any
 * future feature needing a titled section can reuse it, not just the
 * dashboard.
 */
function SectionCard({
  title,
  description,
  action,
  contentClassName,
  className,
  children,
  ...props
}: SectionCardProps) {
  return (
    <Card className={cn("h-full", className)} {...props}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className={cn("flex flex-col gap-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export { SectionCard };
