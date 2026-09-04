import prisma from "../lib/prisma";

export class PasswordResetRepository {
    async create(data: {
        token: string;
        userId: string;
        expiresAt: Date;
    }) {
        return prisma.passwordResetToken.create({
            data,
        });
    }

    async findByToken(token: string) {
        return prisma.passwordResetToken.findUnique({
            where: { token },
            include: {
                user: true,
            },
        });
    }

    async markUsed(id: string) {
        return prisma.passwordResetToken.update({
            where: { id },
            data: {
                used: true,
            },
        });
    }

    async deleteExpired() {
        return prisma.passwordResetToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }

    async invalidateUserTokens(userId: string) {
        return prisma.passwordResetToken.updateMany({
            where: {
                userId,
                used: false,
            },
            data: {
                used: true,
            },
        });
    }
}