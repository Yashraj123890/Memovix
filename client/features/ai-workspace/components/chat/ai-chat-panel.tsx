import { MessageCircleIcon, SparklesIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ChatMessageList } from "@/features/ai-workspace/components/chat/chat-message-list";
import { ChatComposer } from "@/features/ai-workspace/components/chat/chat-composer";
import { AiIconChip } from "@/features/ai-workspace/components/ai-icon-chip";
import type { ChatMessage } from "@/types/ai";

interface AiChatPanelProps {
  projectId: string;
  messages: ChatMessage[];
  onSend: (question: string) => void;
  isSending: boolean;
  currentUserName?: string;
}

/**
 * Presentational — the useAiChat() instance lives in ai-workspace-tabs.tsx
 * alongside the four report hooks, so every AI Workspace feature's
 * business/API logic sits in one place and every panel here is just UI.
 * Same gradient card treatment as ReportOutputCard/RequirementsInputCard so
 * all five panels read as one visual family, not five unrelated widgets.
 */
export function AiChatPanel({ projectId, messages, onSend, isSending, currentUserName }: AiChatPanelProps) {
  return (
    <Card className="from-primary/5 via-card to-card flex h-[30rem] flex-col gap-0 bg-gradient-to-br sm:h-[36rem]">
      <CardHeader className="border-border/60 border-b pb-5">
        <div className="flex items-center gap-2.5">
          <AiIconChip icon={<MessageCircleIcon className="size-4" aria-hidden="true" />} />
          <div>
            <CardTitle className="text-base">AI Chat</CardTitle>
            <CardDescription>Ask questions grounded in this project&apos;s memory.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden pt-5">
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={<SparklesIcon className="size-5" />}
              title="Ask AI anything about this project."
              description="Answers are grounded only in this project's memories — Memovix AI won't invent information it can't find."
            />
          </div>
        ) : (
          <ChatMessageList
            messages={messages}
            projectId={projectId}
            currentUserName={currentUserName}
            isSending={isSending}
          />
        )}

        <ChatComposer onSend={onSend} isSending={isSending} />
      </CardContent>
    </Card>
  );
}
