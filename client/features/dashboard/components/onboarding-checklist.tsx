"use client";

import { RocketIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ONBOARDING_CHECKLIST } from "@/features/dashboard/config/onboarding-checklist";

interface OnboardingChecklistProps {
  onNewProject: () => void;
}

/**
 * Workspace-level onboarding nudge, shown alongside the "No projects yet"
 * empty state in ProjectsOverview when the owner has zero projects. Only
 * the "create project" step is actionable — every other step needs a real
 * project to point at, so they render locked with "Coming next" rather than
 * linking somewhere that doesn't exist yet (same honesty rule
 * GettingStartedChecklist follows for "Invite a client").
 */
export function OnboardingChecklist({ onNewProject }: OnboardingChecklistProps) {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
            <RocketIcon className="size-4" aria-hidden="true" />
          </div>
          <CardTitle>Get your workspace started</CardTitle>
        </div>
        <CardDescription>A few steps to set up your first project.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ONBOARDING_CHECKLIST.map((item) =>
            item.action === "create-project" ? (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={onNewProject}
                  className="group border-border bg-card hover:border-primary/40 hover:bg-accent flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-medium">{item.label}</p>
                    <p className="text-muted-foreground truncate text-xs">{item.description}</p>
                  </div>
                </button>
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
                      Coming next
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
