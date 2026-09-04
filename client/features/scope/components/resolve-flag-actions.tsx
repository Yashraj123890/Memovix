"use client";

import { CheckIcon, XIcon, FileClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResolveScopeFlagMutation } from "@/features/scope/hooks/use-scope-mutations";
import type { ScopeFlag, ScopeResolveAction } from "@/types/scope-flag";

interface ResolveFlagActionsProps {
  projectId: string;
  flag: ScopeFlag;
}

/**
 * Freelancer actions for a pending scope flag (blueprint §3.2.6):
 * Accept into Scope (promotes the requirement into the baseline + logs a
 * decision), Decline, or Propose Change Order (leaves it pending). Never
 * communicates with the client.
 */
export function ResolveFlagActions({
  projectId,
  flag,
}: ResolveFlagActionsProps) {
  const resolve = useResolveScopeFlagMutation(projectId);

  const pendingAction =
    resolve.isPending && resolve.variables
      ? resolve.variables.action
      : undefined;

  function act(action: ScopeResolveAction) {
    resolve.mutate({ flagId: flag.id, action });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        onClick={() => act("accept_into_scope")}
        loading={pendingAction === "accept_into_scope"}
        disabled={resolve.isPending}
      >
        <CheckIcon aria-hidden="true" />
        Accept into scope
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => act("decline")}
        loading={pendingAction === "decline"}
        disabled={resolve.isPending}
      >
        <XIcon aria-hidden="true" />
        Decline
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => act("propose_change_order")}
        loading={pendingAction === "propose_change_order"}
        disabled={resolve.isPending}
      >
        <FileClockIcon aria-hidden="true" />
        Propose change order
      </Button>
    </div>
  );
}
