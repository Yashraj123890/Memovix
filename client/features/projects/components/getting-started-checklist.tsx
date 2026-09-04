"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRightIcon, RocketIcon, XIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGettingStartedChecklist } from "@/features/projects/config/getting-started-checklist";

interface GettingStartedChecklistProps {
  projectId: string;
}

/**
 * Shown once, right after creating the owner's *first* project — see
 * useCreateProjectMutation for how `?onboarding=1` gets added to the
 * redirect URL. Dismissing it only clears local component state (not
 * persisted anywhere) since it's a one-time nudge, not an ongoing feature;
 * navigating away and back without the query param won't show it again.
 */
export function GettingStartedChecklist({ projectId }: GettingStartedChecklistProps) {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = searchParams.get("onboarding") === "1" && !dismissed;
  if (!shouldShow) return null;

  const items = getGettingStartedChecklist(projectId);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
            <RocketIcon className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Getting started</CardTitle>
        </div>
        <CardDescription>Your project is ready. Here&apos;s what to do next.</CardDescription>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss getting started checklist"
          >
            <XIcon className="size-4" aria-hidden="true" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((item) =>
            item.href ? (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group border-border bg-card hover:border-primary/40 hover:bg-accent flex items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-medium">{item.label}</p>
                    <p className="text-muted-foreground truncate text-xs">{item.description}</p>
                  </div>
                  <ArrowRightIcon
                    className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ) : (
              <li
                key={item.id}
                className="border-border bg-card flex items-center gap-3 rounded-lg border border-dashed p-3 opacity-70"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-foreground text-sm font-medium">{item.label}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      Coming soon
                    </Badge>
                  </div>
                  <p className="text-muted-foreground truncate text-xs">{item.description}</p>
                </div>
              </li>
            ),
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
