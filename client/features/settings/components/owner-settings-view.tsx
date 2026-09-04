"use client";

import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  BookOpenIcon,
  BugIcon,
  KeyRoundIcon,
  LogOutIcon,
  MailIcon,
  PencilIcon,
  UploadIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useRequestPasswordReset } from "@/features/settings/hooks/use-request-password-reset";
import { useCurrentWorkspace } from "@/features/settings/hooks/use-current-workspace";
import { useProfile } from "@/features/settings/hooks/use-profile";
import { useUploadAvatar } from "@/features/settings/hooks/use-upload-avatar";
import { ProfileEditDialog } from "@/features/settings/components/profile-edit-dialog";
import type { UserRole } from "@/constants/roles";

const ROLE_LABEL: Record<UserRole, string> = {
  OWNER: "Owner",
  MEMBER: "Member",
  CLIENT: "Client",
};

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

// Optional support inbox. When set, Contact Support / Report a Problem open a
// real mailto; when unset the actions are honestly disabled (there is no
// support/ticketing backend). Configure via NEXT_PUBLIC_SUPPORT_EMAIL.
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

/**
 * Account / Security / Workspace settings for the signed-in user (any role).
 * Every field is real authenticated data; every action maps to an existing
 * backend capability. Profile photo, Title and About persist via the
 * /users/me/profile endpoints; password reset and logout reuse the auth flow.
 *
 * Role-gating: the profile/security surfaces are the same for everyone (they're
 * per-user, not workspace-management), but workspace-internal details are hidden
 * from a CLIENT — the "Owner" row is OWNER-only, and the raw Workspace ID is
 * shown to OWNER/MEMBER (useful for support) but not to a client, for whom it's
 * an internal identifier with no relevance.
 */
export function OwnerSettingsView() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const requestReset = useRequestPasswordReset();
  const { workspace, isLoading: workspaceLoading } = useCurrentWorkspace();
  const { data: profile } = useProfile();
  const uploadAvatar = useUploadAvatar();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  if (!user) return null;

  const roleLabel = ROLE_LABEL[user.role] ?? user.role;
  const isClient = user.role === "CLIENT";
  const avatarSrc = preview ?? profile?.avatarUrl ?? undefined;

  function handlePickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Please choose a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    // Show the chosen image immediately, then persist it.
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    uploadAvatar.mutate(file, {
      onSettled: () => {
        setPreview(null);
        URL.revokeObjectURL(objectUrl);
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account and workspace.</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Your profile information.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Avatar
              src={avatarSrc}
              alt={user.name}
              fallback={initials(user.name)}
              className="size-16"
            />
            <div className="flex flex-col items-start gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePickFile}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={uploadAvatar.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="size-4" aria-hidden="true" />
                Change photo
              </Button>
              <span className="text-muted-foreground text-xs">JPG, PNG or WEBP, up to 5 MB.</span>
            </div>
          </div>

          <Separator />

          <InfoRow label="Full name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Role">
            <Badge variant="secondary">{roleLabel}</Badge>
          </InfoRow>
          <InfoRow label="Title" value={profile?.title || undefined} placeholder="Not set" />
          <InfoRow label="About" value={profile?.about || undefined} placeholder="Not set" multiline />

          <div>
            <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <PencilIcon className="size-4" aria-hidden="true" />
              Edit profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security</CardTitle>
          <CardDescription>Manage your password and sessions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SettingRow
            title="Change password"
            description={`We’ll email a secure reset link to ${user.email}.`}
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={requestReset.isPending}
                onClick={() => requestReset.mutate(user.email)}
              >
                <KeyRoundIcon className="size-4" aria-hidden="true" />
                Send reset link
              </Button>
            }
          />

          <Separator />

          <SettingRow
            title="Log out"
            description="Sign out of Memovix on this device."
            action={
              <Button type="button" variant="outline" size="sm" onClick={() => void logout()}>
                <LogOutIcon className="size-4" aria-hidden="true" />
                Log out
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Help Center */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Help Center</CardTitle>
          <CardDescription>Guidance and support for using Memovix.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <BookOpenIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-foreground text-sm font-medium">Help &amp; Documentation</p>
              <p className="text-muted-foreground text-sm">
                Find guidance for using Memovix — projects, deliverables, memory and search.
                In-app documentation is coming soon.
              </p>
            </div>
          </div>

          <Separator />

          <SettingRow
            title="Contact Support"
            description={
              SUPPORT_EMAIL
                ? `Reach our team at ${SUPPORT_EMAIL}.`
                : "Get help with your account and workspace."
            }
            action={
              <SupportMailButton
                icon={<MailIcon className="size-4" aria-hidden="true" />}
                label="Contact support"
                subject="Memovix support request"
              />
            }
          />

          <Separator />

          <SettingRow
            title="Report a Problem"
            description="Tell us about a bug or something that isn’t working."
            action={
              <SupportMailButton
                icon={<BugIcon className="size-4" aria-hidden="true" />}
                label="Report a problem"
                subject="Memovix bug report"
              />
            }
          />

          {!SUPPORT_EMAIL && (
            <p className="text-muted-foreground text-xs">
              Contact Support and Report a Problem aren’t available yet — a support inbox
              hasn’t been set up.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Workspace */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace</CardTitle>
          <CardDescription>Details about your current workspace.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <InfoRow
            label="Workspace name"
            value={workspaceLoading ? "Loading…" : (workspace?.name ?? "—")}
          />
          {user.role === "OWNER" && <InfoRow label="Owner" value={user.name} />}
          {/* Raw tenant id is an internal identifier — useful to OWNER/MEMBER for
              support, not relevant to a CLIENT. */}
          {!isClient && <InfoRow label="Workspace ID" value={user.tenantId ?? "—"} mono />}
        </CardContent>
      </Card>

      <ProfileEditDialog open={editOpen} onOpenChange={setEditOpen} profile={profile} />
    </div>
  );
}

function initials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

function InfoRow({
  label,
  value,
  children,
  mono,
  multiline,
  placeholder,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
  mono?: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  const isEmpty = !children && !value;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      {children ??
        (isEmpty ? (
          <span className="text-muted-foreground text-sm">{placeholder ?? "—"}</span>
        ) : (
          <span
            className={
              mono
                ? "text-foreground font-mono text-sm break-all"
                : multiline
                  ? "text-foreground text-sm whitespace-pre-wrap"
                  : "text-foreground text-sm"
            }
          >
            {value}
          </span>
        ))}
    </div>
  );
}

function SupportMailButton({
  icon,
  label,
  subject,
}: {
  icon: ReactNode;
  label: string;
  subject: string;
}) {
  if (!SUPPORT_EMAIL) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        {icon}
        {label}
      </Button>
    );
  }

  const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  return (
    <Button asChild variant="outline" size="sm">
      <a href={href}>
        {icon}
        {label}
      </a>
    </Button>
  );
}

function SettingRow({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-foreground text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
