import type { WorkspaceMember, ProjectMember } from "@/types/team";

/** Workspace members not already on this project — candidates for the Add Member modal. */
export function getAddableMembers(
  workspaceMembers: WorkspaceMember[],
  projectMembers: ProjectMember[],
): WorkspaceMember[] {
  const existingUserIds = new Set(projectMembers.map((member) => member.userId));
  return workspaceMembers.filter((member) => !existingUserIds.has(member.id));
}
