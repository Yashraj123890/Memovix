import { MemoryCard } from "@/features/memories/components/memory-card";
import type { Memory } from "@/types/memory";

interface MemoryListProps {
  memories: Memory[];
  projectId: string;
}

export function MemoryList({ memories, projectId }: MemoryListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {memories.map((memory) => (
        <MemoryCard key={memory.id} memory={memory} projectId={projectId} />
      ))}
    </div>
  );
}
