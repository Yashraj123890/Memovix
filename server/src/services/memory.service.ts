import { MemoryCategory } from "@prisma/client";
import { MemoryRepository } from "../repositories/memory.repository";
import { ProjectRepository } from "../repositories/project.repository";
import { TimelineService } from "./timeline.service";
import notificationService from "./notification.service";
import { NotificationType } from "@prisma/client";
import searchableIndexService from "./searchableIndex.service";
import { SearchableSourceType } from "@prisma/client";
import auditService from "./audit.service";

export class MemoryService {
    private memoryRepository = new MemoryRepository();
    private projectRepository = new ProjectRepository();
    private timelineService = new TimelineService();

    async createMemory(data: {
    title: string;
    content: string;
    category: MemoryCategory;
    customCategory?: string | null;
    projectId: string;
    createdById: string;
    tenantId: string;
}) {

    // Validate title
    if (!data.title.trim()) {
        throw new Error("Memory title is required");
    }

    // Validate content
    if (!data.content.trim()) {
        throw new Error("Memory content is required");
    }

    const customCategory = data.customCategory?.trim() || null;
    if (data.category === MemoryCategory.OTHER && !customCategory) {
        throw new Error("Custom category is required");
    }

    // Check if project exists in the current tenant
    const project = await this.projectRepository.findById(
        data.projectId,
        data.tenantId
    );

    if (!project) {
        throw new Error("Project not found");
    }

   const memory = await this.memoryRepository.create({
    title: data.title,
    content: data.content,
    category: data.category,
    customCategory:
        data.category === MemoryCategory.OTHER ? customCategory : null,
    projectId: data.projectId,
    createdById: data.createdById,
});
// Unified retrieval index sync (best-effort — never fails the write). This is
// now the ONLY embedding path for memories; the legacy MemoryEmbedding write was
// retired in P3 (the table is kept but idle).
await searchableIndexService.syncSafe(SearchableSourceType.MEMORY, memory.id);
await notificationService.createNotification({
 userId: data.createdById,
  projectId: memory.projectId,
  type: NotificationType.MEMORY_CREATED,
  title: "New Memory Created",
  message: `A new memory "${memory.title}" was added.`,
});
console.log("✅ Memory created:", memory);

await this.timelineService.createEvent({
    projectId: data.projectId,
    userId: data.createdById,
    action: "MEMORY_CREATED",
    description: `Created memory: ${data.title}`,
});

console.log("✅ Timeline event created");
console.log("🚀 Creating audit log...");
await auditService.createLog({
    tenantId: data.tenantId,
    userId: memory.createdById,
    projectId: memory.projectId,

    action: "MEMORY_CREATED",

    entityType: "MEMORY",
    entityId: memory.id,

    details: {
        title: memory.title,
        category: memory.category,
    },
});
console.log("✅ Audit log created");
return memory;
}

    async getProjectMemories(projectId: string) {
        return this.memoryRepository.findAllByProject(projectId);
    }

    async getMemoryById(memoryId: string) {
        const memory = await this.memoryRepository.findById(memoryId);

        if (!memory) {
            throw new Error("Memory not found");
        }

        return memory;
    }

   async updateMemory(
    memoryId: string,
    tenantId: string,
    data: {
        title?: string;
        content?: string;
        category?: MemoryCategory;
        customCategory?: string | null;
    }
) {

        const memory = await this.memoryRepository.findById(memoryId);

        if (!memory) {
            throw new Error("Memory not found");
        }

        const nextCategory = data.category ?? memory.category;
        const nextCustomCategory =
            data.customCategory === undefined
                ? memory.customCategory
                : data.customCategory?.trim() || null;

        if (nextCategory === MemoryCategory.OTHER && !nextCustomCategory) {
            throw new Error("Custom category is required");
        }

        const updatedMemory = await this.memoryRepository.update(memoryId, {
            ...data,
            customCategory:
                nextCategory === MemoryCategory.OTHER ? nextCustomCategory : null,
        });

        // Re-sync the unified retrieval index on any edit (content or metadata).
        // This is the sole embedding path for memories (P3 retired the legacy
        // MemoryEmbedding re-embed).
        await searchableIndexService.syncSafe(SearchableSourceType.MEMORY, updatedMemory.id);

await this.timelineService.createEvent({
    projectId: memory.projectId,
    userId: memory.createdById,
    action: "MEMORY_UPDATED",
    description: `Updated memory: ${updatedMemory.title}`,
});
await auditService.createLog({
  tenantId,
    userId: memory.createdById,
    projectId: memory.projectId,

    action: "MEMORY_UPDATED",

    entityType: "MEMORY",
    entityId: memory.id,

    details: {
        title: updatedMemory.title,
        category: updatedMemory.category,
    },
});
return updatedMemory;
    }

  async deleteMemory(
    memoryId: string,
    tenantId: string
) {
    const memory = await this.memoryRepository.findById(memoryId);

    if (!memory) {
        throw new Error("Memory not found");
    }

    await this.timelineService.createEvent({
        projectId: memory.projectId,
        userId: memory.createdById,
        action: "MEMORY_DELETED",
        description: `Deleted memory: ${memory.title}`,
    });

    await auditService.createLog({
        tenantId,
        userId: memory.createdById,
        projectId: memory.projectId,

        action: "MEMORY_DELETED",

        entityType: "MEMORY",
        entityId: memory.id,

        details: {
            title: memory.title,
            category: memory.category,
        },
    });

    await this.memoryRepository.delete(memoryId);

    // Drop the memory's chunks from the unified retrieval index (best-effort).
    await searchableIndexService.removeSafe(SearchableSourceType.MEMORY, memoryId);

    return;
}
    async searchMemories(projectId: string, query: string) {

        if (!query.trim()) {
            throw new Error("Search query is required");
        }

        return this.memoryRepository.search(projectId, query);
    }
    
}
