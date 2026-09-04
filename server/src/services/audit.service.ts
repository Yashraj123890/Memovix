import { AuditRepository } from "../repositories/audit.repository";

const auditRepository = new AuditRepository();

class AuditService {

    async createLog(data: {
        tenantId: string;
        userId?: string;
        projectId?: string;
        action: string;
        entityType: string;
        entityId?: string;
        details?: any;
    }) {

        return auditRepository.create(data);

    }

    async getProjectLogs(projectId: string) {

        return auditRepository.findByProject(projectId);

    }

    async getTenantLogs(tenantId: string) {

        return auditRepository.findByTenant(tenantId);

    }

}

export default new AuditService();