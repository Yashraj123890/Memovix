import prisma from "../lib/prisma";

/**
 * Server-side allowlist for refresh tokens (blueprint §13.1), following the same
 * repository pattern as PasswordResetRepository. One row per issued refresh
 * token, keyed by `jtiHash` = sha256(jti). The raw jti and the raw token are
 * NEVER persisted — the caller hashes the jti (auth/jwt.ts `hashToken`) before
 * calling in, so this repository only ever sees the hash. The auth flow that
 * calls these methods lands in Phase 2.
 */
export class RefreshTokenRepository {
  create(data: {
    jtiHash: string;
    userId: string;
    expiresAt: Date;
    activeTenantId?: string | null;
  }) {
    return prisma.refreshToken.create({ data });
  }

  findByJtiHash(jtiHash: string) {
    return prisma.refreshToken.findUnique({ where: { jtiHash } });
  }

  /** Update the active workspace on a live session row (M11 workspace switch). */
  setActiveTenant(jtiHash: string, activeTenantId: string) {
    return prisma.refreshToken.updateMany({
      where: { jtiHash, revokedAt: null },
      data: { activeTenantId },
    });
  }

  /** Revoke a single token (logout, or the old token during rotation). */
  revokeByJtiHash(jtiHash: string, replacedById?: string) {
    return prisma.refreshToken.updateMany({
      where: { jtiHash, revokedAt: null },
      data: { revokedAt: new Date(), ...(replacedById ? { replacedById } : {}) },
    });
  }

  /** Revoke every active token for a user (global logout / replay defense). */
  revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Rotate atomically: create the successor row and revoke the presented (old)
   * token in a single transaction, linking the old row to its successor for
   * replay auditing.
   */
  rotate(
    oldJtiHash: string,
    next: { jtiHash: string; userId: string; expiresAt: Date; activeTenantId?: string | null },
  ) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({ data: next });

      await tx.refreshToken.updateMany({
        where: { jtiHash: oldJtiHash, revokedAt: null },
        data: { revokedAt: new Date(), replacedById: created.id },
      });

      return created;
    });
  }

  deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
