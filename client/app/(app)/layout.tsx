import type { ReactNode } from "react";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { AppShell } from "@/features/layout/components/app-shell";

/**
 * Shared shell for every authenticated route (docs/prompts/F3-App-Layout.md).
 * RequireAuth (built in F2, unused until now) gates access — this is its
 * first real integration point. AppShell renders the sidebar/header/main
 * content chrome around whatever page is active.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
