"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useHasHydrated } from "@/hooks/use-has-hydrated";

/**
 * Reuses the existing next-themes setup (providers/theme-provider.tsx,
 * dark-first per docs/decisions.md Decision 003) — no new theme
 * infrastructure. The resolved theme is only known in the browser, so this
 * renders a disabled placeholder until useHasHydrated flips true, avoiding
 * a server/client mismatch on the icon shown.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) {
    return <Button variant="ghost" size="icon" disabled aria-label="Toggle theme" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </Button>
  );
}
