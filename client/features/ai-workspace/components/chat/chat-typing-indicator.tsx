import { SparklesIcon } from "lucide-react";
import { AiIconChip } from "@/features/ai-workspace/components/ai-icon-chip";

/**
 * Stand-in for the assistant's reply while POST /api/ai/ask is in flight.
 * The endpoint returns one full response (no token streaming), so this is
 * a bounded "thinking" animation rather than a partial-answer skeleton.
 */
export function ChatTypingIndicator() {
  return (
    <div className="flex items-start gap-3" role="status" aria-label="Memovix AI is thinking">
      <AiIconChip icon={<SparklesIcon className="size-4" aria-hidden="true" />} size="sm" shape="circle" />
      <div className="bg-muted flex items-center gap-1 rounded-2xl rounded-tl-sm px-4 py-3">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full"
            style={{ animationDelay: `${index * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}
