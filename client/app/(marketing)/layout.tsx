import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./marketing.css";
import "./landing.css";

/**
 * Public marketing shell — deliberately OUTSIDE the (app) group, so no
 * RequireAuth and no AppShell: anyone can view it. Forces the dark violet-void
 * aurora look regardless of the viewer's theme by wrapping in `.dark` (globals.css
 * defines `.dark { --tokens }` and `@custom-variant dark (&:is(.dark *))`, so the
 * whole subtree resolves to the dark palette even when the app theme is light).
 */
export const metadata: Metadata = {
  title: "Memovix — AI project memory for teams and clients",
  description:
    "Turn scattered files, meetings, and decisions into living project memory. Ask AI grounded questions with source citations, and give clients their own portal.",
  openGraph: {
    title: "Memovix — AI project memory for teams and clients",
    description:
      "Your projects remember everything: files, meetings, decisions, and the context behind them — with grounded AI answers that cite their sources.",
    type: "website",
  },
};

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark bg-background text-foreground min-h-dvh font-sans antialiased">
      {children}
    </div>
  );
}
