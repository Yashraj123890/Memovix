"use client";

import { useParams } from "next/navigation";
import { AuditLogsContainer } from "@/features/audit-logs/components/audit-logs-container";

/**
 * "/projects/[id]/audit-logs" — F15. New Project Workspace tab, same
 * pattern as Team/Timeline/Memories/Files/AI Search: reads GET
 * /audit/project/:projectId only (see services/api/audit-log.service.ts
 * for why the tenant-wide endpoint isn't used here — this app is
 * project-centric, see the F14 sidebar refactor).
 */
export default function ProjectAuditLogsPage() {
  const { id } = useParams<{ id: string }>();

  return <AuditLogsContainer projectId={id} />;
}
