"use client";

import type { ComponentType } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InvitationRegisterForm,
  type InvitationRegisterMutation,
} from "@/features/invitation-registration/components/invitation-register-form";
import {
  authCardClassName,
  authCardDescriptionClassName,
  authCardTitleClassName,
} from "@/features/auth/auth-form-styles";

interface InvitationRegisterCardProps {
  /** A lucide-react icon component (e.g. Users, Briefcase). */
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  subtitle: string;
  token: string;
  mutation: InvitationRegisterMutation;
  /** Field id prefix passed through to the shared form (keeps a11y ids unique per role). */
  idPrefix: string;
  submitLabel?: string;
}

/**
 * The whole invitation-registration card — icon badge, role-specific
 * title/subtitle, and the shared InvitationRegisterForm — configured
 * entirely by props. Both /member/register/:token and /client/register/:token
 * render this exact component with different copy/icons, so the Card chrome
 * and the form live in one place and can never drift between the two flows.
 */
export function InvitationRegisterCard({
  icon: Icon,
  title,
  subtitle,
  token,
  mutation,
  idPrefix,
  submitLabel,
}: InvitationRegisterCardProps) {
  return (
    <Card className={authCardClassName}>
      <CardHeader>
        <div className="bg-primary/10 text-primary mb-2 flex size-11 items-center justify-center rounded-lg">
          <Icon className="size-5" aria-hidden={true} />
        </div>
        <CardTitle className={authCardTitleClassName}>{title}</CardTitle>
        <CardDescription className={authCardDescriptionClassName}>
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <InvitationRegisterForm
          token={token}
          mutation={mutation}
          idPrefix={idPrefix}
          submitLabel={submitLabel}
        />
      </CardContent>
    </Card>
  );
}
