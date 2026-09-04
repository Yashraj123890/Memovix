"use client";

import { useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MarkdownReport } from "@/features/ai-workspace/components/markdown-report";
import type {
  ConfirmActionItemInput,
  ConfirmDecisionInput,
  MeetingNote,
} from "@/types/meeting-note";

const DECISION_CATEGORIES = ["SCOPE", "TIMELINE", "BUDGET", "DESIGN", "OTHER"] as const;

interface DecisionRow {
  description: string;
  category: string;
}
interface ActionItemRow {
  description: string;
  owner: string;
  dueDate: string;
}

interface MeetingNoteReviewProps {
  note: MeetingNote;
  confirming: boolean;
  onConfirm: (
    decisions: ConfirmDecisionInput[],
    actionItems: ConfirmActionItemInput[],
  ) => void;
  onCancel: () => void;
}

/**
 * Human review gate (Meeting Notes v2). The AI only PROPOSES; nothing becomes a
 * permanent DecisionLog / ActionItem record until the user edits/accepts here and
 * confirms. Owners/dates are shown exactly as the transcript stated them.
 */
export function MeetingNoteReview({
  note,
  confirming,
  onConfirm,
  onCancel,
}: MeetingNoteReviewProps) {
  const [decisions, setDecisions] = useState<DecisionRow[]>(
    (note.proposedDecisions ?? []).map((d) => ({
      description: d.description,
      category: DECISION_CATEGORIES.includes(d.category as (typeof DECISION_CATEGORIES)[number])
        ? d.category
        : "OTHER",
    })),
  );
  const [actionItems, setActionItems] = useState<ActionItemRow[]>(
    (note.proposedActionItems ?? []).map((a) => ({
      description: a.description,
      owner: a.owner ?? "",
      dueDate: a.dueDate ?? "",
    })),
  );

  const updateDecision = (i: number, patch: Partial<DecisionRow>) =>
    setDecisions((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const updateActionItem = (i: number, patch: Partial<ActionItemRow>) =>
    setActionItems((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const handleConfirm = () => {
    const cleanedDecisions = decisions
      .map((d) => ({ description: d.description.trim(), category: d.category }))
      .filter((d) => d.description.length > 0);
    const cleanedActionItems = actionItems
      .map((a) => ({
        description: a.description.trim(),
        owner: a.owner.trim() || null,
        dueDate: a.dueDate.trim() || null,
      }))
      .filter((a) => a.description.length > 0);
    onConfirm(cleanedDecisions, cleanedActionItems);
  };

  const selectClass =
    "border-input bg-transparent h-9 rounded-md border px-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

  return (
    <div className="flex flex-col gap-5">
      {note.summary && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Summary</span>
          <div className="border-border/60 bg-muted/20 max-h-48 overflow-y-auto rounded-lg border p-3">
            <MarkdownReport content={note.summary} />
          </div>
        </div>
      )}

      <Separator />

      {/* Decisions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Decisions ({decisions.length})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDecisions((r) => [...r, { description: "", category: "OTHER" }])}
          >
            <PlusIcon aria-hidden="true" />
            Add
          </Button>
        </div>
        {decisions.length === 0 && (
          <p className="text-muted-foreground text-sm">No decisions extracted.</p>
        )}
        {decisions.map((d, i) => (
          <div key={i} className="flex items-start gap-2">
            <Input
              value={d.description}
              placeholder="Decision"
              onChange={(e) => updateDecision(i, { description: e.target.value })}
            />
            <select
              className={selectClass}
              value={d.category}
              aria-label="Decision category"
              onChange={(e) => updateDecision(i, { category: e.target.value })}
            >
              {DECISION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove decision"
              onClick={() => setDecisions((r) => r.filter((_, idx) => idx !== i))}
            >
              <Trash2Icon aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      <Separator />

      {/* Action items */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Action items ({actionItems.length})</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setActionItems((r) => [...r, { description: "", owner: "", dueDate: "" }])
            }
          >
            <PlusIcon aria-hidden="true" />
            Add
          </Button>
        </div>
        {actionItems.length === 0 && (
          <p className="text-muted-foreground text-sm">No action items extracted.</p>
        )}
        {actionItems.map((a, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-border/60 p-3">
            <Input
              value={a.description}
              placeholder="Task"
              onChange={(e) => updateActionItem(i, { description: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Input
                value={a.owner}
                placeholder="Owner (optional)"
                onChange={(e) => updateActionItem(i, { owner: e.target.value })}
              />
              <Input
                value={a.dueDate}
                placeholder="Due (optional, e.g. Friday)"
                onChange={(e) => updateActionItem(i, { dueDate: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove action item"
                onClick={() => setActionItems((r) => r.filter((_, idx) => idx !== i))}
              >
                <Trash2Icon aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={confirming}>
          Cancel
        </Button>
        <Button type="button" onClick={handleConfirm} loading={confirming} disabled={confirming}>
          Confirm &amp; save
        </Button>
      </div>
    </div>
  );
}
