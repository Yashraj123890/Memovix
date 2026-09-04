"use client";

import { Building2Icon, CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth.store";
import { USER_ROLES } from "@/constants/roles";
import { useWorkspaces } from "@/features/workspace/hooks/use-workspaces";
import { useSwitchWorkspace } from "@/features/workspace/hooks/use-switch-workspace";

/**
 * Persistent workspace switcher in the app header (M11). Renders ONLY for a
 * CLIENT who belongs to more than one workspace — owners, members, and
 * single-workspace clients render nothing (so they never see a switcher).
 * Switching never logs out.
 */
export function WorkspaceSwitcher() {
  const user = useAuthStore((state) => state.user);
  const { data: workspaces } = useWorkspaces();
  const switchWorkspace = useSwitchWorkspace();

  if (user?.role !== USER_ROLES.CLIENT) return null;
  if (!workspaces || workspaces.length <= 1) return null;

  const active = workspaces.find((w) => w.tenantId === user.tenantId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="border-border bg-background hover:bg-accent focus-visible:ring-ring inline-flex max-w-[13rem] items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 disabled:opacity-60"
        aria-label="Switch workspace"
        disabled={switchWorkspace.isPending}
      >
        <Building2Icon className="size-4 shrink-0 opacity-70" />
        <span className="truncate">{active?.name ?? "Select workspace"}</span>
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((w) => {
          const isActive = w.tenantId === user.tenantId;
          return (
            <DropdownMenuItem
              key={w.tenantId}
              disabled={switchWorkspace.isPending || isActive}
              onSelect={() => {
                if (!isActive)
                  switchWorkspace.mutate({
                    tenantId: w.tenantId,
                    name: w.name,
                  });
              }}
            >
              <span className="truncate">{w.name}</span>
              {isActive && <CheckIcon className="ml-auto size-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
