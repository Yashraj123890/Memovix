"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowRightIcon, BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { PROJECTS_ROUTE, NOTIFICATIONS_ROUTE } from "@/constants/routes";

// WebGL background — client-only (no SSR) so ogl never runs on the server.
const Aurora = dynamic(() => import("@/components/react-bits/aurora"), { ssr: false });

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

/**
 * Dashboard hero. Reads the signed-in user directly from the auth store (its
 * greeting is tied to session identity, not swappable "data source" content).
 * Theme-aware:
 *   - LIGHT: a clean white hero card with a forest Fraunces heading and forest
 *     CTAs on the off-white dashboard — premium and calm, no aurora.
 *   - DARK: the unchanged animated aurora panel (React Bits <Aurora />).
 * The aurora is gated to dark mode and to post-hydration so it never mounts in
 * light and the server/first-client render match. CTAs link to existing routes.
 */
export function WelcomeCard() {
  const user = useAuthStore((state) => state.user);
  const { resolvedTheme } = useTheme();
  const hasHydrated = useHasHydrated();
  const firstName = user?.name.split(" ")[0] ?? "there";
  const greeting = getGreeting(new Date().getHours());
  const showAurora = hasHydrated && resolvedTheme === "dark";

  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-sm dark:border-white/10 dark:bg-neutral-950 dark:text-white">
      {/* Subtle accent wash — a faint forest tint in light, the violet fallback
          in dark (also the graceful fallback if WebGL is unavailable). */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_-20%,rgba(53,120,80,0.10),transparent_60%)] dark:bg-[radial-gradient(120%_120%_at_50%_-20%,rgba(82,39,255,0.35),transparent_60%)]" />

      {/* Animated aurora background — dark mode only. */}
      {showAurora && (
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
          <Aurora colorStops={["#7cff67", "#B497CF", "#5227FF"]} blend={0.5} amplitude={1.0} speed={0.5} />
        </div>
      )}

      {/* Fade the bottom to black for text contrast — dark only. */}
      <div className="pointer-events-none absolute inset-0 -z-10 dark:bg-gradient-to-b dark:from-transparent dark:via-neutral-950/40 dark:to-neutral-950" />

      <div className="flex flex-col items-center gap-5 px-6 py-14 text-center sm:py-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground dark:border-white/15 dark:bg-white/10 dark:text-white/90 dark:backdrop-blur">
          <span className="size-1.5 rounded-full bg-primary dark:bg-emerald-400" aria-hidden="true" />
          {greeting} · {DATE_FORMATTER.format(new Date())}
        </span>

        <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-balance sm:text-5xl md:text-6xl">
          Welcome back, {firstName}
        </h1>

        <p className="max-w-md text-sm text-muted-foreground sm:text-base dark:text-white/70">
          Here&apos;s what&apos;s happening across your projects today.
        </p>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="dark:bg-white dark:text-neutral-900 dark:hover:bg-white/90">
            <Link href={PROJECTS_ROUTE}>
              View projects
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
          >
            <Link href={NOTIFICATIONS_ROUTE}>
              <BellIcon className="size-4" aria-hidden="true" />
              Notifications
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
