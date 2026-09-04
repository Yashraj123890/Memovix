import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  JwtPayload,
} from "../auth/jwt";
import { RefreshTokenRepository } from "../repositories/refreshToken.repository";
import { AuthRepository } from "../repositories/auth.repository";
import { UserRole } from "@prisma/client";
import { workspaceService, WorkspaceSummary } from "./workspace.service";

export interface IssuedSession {
  accessToken: string;
  refreshToken: string;
}

/**
 * Single home for the access + refresh token lifecycle (blueprint §13.1). Every
 * authentication entry point (login, register, member/client invite acceptance)
 * issues a session here, so there is exactly one token system. Cookie handling
 * stays in the controllers (it needs the Response); this service owns only the
 * token + server-side session-row logic.
 */
export class SessionService {
  constructor(
    private readonly refreshTokenRepository = new RefreshTokenRepository(),
    private readonly authRepository = new AuthRepository(),
  ) {}

  /**
   * Issue a fresh access token + refresh token, recording the refresh session.
   * `opts.activeTenantId` persists the session's active workspace (M11, clients);
   * null for owners/members, whose refresh falls back to user.tenantId.
   */
  async issue(
    claims: JwtPayload,
    opts?: { activeTenantId?: string | null },
  ): Promise<IssuedSession> {
    const accessToken = signAccessToken(claims);
    const { token: refreshToken, jti, expiresAt } = signRefreshToken(claims.userId);

    await this.refreshTokenRepository.create({
      jtiHash: hashToken(jti),
      userId: claims.userId,
      expiresAt,
      activeTenantId: opts?.activeTenantId ?? null,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verify a refresh token, rotate it, and mint a new access token. Rotation
   * revokes the presented token and issues a new one; presenting an already-
   * revoked token (replay) revokes every session for that user.
   */
  async refresh(rawRefreshToken: string | undefined): Promise<{
    session: IssuedSession;
    user: { id: string; name: string; email: string; role: string; tenantId: string };
  }> {
    if (!rawRefreshToken) {
      throw new Error("Refresh token missing");
    }

    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new Error("Invalid refresh token");
    }

    const jtiHash = hashToken(payload.jti);
    const row = await this.refreshTokenRepository.findByJtiHash(jtiHash);

    if (!row) {
      throw new Error("Invalid refresh token");
    }

    // Replay of an already-rotated/revoked token → revoke the whole family.
    if (row.revokedAt) {
      await this.refreshTokenRepository.revokeAllForUser(row.userId);
      throw new Error("Refresh token already used");
    }

    if (row.expiresAt < new Date()) {
      throw new Error("Refresh token expired");
    }

    // Fresh claims from the DB — role/tenant can change, user can be deactivated.
    const user = await this.authRepository.findUserById(row.userId);
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    // M11: resolve the session's active workspace. Owners/members are unchanged
    // (always user.tenantId). For clients we RE-VALIDATE membership on every
    // refresh: keep the active workspace if still a member, auto-switch to
    // another accessible workspace if access was revoked, or terminate the
    // session (null) if none remain.
    const activeTenantId = await workspaceService.resolveActiveForRefresh(
      user,
      row.activeTenantId,
    );
    if (activeTenantId === null) {
      // The client has no accessible workspace left → end every session for them
      // (nothing is valid anywhere) and force a fresh login.
      await this.refreshTokenRepository.revokeAllForUser(user.id);
      throw new Error("No accessible workspace");
    }

    const { token: newRefreshToken, jti: newJti, expiresAt } = signRefreshToken(user.id);
    await this.refreshTokenRepository.rotate(jtiHash, {
      jtiHash: hashToken(newJti),
      userId: user.id,
      expiresAt,
      activeTenantId,
    });

    const accessToken = signAccessToken({
      userId: user.id,
      tenantId: activeTenantId,
      role: user.role,
    });

    return {
      session: { accessToken, refreshToken: newRefreshToken },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: activeTenantId,
      },
    };
  }

  /** Minimal workspace list for the authenticated user (M11 picker). */
  async listWorkspaces(userId: string): Promise<WorkspaceSummary[]> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) return [];
    return workspaceService.listForUser({
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });
  }

  /**
   * Switch the CURRENT session's active workspace (M11, clients only). Validates
   * authoritative membership, persists the choice on the session row so it
   * survives refresh, and returns a new access token scoped to the target.
   */
  async switchWorkspace(
    userId: string,
    targetTenantId: string,
    rawRefreshToken: string | undefined,
  ): Promise<{
    accessToken: string;
    user: { id: string; name: string; email: string; role: UserRole; tenantId: string };
  }> {
    const user = await this.authRepository.findUserById(userId);
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }
    if (user.role !== UserRole.CLIENT) {
      throw new Error("Only client accounts can switch workspaces.");
    }
    if (!(await workspaceService.isClientMemberOf(user.id, targetTenantId))) {
      throw new Error("You do not have access to that workspace.");
    }

    // Persist on the current session row so refresh keeps the new workspace.
    if (rawRefreshToken) {
      try {
        const payload = verifyRefreshToken(rawRefreshToken);
        await this.refreshTokenRepository.setActiveTenant(
          hashToken(payload.jti),
          targetTenantId,
        );
      } catch {
        // Invalid/expired cookie — the access token still switches for this
        // request; the next refresh re-resolves from the (unchanged) row.
      }
    }

    const accessToken = signAccessToken({
      userId: user.id,
      tenantId: targetTenantId,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: targetTenantId,
      },
    };
  }

  /** Best-effort logout: revoke the presented refresh token server-side. */
  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;
    try {
      const payload = verifyRefreshToken(rawRefreshToken);
      await this.refreshTokenRepository.revokeByJtiHash(hashToken(payload.jti));
    } catch {
      // Invalid/expired token — nothing to revoke; the cookie is cleared anyway.
    }
  }
}

export const sessionService = new SessionService();
