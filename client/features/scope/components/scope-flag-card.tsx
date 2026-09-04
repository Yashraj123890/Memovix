"use client";

import { GaugeIcon, LinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScopeClassificationBadge } from "@/features/scope/components/scope-classification-badge";
import { ScopeResolutionBadge } from "@/features/scope/components/scope-resolution-badge";
import { ResolveFlagActions } from "@/features/scope/components/resolve-flag-actions";
import type { ScopeFlag } from "@/types/scope-flag";

interface ScopeFlagCardProps {
  projectId: string;
  flag: ScopeFlag;
  canManage: boolean;
}

/**
 * A single scope-creep flag: the flagged requirement, its classification,
 * similarity to the nearest baseline item, the AI's rationale, and (when
 * pending and the user can manage) the resolution actions.
 */
export function ScopeFlagCard({
  projectId,
  flag,
  canManage,
}: ScopeFlagCardProps) {
  const similarityPct = Math.round(flag.similarityScore * 100);
  const isPending = flag.resolution === "pending";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="font-medium">
              {flag.requirement?.title ?? "Requirement"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <ScopeClassificationBadge classification={flag.classification} />
              <ScopeResolutionBadge resolution={flag.resolution} />
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <GaugeIcon className="size-3.5" aria-hidden="true" />
                {similarityPct}% similar to baseline
              </span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">{flag.rationale}</p>

        {flag.relatedBaseline && (
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <LinkIcon className="size-3.5" aria-hidden="true" />
            Nearest baseline item:{" "}
            <span className="font-medium">{flag.relatedBaseline.title}</span>
          </p>
        )}

        {canManage && isPending && (
          <ResolveFlagActions projectId={projectId} flag={flag} />
        )}
      </CardContent>
    </Card>
  );
}
