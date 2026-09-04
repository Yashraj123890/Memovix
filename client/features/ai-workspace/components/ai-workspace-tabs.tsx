"use client";

import { useState } from "react";
import { FileTextIcon, MessageCircleIcon } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AiWorkspaceHeader } from "@/features/ai-workspace/components/ai-workspace-header";
import {
  AiQuickActions,
  type QuickAction,
} from "@/features/ai-workspace/components/ai-quick-actions";
import { AiChatPanel } from "@/features/ai-workspace/components/chat/ai-chat-panel";
import { SummaryPanel } from "@/features/ai-workspace/components/summary/summary-panel";
import { useAiChat } from "@/features/ai-workspace/hooks/use-ai-chat";
import { useAiReports } from "@/features/ai-workspace/hooks/use-ai-reports";
import { useAuthStore } from "@/stores/auth.store";

interface AiWorkspaceTabsProps {
  projectId: string;
  projectName: string;
}

/**
 * AI Workspace navigation — Chat + Summary only. The prototype Requirements /
 * Comparison / Scope panels (and their /ai/requirements free-text,
 * /ai/requirement-comparison, /ai/scope-analysis calls) were removed in the
 * M6/M7 cleanup; that functionality now lives in the dedicated Requirements tab.
 */
const QUICK_ACTIONS: readonly QuickAction[] = [
  { value: "summary", label: "Generate Summary", icon: FileTextIcon },
  { value: "chat", label: "Ask AI", icon: MessageCircleIcon },
];

export function AiWorkspaceTabs({
  projectId,
  projectName,
}: AiWorkspaceTabsProps) {
  const [activePanel, setActivePanel] = useState<string>("chat");
  const currentUser = useAuthStore((state) => state.user);

  const chat = useAiChat(projectId);
  const summary = useAiReports({ projectId, projectName, kind: "summary" });

  function handleActivePanelChange(value: string) {
    setActivePanel(value);

    // Summary needs no input, so selecting it can generate immediately (only the
    // first time — it won't re-fire once content already exists).
    if (value === "summary" && !summary.content && !summary.isLoading) {
      summary.generate();
    }
  }

  const loadingValues = [summary.isLoading && "summary"].filter(
    (value): value is string => Boolean(value),
  );

  return (
    <div className="flex flex-col gap-5">
      <AiWorkspaceHeader />

      <Tabs value={activePanel} onValueChange={handleActivePanelChange}>
        <AiQuickActions actions={QUICK_ACTIONS} loadingValues={loadingValues} />

        <TabsContent value="chat" forceMount>
          <AiChatPanel
            projectId={projectId}
            messages={chat.messages}
            onSend={chat.sendQuestion}
            isSending={chat.isSending}
            currentUserName={currentUser?.name}
          />
        </TabsContent>
        <TabsContent value="summary" forceMount>
          <SummaryPanel
            content={summary.content}
            isLoading={summary.isLoading}
            isError={summary.isError}
            errorMessage={summary.errorMessage}
            onGenerate={summary.generate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
