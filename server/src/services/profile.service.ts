import { randomUUID } from "node:crypto";

import { ProfileRepository } from "../repositories/profile.repository";
import { StorageProvider, S3StorageProvider } from "../storage";

interface ProfileRow {
    id: string;
    name: string;
    email: string;
    role: string;
    title: string | null;
    about: string | null;
    avatarKey: string | null;
}

export interface ProfileDto {
    id: string;
    name: string;
    email: string;
    role: string;
    title: string | null;
    about: string | null;
    /** Signed URL derived from avatarKey on read; null when no photo is set. */
    avatarUrl: string | null;
}

// Avatars stay rendered (e.g. in the header) far longer than a one-off
// download, so their signed URL gets a longer life than the 15-minute default.
const AVATAR_URL_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * Self-service user profile (title/about + avatar photo). Reuses the existing
 * S3 StorageProvider for the photo — no separate upload system. avatarKey is
 * never returned to the client; only a freshly-signed avatarUrl is.
 */
export class ProfileService {
    constructor(
        private readonly profileRepository = new ProfileRepository(),
        private readonly storageProvider: StorageProvider = new S3StorageProvider()
    ) {}

    async getProfile(userId: string): Promise<ProfileDto> {
        const user = await this.profileRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return this.toDto(user);
    }

    async updateProfile(
        userId: string,
        input: { title?: string | null; about?: string | null }
    ): Promise<ProfileDto> {
        const data: { title?: string | null; about?: string | null } = {};
        // Trim; an empty string clears the field back to the not-set state.
        if (input.title !== undefined) data.title = normalize(input.title);
        if (input.about !== undefined) data.about = normalize(input.about);

        const user = await this.profileRepository.updateProfile(userId, data);
        return this.toDto(user);
    }

    async updateAvatar(
        userId: string,
        file: { buffer: Buffer; mimeType: string },
        extension: string
    ): Promise<ProfileDto> {
        const previous = await this.profileRepository.findById(userId);
        if (!previous) {
            throw new Error("User not found");
        }

        const storageKey = `avatars/${userId}/${randomUUID()}.${extension}`;
        await this.storageProvider.upload(
            { data: file.buffer, contentType: file.mimeType },
            storageKey
        );

        const user = await this.profileRepository.setAvatarKey(userId, storageKey);

        // Best-effort cleanup of the replaced object; never fail the request on it.
        if (previous.avatarKey && previous.avatarKey !== storageKey) {
            try {
                await this.storageProvider.delete(previous.avatarKey);
            } catch {
                // ignore
            }
        }

        return this.toDto(user);
    }

    private async toDto(user: ProfileRow): Promise<ProfileDto> {
        const avatarUrl = user.avatarKey
            ? await this.storageProvider.getSignedUrl(user.avatarKey, {
                  expiresInSeconds: AVATAR_URL_TTL_SECONDS,
              })
            : null;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            title: user.title,
            about: user.about,
            avatarUrl,
        };
    }
}

function normalize(value: string | null): string | null {
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}
