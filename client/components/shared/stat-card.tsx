import type { ReactNode } from "react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardTrend {
  label: string;
  direction: "up" | "down";
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: StatCardTrend;
  className?: string;
}

/**
 * Minimal "big number" metric tile — docs/component-guidelines.md "Shared
 * Components" names StatsCard as exactly this kind of reusable component.
 * Used today for the Projects Overview stat row; any future feature
 * showing counts (Files, Memories, Team) can reuse it.
 */
function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("border-border flex flex-col gap-1 rounded-lg border p-4", className)}>
      <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
        <span>{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-foreground text-2xl font-semibold tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.direction === "up" ? "text-success" : "text-destructive",
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUpIcon className="size-3" aria-hidden="true" />
            ) : (
              <TrendingDownIcon className="size-3" aria-hidden="true" />
            )}
            {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}

export { StatCard };
