"use client";

import type { ComponentProps } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

/**
 * Wraps next-themes so the rest of the app never imports it directly.
 * Memovix is dark-mode-first (see docs/design-system.md); light mode is
 * planned for a later phase, so system preference is disabled for now.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
