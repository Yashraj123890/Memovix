"use client";

import { Loader2Icon, type LucideIcon } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiIconChip } from "@/features/ai-workspace/components/ai-icon-chip";

export interface QuickAction {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface AiQuickActionsProps {
  actions: readonly QuickAction[];
  /** Values currently generating (e.g. Summary/Requirements auto-fired from selecting the card). */
  loadingValues?: string[];
}

/**
 * The AI Workspace's single navigation surface. This used to sit above a
 * second, separate pill-style tab bar with the same five destinations —
 * redundant, so that row was removed and this became the Tabs primitive's
 * actual `TabsList` (via `TabsTrigger`'s `variant="card"`), not just a
 * lookalike. That means clicking a card, and switching the visible panel,
 * and the active/selected styling, are all driven by the exact same Tabs
 * context — one state, one control — and arrow-key/Home/End keyboard
 * navigation between cards comes from Tabs for free instead of being
 * reimplemented here. Must be rendered inside a <Tabs> (see
 * ai-workspace-tabs.tsx).
 */
export function AiQuickActions({ actions, loadingValues = [] }: AiQuickActionsProps) {
  return (
    <TabsList className="max-w-full flex-wrap gap-2.5 rounded-none bg-transparent p-0">
      {actions.map(({ value, label, icon: Icon }) => {
        const isBusy = loadingValues.includes(value);

        return (
          <TabsTrigger
            key={value}
            value={value}
            variant="card"
            icon={
              <AiIconChip
                icon={
                  isBusy ? (
                    <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Icon className="size-4" aria-hidden="true" />
                  )
                }
              />
            }
          >
            {label}
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}
