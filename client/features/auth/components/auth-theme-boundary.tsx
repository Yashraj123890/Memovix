"use client";

import { useEffect, type ReactNode } from "react";
import { useTheme } from "next-themes";

/**
 * Auth pages always render in Memovix dark mode. Visiting an auth route also
 * resets the persisted preference so the next authenticated session starts
 * dark; users can still switch themes again from the dashboard.
 */
export function AuthThemeBoundary({ children }: { children: ReactNode }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  return <div className="dark contents">{children}</div>;
}
