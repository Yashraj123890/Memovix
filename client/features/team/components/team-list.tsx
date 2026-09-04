import { TeamMemberRow } from "@/features/team/components/team-member-row";
import type { ProjectMember } from "@/types/team";

interface TeamListProps {
  members: ProjectMember[];
  projectId: string;
}

/** Same full-bleed-row-inside-a-padded-card pattern as FileList (F9). */
export function TeamList({ members, projectId }: TeamListProps) {
  return (
    <ul className="divide-border -mx-6 flex flex-col divide-y">
      {members.map((member) => (
        <TeamMemberRow key={member.id} member={member} projectId={projectId} />
      ))}
    </ul>
  );
}
