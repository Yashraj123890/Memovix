import prisma from "../lib/prisma";

/**
 * User self-profile reads/writes (Settings > Account). Every method is keyed by
 * the caller's own userId — the service only ever passes req.user.userId, so a
 * user can never read or mutate another user's profile through here.
 */
const PROFILE_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    title: true,
    about: true,
    avatarKey: true,
} as const;

export class ProfileRepository {
    findById(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: PROFILE_SELECT,
        });
    }

    updateProfile(userId: string, data: { title?: string | null; about?: string | null }) {
        return prisma.user.update({
            where: { id: userId },
            data,
            select: PROFILE_SELECT,
        });
    }

    setAvatarKey(userId: string, avatarKey: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { avatarKey },
            select: PROFILE_SELECT,
        });
    }
}
