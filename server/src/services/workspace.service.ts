import prisma from "../lib/prisma";
import { runWithTenantContext } from "../lib/tenant-context";
import { UserRole } from "@prisma/client";

export interface WorkspaceSummary {
    tenantId: string;
    name: string;
    role: UserRole;
}

interface UserLike {
    id: string;
    email: string;
    tenantId: string;
    role: UserRole;
}

/**
 * Client workspace discovery (M11, client-only multi-workspace).
 *
 * ISOLATED here on purpose: the workspace-LIST data source is a temporary
 * implementation and must be swappable without changing the API/controllers/
 * frontend. Two deliberately separate concerns:
 *
 *  - listForUser(): the DISPLAY list for the picker. TEMPORARY — derived from
 *    accepted client_invitations (invitation HISTORY, not authoritative
 *    membership). SWAP POINT: replace `listClientWorkspaces` with an
 *    authoritative ProjectClient-derived query later; keep the return shape.
 *  - isClientMemberOf(): AUTHORITATIVE membership check via ProjectClient, used
 *    for every authorization decision (switch, refresh re-validation).
 */
export class WorkspaceService {
    /** Minimal picker data ({id,name,role} only) for the authenticated user. */
    async listForUser(user: UserLike): Promise<WorkspaceSummary[]> {
        if (user.role !== UserRole.CLIENT) {
            // Owners/members belong to exactly one workspace.
            const name = await this.tenantName(user.tenantId);
            return name ? [{ tenantId: user.tenantId, name, role: user.role }] : [];
        }
        return this.listClientWorkspaces(user.email);
    }

    /** Authoritative: does this client currently hold a project in the tenant? */
    async isClientMemberOf(userId: string, tenantId: string): Promise<boolean> {
        const count = await runWithTenantContext({ tenantId }, async () =>
            prisma.projectClient.count({ where: { clientId: userId } })
        );
        return count > 0;
    }

    /**
     * Active workspace for a freshly issued client session: home tenant if still
     * a member, else the first authoritative membership, else home (degenerate:
     * a client with no current memberships).
     */
    async defaultActiveWorkspace(user: UserLike): Promise<string> {
        if (user.role !== UserRole.CLIENT) return user.tenantId;
        if (await this.isClientMemberOf(user.id, user.tenantId)) return user.tenantId;
        const first = await this.firstValidWorkspace(user);
        return first ?? user.tenantId;
    }

    /**
     * Active workspace for a refresh: validate the desired one; if access was
     * revoked, auto-switch to another authoritative membership; `null` ⇒ the
     * client has no accessible workspace left (caller terminates the session).
     */
    async resolveActiveForRefresh(user: UserLike, desiredTenantId: string | null): Promise<string | null> {
        if (user.role !== UserRole.CLIENT) return user.tenantId; // owners/members unchanged
        const desired = desiredTenantId ?? user.tenantId;
        if (await this.isClientMemberOf(user.id, desired)) return desired;
        return this.firstValidWorkspace(user);
    }

    // --- internals -----------------------------------------------------------

    /** First workspace the client authoritatively still belongs to (or null). */
    private async firstValidWorkspace(user: UserLike): Promise<string | null> {
        for (const w of await this.listClientWorkspaces(user.email)) {
            if (await this.isClientMemberOf(user.id, w.tenantId)) return w.tenantId;
        }
        return null;
    }

    /**
     * SWAP POINT (temporary): client workspaces from accepted invitations. Read
     * WITHOUT an active-tenant scope so all of the client's workspaces are
     * visible; the permissive RLS policies on client_invitations/tenants allow
     * this and the query is scoped to the caller's own email. Returns only the
     * minimum ({id,name,role}) — no invitation history is exposed.
     */
    private async listClientWorkspaces(email: string): Promise<WorkspaceSummary[]> {
        const rows = await runWithTenantContext({}, async () =>
            prisma.$queryRaw<{ tenantId: string; name: string }[]>`
                SELECT DISTINCT ci."tenantId" AS "tenantId", t."name" AS "name"
                FROM "client_invitations" ci
                JOIN "tenants" t ON t."id" = ci."tenantId"
                WHERE ci."email" = ${email} AND ci."status" = 'ACCEPTED'
                ORDER BY t."name"`
        );
        return rows.map((r) => ({
            tenantId: r.tenantId,
            name: r.name,
            role: UserRole.CLIENT,
        }));
    }

    /** Tenant name read within its own context (permissive tenants policy). */
    private async tenantName(tenantId: string): Promise<string | null> {
        const t = await runWithTenantContext({ tenantId }, async () =>
            prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } })
        );
        return t?.name ?? null;
    }
}

export const workspaceService = new WorkspaceService();
