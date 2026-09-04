"use client";

import type { ReactNode } from "react";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RequirementCategoryBadge } from "@/features/requirements/components/requirement-category-badge";
import type { Requirement } from "@/types/requirement";

/** Optional per-row action to move a requirement between lanes. */
interface RequirementLaneAction {
  label: string;
  icon: ReactNode;
  onSelect: (requirement: Requirement) => void;
  pendingId?: string | null;
}

interface RequirementsTableProps {
  requirements: Requirement[];
  canManage: boolean;
  /**
   * Initial-setup baseline selector (checkbox column). Provide both to render
   * the checkbox column; omit for the two-lane views, which use `laneAction`.
   */
  selectedBaselineIds?: Set<string>;
  onToggleBaseline?: (requirementId: string) => void;
  /** Per-row lane move ("Add to baseline" / "Move to New Requests"). */
  laneAction?: RequirementLaneAction;
  onEdit: (requirement: Requirement) => void;
  onDelete: (requirement: Requirement) => void;
}

/**
 * Persisted requirements table. Two shapes:
 *  - Initial baseline setup: pass `selectedBaselineIds` + `onToggleBaseline` to
 *    render the "Baseline" checkbox column (committed via "Set as baseline").
 *  - Two-lane views (a baseline exists): pass `laneAction` to render a per-row
 *    move in the actions menu; no checkbox column.
 */
export function RequirementsTable({
  requirements,
  canManage,
  selectedBaselineIds,
  onToggleBaseline,
  laneAction,
  onEdit,
  onDelete,
}: RequirementsTableProps) {
  const showBaselineSelector = Boolean(onToggleBaseline && selectedBaselineIds);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {canManage && showBaselineSelector && (
            <TableHead className="w-20">Baseline</TableHead>
          )}
          <TableHead>Requirement</TableHead>
          <TableHead className="w-32">Category</TableHead>
          <TableHead className="w-64">Source</TableHead>
          {canManage && (
            <TableHead className="w-12 text-right">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {requirements.map((requirement) => (
          <TableRow key={requirement.id}>
            {canManage && showBaselineSelector && (
              <TableCell>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-primary size-4"
                    checked={selectedBaselineIds!.has(requirement.id)}
                    onChange={() => onToggleBaseline!(requirement.id)}
                    aria-label={`Include "${requirement.title}" in baseline scope`}
                  />
                </label>
              </TableCell>
            )}
            <TableCell className="whitespace-normal">
              <p className="font-medium">{requirement.title}</p>
              {requirement.description && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {requirement.description}
                </p>
              )}
            </TableCell>
            <TableCell>
              <RequirementCategoryBadge category={requirement.category} />
            </TableCell>
            <TableCell className="whitespace-normal">
              {requirement.sourceExcerpt ? (
                <p className="text-muted-foreground border-border/60 line-clamp-2 border-l-2 pl-2 text-xs italic">
                  “{requirement.sourceExcerpt}”
                </p>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </TableCell>
            {canManage && (
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Requirement actions"
                    >
                      <MoreHorizontalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {laneAction && (
                      <DropdownMenuItem
                        disabled={laneAction.pendingId === requirement.id}
                        onClick={() => laneAction.onSelect(requirement)}
                      >
                        {laneAction.icon}
                        {laneAction.label}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(requirement)}>
                      <PencilIcon />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(requirement)}
                    >
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
