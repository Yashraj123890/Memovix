"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getActionConfig, getEntityTypeLabel } from "@/features/audit-logs/config/audit-log-config";
import { formatRelativeTime } from "@/utils/format-relative-time";
import type { AuditLog } from "@/types/audit-log";

interface AuditLogTableProps {
  logs: AuditLog[];
  onSelect: (log: AuditLog) => void;
}

export function AuditLogTable({ logs, onSelect }: AuditLogTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Action</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const { label, icon: Icon, variant } = getActionConfig(log.action);
          return (
            <TableRow
              key={log.id}
              className="hover:bg-accent/60 cursor-pointer"
              onClick={() => onSelect(log)}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${label}`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(log);
                }
              }}
            >
              <TableCell>
                <Badge variant={variant} className="gap-1">
                  <Icon className="size-3" aria-hidden="true" />
                  {label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {getEntityTypeLabel(log.entityType)}
              </TableCell>
              <TableCell className="text-foreground">{log.user?.name ?? "Unknown"}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatRelativeTime(log.createdAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
