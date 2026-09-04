"use client";

import { useParams } from "next/navigation";
import { TeamContainer } from "@/features/team/components/team-container";

/**
 * "/projects/[id]/team" — F10 replaces the F6 placeholder with the real
 * project team directory, browsing/search/add/remove against the new
 * ProjectMember backend API.
 */
export default function ProjectTeamPage() {
  const { id } = useParams<{ id: string }>();

  return <TeamContainer projectId={id} />;
}
