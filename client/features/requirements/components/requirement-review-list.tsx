"use client";

import { useState } from "react";
import { Trash2Icon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { RequirementCategoryPicker } from "@/features/requirements/components/requirement-category-picker";
import {
  REQUIREMENT_CATEGORIES,
  type RequirementCategory,
} from "@/features/requirements/config/requirement-category";
import type {
  ConfirmRequirementInput,
  ExtractedRequirementProposal,
} from "@/types/requirement";

interface ReviewItem {
  tempId: string;
  title: string;
  description: string;
  category: RequirementCategory;
  sourceExcerpt: string | null;
  included: boolean;
}

interface RequirementReviewListProps {
  proposals: ExtractedRequirementProposal[];
  sourceFileId: string | null;
  isSubmitting: boolean;
  onAccept: (kept: ConfirmRequirementInput[], rejectedTitles: string[]) => void;
  onRejectAll: (titles: string[]) => void;
}

function toReviewItem(proposal: ExtractedRequirementProposal): ReviewItem {
  const category =
    proposal.category &&
    (REQUIREMENT_CATEGORIES as readonly string[]).includes(proposal.category)
      ? (proposal.category as RequirementCategory)
      : "other";
  return {
    tempId: proposal.tempId,
    title: proposal.title,
    description: proposal.description ?? "",
    category,
    sourceExcerpt: proposal.sourceExcerpt,
    included: true,
  };
}

/**
 * Editable review queue for AI-proposed requirements (blueprint §3.2.4). Each
 * proposal can be edited, excluded (rejected), or restored before accepting.
 * Nothing is persisted until "Accept" — accepted items are confirmed and any
 * excluded ones are sent to the reject endpoint so the decision is audited.
 */
export function RequirementReviewList({
  proposals,
  sourceFileId,
  isSubmitting,
  onAccept,
  onRejectAll,
}: RequirementReviewListProps) {
  const [items, setItems] = useState<ReviewItem[]>(() =>
    proposals.map(toReviewItem),
  );

  function updateItem(tempId: string, patch: Partial<ReviewItem>) {
    setItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, ...patch } : item,
      ),
    );
  }

  const includedItems = items.filter((item) => item.included);
  const canAccept =
    includedItems.length > 0 &&
    includedItems.every((item) => item.title.trim().length > 0);

  function handleAccept() {
    const kept: ConfirmRequirementInput[] = includedItems.map((item) => ({
      title: item.title.trim(),
      description:
        item.description.trim() === "" ? null : item.description.trim(),
      category: item.category,
      sourceExcerpt: item.sourceExcerpt,
      sourceFileId: sourceFileId ?? undefined,
    }));
    const rejectedTitles = items
      .filter((item) => !item.included)
      .map((item) => item.title.trim() || "Untitled");
    onAccept(kept, rejectedTitles);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>
          {includedItems.length} of {items.length} selected
        </span>
        <Button
          type="button"
          variant="text"
          size="sm"
          disabled={isSubmitting || items.every((item) => !item.included)}
          onClick={() =>
            onRejectAll(items.map((item) => item.title.trim() || "Untitled"))
          }
        >
          Reject all
        </Button>
      </div>

      <ul className="flex max-h-[24rem] flex-col gap-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <li
            key={item.tempId}
            className={cn(
              "border-border rounded-lg border p-3",
              !item.included && "bg-muted/40 opacity-60",
            )}
          >
            <div className="flex items-start gap-2">
              <div className="flex flex-1 flex-col gap-2">
                <Input
                  aria-label="Requirement title"
                  value={item.title}
                  disabled={!item.included || isSubmitting}
                  onChange={(event) =>
                    updateItem(item.tempId, { title: event.target.value })
                  }
                />
                <Textarea
                  aria-label="Requirement description"
                  rows={2}
                  value={item.description}
                  disabled={!item.included || isSubmitting}
                  onChange={(event) =>
                    updateItem(item.tempId, { description: event.target.value })
                  }
                />
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-44">
                    <RequirementCategoryPicker
                      value={item.category}
                      onChange={(category) =>
                        updateItem(item.tempId, { category })
                      }
                      disabled={!item.included || isSubmitting}
                    />
                  </div>
                  {item.sourceExcerpt && (
                    <p className="text-muted-foreground border-border/60 max-w-full truncate border-l-2 pl-2 text-xs italic">
                      “{item.sourceExcerpt}”
                    </p>
                  )}
                </div>
                {item.included && item.title.trim().length === 0 && (
                  <p role="alert" className="text-destructive text-xs">
                    Title is required to accept this requirement.
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={
                  item.included ? "Reject requirement" : "Restore requirement"
                }
                disabled={isSubmitting}
                onClick={() =>
                  updateItem(item.tempId, { included: !item.included })
                }
              >
                {item.included ? <Trash2Icon /> : <RotateCcwIcon />}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleAccept}
          loading={isSubmitting}
          disabled={!canAccept || isSubmitting}
        >
          Accept {includedItems.length} requirement
          {includedItems.length === 1 ? "" : "s"}
        </Button>
      </div>
    </div>
  );
}
