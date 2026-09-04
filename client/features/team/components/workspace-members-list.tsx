import { WorkspaceMemberRow } from "@/features/team/components/workspace-member-row";
import type { WorkspaceMember } from "@/types/team";

interface WorkspaceMembersListProps {
  members: WorkspaceMember[];
}

/** Same full-bleed-row-inside-a-padded-card pattern as TeamList/FileList. */
export function WorkspaceMembersList({ members }: WorkspaceMembersListProps) {
  return (
    <ul className="divide-border -mx-6 flex flex-col divide-y">
      {members.map((member) => (
        <WorkspaceMemberRow key={member.id} member={member} />
      ))}
    </ul>
  );
}
