import { SparklesIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StaggerItem } from "@/components/motion/stagger-item";
import { AiIconChip } from "@/features/ai-workspace/components/ai-icon-chip";
import { ChatSources } from "@/features/ai-workspace/components/chat/chat-sources";
import { renderMarkdown } from "@/features/ai-workspace/utils/parse-markdown";
import { getInitials } from "@/features/ai-workspace/utils/get-initials";
import { formatRelativeTime } from "@/utils/format-relative-time";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/ai";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  projectId: string;
  currentUserName?: string;
  index: number;
}

function confidenceVariant(
  confidence: number,
): "success" | "warning" | "destructive" {
  if (confidence >= 0.7) return "success";
  if (confidence >= 0.4) return "warning";
  return "destructive";
}

export function ChatMessageBubble({
  message,
  projectId,
  currentUserName,
  index,
}: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <StaggerItem index={index} className="flex list-none">
      <div
        className={cn(
          "flex w-full items-start gap-3",
          isUser && "flex-row-reverse",
        )}
      >
        {isUser ? (
          <Avatar
            fallback={currentUserName ? getInitials(currentUserName) : "?"}
            alt={currentUserName ?? ""}
            className="size-8"
          />
        ) : (
          <AiIconChip
            icon={<SparklesIcon className="size-4" aria-hidden="true" />}
            size="sm"
            shape="circle"
          />
        )}

        <div
          className={cn(
            "flex max-w-[80%] flex-col gap-1.5",
            isUser && "items-end",
          )}
        >
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words",
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap"
                : "bg-muted text-foreground rounded-tl-sm",
            )}
          >
            {isUser ? message.content : renderMarkdown(message.content)}
          </div>

          {!isUser && (message.confidence !== undefined || message.uncited) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {typeof message.confidence === "number" && (
                <Badge
                  variant={confidenceVariant(message.confidence)}
                  className="w-fit"
                >
                  {Math.round(message.confidence * 100)}% confidence
                </Badge>
              )}
              {message.uncited && (
                <Badge
                  variant="warning"
                  className="w-fit"
                  title="The model didn't cite its sources — treat this answer with extra caution."
                >
                  Uncited
                </Badge>
              )}
            </div>
          )}

          {!isUser && message.sources && (
            <ChatSources projectId={projectId} sources={message.sources} />
          )}

          <span className="text-muted-foreground/70 px-1 text-[11px]">
            {formatRelativeTime(message.createdAt)}
          </span>
        </div>
      </div>
    </StaggerItem>
  );
}
