"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, Building2Icon, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SpotlightCard } from "@/components/react-bits/spotlight-card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ROLES } from "@/constants/roles";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/constants/routes";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useSwitchWorkspace } from "@/features/workspace/hooks/use-switch-workspace";
import { getErrorMessage } from "@/utils/error";
import type { UserRole } from "@/constants/roles";

const ROLE_LABEL: Record<UserRole, string> = {
  OWNER: "Owner",
  MEMBER: "Member",
  CLIENT: "Client",
};

/**
 * Post-login workspace chooser (M11). Shown only to a CLIENT with more than one
 * workspace; owners/members and single-workspace clients are redirected
 * straight into the app. Selecting a workspace calls /auth/switch-workspace via
 * useSwitchWorkspace (the real, existing mutation) and enters it — no logout, no
 * fake client-side switch.
 */
export default function ChooseWorkspacePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data: workspaces, isLoading, isError, error, refetch } = useWorkspaces();
  const switchWorkspace = useSwitchWorkspace();

  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // Owners/members never choose a workspace.
  useEffect(() => {
    if (user && user.role !== USER_ROLES.CLIENT) {
      router.replace(DEFAULT_AUTHENTICATED_ROUTE);
    }
  }, [user, router]);

  // A client with a single workspace goes straight in.
  useEffect(() => {
    if (workspaces && workspaces.length === 1) {
      router.replace(DEFAULT_AUTHENTICATED_ROUTE);
    }
  }, [workspaces, router]);

  if (isLoading) {
    return <LoadingState label="Loading your workspaces..." />;
  }

  if (isError) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6">
        <ErrorState
          title="Couldn't load your workspaces"
          description={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!workspaces) {
    return <LoadingState label="Loading your workspaces..." />;
  }

  if (workspaces.length === 0) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6">
        <EmptyState
          icon={<Building2Icon className="size-5" />}
          title="No workspaces available"
          description="You don't have access to any workspaces yet. Ask a workspace owner to invite you."
        />
      </div>
    );
  }

  // A single-workspace client redirects via the effect above; render the loader
  // until that resolves so no intermediate UI flashes.
  if (workspaces.length === 1) {
    return <LoadingState label="Loading your workspaces..." />;
  }

  const activeTenantId = user?.tenantId;
  const defaultTenantId =
    workspaces.find((w) => w.tenantId === activeTenantId)?.tenantId ?? workspaces[0].tenantId;
  const currentSelection = selectedTenantId ?? defaultTenantId;
  const isSwitching = switchWorkspace.isPending;

  function handleEnter() {
    const workspace = workspaces?.find((w) => w.tenantId === currentSelection);
    if (!workspace || isSwitching) return;
    switchWorkspace.mutate({ tenantId: workspace.tenantId, name: workspace.name });
  }

  return (
    <div className="from-primary/10 via-background to-background relative min-h-dvh bg-gradient-to-br">
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center gap-8 px-4 py-12 sm:px-6">
        {/* Brand + heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl text-lg font-semibold">
            M
          </span>
          <div className="space-y-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              Choose a workspace
            </h1>
            <p className="text-muted-foreground text-sm">
              You have access to several workspaces. Pick one to continue.
            </p>
          </div>
        </div>

        {/* Workspace cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {workspaces.map((workspace) => {
            const isActive = workspace.tenantId === activeTenantId;
            const isSelected = workspace.tenantId === currentSelection;

            return (
              <button
                key={workspace.tenantId}
                type="button"
                disabled={isSwitching}
                aria-pressed={isSelected}
                onClick={() => setSelectedTenantId(workspace.tenantId)}
                className="focus-visible:ring-ring rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
              >
                <SpotlightCard
                  className={cn(
                    "bg-card flex h-full items-start gap-3 rounded-xl border p-4 shadow-sm transition-colors",
                    isSelected ? "border-primary ring-primary/40 ring-1" : "border-border hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Building2Icon className="size-5" aria-hidden="true" />
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground truncate font-medium">{workspace.name}</span>
                      {isSelected && (
                        <CheckIcon className="text-primary size-4 shrink-0" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">{ROLE_LABEL[workspace.role] ?? workspace.role}</Badge>
                      {isActive && <Badge variant="success">Active</Badge>}
                    </div>
                  </div>
                </SpotlightCard>
              </button>
            );
          })}
        </div>

        {/* Continue */}
        <div className="flex justify-center">
          <Button
            type="button"
            size="lg"
            className="w-full gap-1.5 sm:w-auto"
            loading={isSwitching}
            disabled={isSwitching}
            onClick={handleEnter}
          >
            Enter workspace
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
