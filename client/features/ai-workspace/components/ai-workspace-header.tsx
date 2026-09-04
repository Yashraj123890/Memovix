import { BrainCircuitIcon } from "lucide-react";
import { AiIconChip } from "@/features/ai-workspace/components/ai-icon-chip";

/**
 * Hero header for the AI Workspace route — same subtle-gradient treatment
 * docs/design-system.md reserves for AI surfaces ("AI Components... may
 * use subtle gradients") and the one AiSearchShortcut already established
 * on the dashboard, reused here rather than inventing a second visual
 * language for "this is an AI feature."
 */
export function AiWorkspaceHeader() {
  return (
    <div className="from-primary/10 via-card to-card relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-r p-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <AiIconChip icon={<BrainCircuitIcon className="size-6" aria-hidden="true" />} size="lg" shape="squareLg" />
        <div>
          <h2 className="text-foreground text-xl font-semibold">AI Workspace</h2>
          <p className="text-muted-foreground text-sm">
            Chat, summarize, extract requirements, compare scope changes — all grounded in this project&apos;s memory.
          </p>
        </div>
      </div>
    </div>
  );
}
