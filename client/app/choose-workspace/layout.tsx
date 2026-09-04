import type { ReactNode } from "react";
import { RequireAuth } from "@/features/auth/components/require-auth";

/**
 * The workspace chooser (M11) is authenticated but deliberately OUTSIDE the app
 * shell — it's shown "before entering the application", so no sidebar/header.
 * RequireAuth still gates it (a signed-out user is redirected to /login), but
 * `requireWorkspaceChoice={false}` so it doesn't bounce a pending-choice client
 * away from the chooser itself (that guard is what keeps the dashboard from
 * flashing on other routes — see require-auth.tsx).
 */
export default function ChooseWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequireAuth requireWorkspaceChoice={false}>{children}</RequireAuth>;
}
