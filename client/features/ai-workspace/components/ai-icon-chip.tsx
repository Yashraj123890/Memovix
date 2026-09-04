import * as React from "react";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "size-8",
  md: "size-9",
  lg: "size-12",
} as const;

const SHAPE_CLASSES = {
  circle: "rounded-full",
  square: "rounded-lg",
  squareLg: "rounded-xl",
} as const;

export interface AiIconChipProps {
  icon: React.ReactNode;
  size?: keyof typeof SIZE_CLASSES;
  shape?: keyof typeof SHAPE_CLASSES;
  className?: string;
}

/**
 * The single "this is an AI feature" visual mark used everywhere in the AI
 * Workspace — a primary-tinted icon chip. Extracted because the same
 * `bg-primary/15 text-primary ... items-center justify-center` wrapper was
 * being hand-copied into report-output-card, ai-chat-panel and
 * ai-workspace-header with only the size/shape changing;
 * one component now drives all of them, so the AI identity stays visually
 * consistent by construction instead of by convention.
 */
export function AiIconChip({
  icon,
  size = "md",
  shape = "square",
  className,
}: AiIconChipProps) {
  return (
    <div
      className={cn(
        "bg-primary/15 text-primary flex shrink-0 items-center justify-center",
        SIZE_CLASSES[size],
        SHAPE_CLASSES[shape],
        className,
      )}
    >
      {icon}
    </div>
  );
}
