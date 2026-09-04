"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getActionConfig, getEntityTypeLabel } from "@/features/audit-logs/config/audit-log-config";
import { humanizeKey } from "@/features/audit-logs/utils/humanize-key";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { AuditLog } from "@/types/audit-log";

interface AuditLogDetailDrawerProps {
  log: AuditLog | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * `log` doubles as the open/closed flag (null = closed) so the container
 * doesn't need separate open-state — matches how Dialog-based features
 * elsewhere in the app key visibility off "is there a selected item."
 */
export function AuditLogDetailDrawer({ log, onOpenChange }: AuditLogDetailDrawerProps) {
  const { label, icon: Icon, variant } = log ? getActionConfig(log.action) : { label: "", icon: undefined, variant: "outline" as const };

  return (
    <Sheet open={log !== null} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 overflow-y-auto">
        {log && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                {Icon && <Icon className="size-4" aria-hidden="true" />}
                {label}
              </SheetTitle>
              <SheetDescription>
                {getEntityTypeLabel(log.entityType)} · {formatRelativeTime(log.createdAt)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 px-4 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={variant}>{label}</Badge>
                <Badge variant="outline">{getEntityTypeLabel(log.entityType)}</Badge>
              </div>

              <Separator />

              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Actor</dt>
                  <dd className="text-foreground font-medium">{log.user?.name ?? "Unknown"}</dd>
                </div>
                {log.user?.email && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="text-foreground truncate font-medium">{log.user.email}</dd>
                  </div>
                )}
                {log.entityId && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Entity ID</dt>
                    <dd className="text-foreground truncate font-mono text-xs">{log.entityId}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Timestamp</dt>
                  <dd className="text-foreground font-medium">
                    {new Date(log.createdAt).toLocaleString()}
                  </dd>
                </div>
              </dl>

              {log.details && Object.keys(log.details).length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-foreground text-sm font-semibold">Details</h3>
                    <dl className="flex flex-col gap-2 text-sm">
                      {Object.entries(log.details).map(([key, value]) => (
                        <div key={key} className="flex items-start justify-between gap-4">
                          <dt className="text-muted-foreground shrink-0">{humanizeKey(key)}</dt>
                          <dd className="text-foreground truncate text-right font-medium">
                            {String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
