import type { ReactNode } from "react";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { AuthAnimatedBackground } from "@/features/auth/components/auth-animated-background";
import { AuthThemeBoundary } from "@/features/auth/components/auth-theme-boundary";

/**
 * Shared chrome for public authentication pages (/login and /register).
 * Split layout: a brand panel on large screens, a centered form column on every
 * screen size. The canvas is a warm off-white in light mode and uses the laser
 * video backdrop in dark mode. Authentication checks remain inside `children`.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthThemeBoundary>
      <div className="bg-background relative isolate flex min-h-full flex-1 overflow-hidden dark:bg-[#08060F]">
        <AuthAnimatedBackground />
        <div className="relative z-10 flex min-h-full flex-1">
          <AuthBrandPanel />

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
            <div className="relative w-full max-w-sm">{children}</div>
          </div>
        </div>
      </div>
    </AuthThemeBoundary>
  );
}
