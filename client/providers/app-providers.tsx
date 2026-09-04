import type { ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthBootstrap } from "@/providers/auth-bootstrap";
import { Toaster } from "@/providers/toaster";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Single composition root for every app-wide provider. app/layout.tsx
 * should only ever import this — new global providers get added here,
 * in one place, instead of being wired individually into the layout.
 *
 * This component has no client-only logic of its own, so it stays a
 * Server Component; each provider below declares its own "use client"
 * boundary where it actually needs one.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthBootstrap>{children}</AuthBootstrap>
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  );
}
