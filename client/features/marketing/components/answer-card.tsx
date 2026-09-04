import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnswerSource {
  icon: LucideIcon;
  label: string;
  score: number;
}

/**
 * The product's soul as the hero visual: a grounded AI answer with clickable-
 * looking source citations. Intentionally mirrors the real chat UI
 * (features/ai-workspace/components/chat/chat-sources.tsx) — same source types,
 * icons, relevance %, and badge treatment — so it depicts the actual product,
 * not an invented one. Static mockup (no live data).
 */
export function AnswerCard({
  question,
  answer,
  sources,
  footer,
  className,
}: {
  question: string;
  answer: ReactNode;
  sources: AnswerSource[];
  footer?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-card relative overflow-hidden rounded-2xl border p-5 shadow-2xl sm:p-6",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, color-mix(in oklch, var(--primary) 14%, transparent), transparent 60%)",
        }}
      />
      <div className="relative flex flex-col gap-4">
        {/* Question */}
        <p className="font-mono text-sm">
          <span className="text-primary">›</span>{" "}
          <span className="text-foreground">{question}</span>
        </p>

        {/* Answer */}
        <div className="flex gap-3">
          <span className="bg-primary text-primary-foreground font-display grid size-8 flex-none place-items-center rounded-lg text-sm font-semibold">
            M
          </span>
          <p className="text-muted-foreground text-[0.97rem] leading-relaxed [&_b]:text-foreground [&_b]:font-medium">
            {answer}
          </p>
        </div>

        {/* Sources — mirrors ChatSources */}
        <div className="border-border/70 mt-1 border-t border-dashed pt-4">
          <span className="text-muted-foreground font-mono text-[0.62rem] tracking-[0.16em] uppercase">
            Sources
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sources.map(({ icon: Icon, label, score }) => (
              <span
                key={label}
                className="border-border bg-background/60 text-foreground/90 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[0.72rem]"
              >
                <Icon className="text-primary size-3 shrink-0" aria-hidden="true" />
                <span className="max-w-[12rem] truncate">{label}</span>
                <span className="text-success tabular-nums">{score}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {footer && (
        <div className="border-border bg-background/60 text-muted-foreground relative mt-4 flex items-center gap-2.5 rounded-xl border p-3 font-mono text-[0.72rem]">
          <span className="bg-primary mkt-pulse size-2 flex-none rounded-full" aria-hidden="true" />
          {footer}
        </div>
      )}
    </div>
  );
}
