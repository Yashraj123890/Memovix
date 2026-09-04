"use client";

import { LogOutIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useProfile } from "@/features/settings/hooks/use-profile";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Reuses the F2 auth store for the signed-in user's name/email and
 * useLogout (features/auth/hooks/use-logout.ts) — this is that hook's
 * first real integration point, wired exactly as planned when it was
 * built as F2 foundation.
 */
export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const { data: profile } = useProfile();

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus-visible:ring-ring focus-visible:ring-offset-background rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-label="Open user menu"
      >
        <Avatar src={profile?.avatarUrl ?? undefined} fallback={getInitials(user.name)} alt={user.name} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{user.name}</span>
          <span className="text-muted-foreground truncate text-xs font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={logout}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
