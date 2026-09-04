import type { UserRole } from "@/constants/roles";

/**
 * Response shape of the /users/me/profile endpoints. `avatarUrl` is a
 * short-lived signed URL derived server-side from the stored avatar (the raw
 * storage key is never exposed); null when the user has no photo. title/about
 * are optional free-text profile fields.
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string | null;
  about: string | null;
  avatarUrl: string | null;
}
