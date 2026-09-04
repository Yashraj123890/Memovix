"use client";

import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import {
  authCardClassName,
  authCardDescriptionClassName,
  authCardTitleClassName,
} from "@/features/auth/auth-form-styles";

/**
 * "/reset-password/:token" — the target of the link in the password-reset email
 * (server/src/services/passwordReset.service.ts builds
 * `${FRONTEND_URL}/reset-password/${token}`). Deliberately NOT wrapped in
 * RequireGuest: the user may still be signed in when they open the email link,
 * and the reset must still work. Token validity is checked server-side on
 * submit, so an invalid/expired/used token surfaces as an inline error here
 * rather than a 404.
 */
export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();

  return (
    <Card className={authCardClassName}>
      <CardHeader>
        <CardTitle className={authCardTitleClassName}>
          Reset your password
        </CardTitle>
        <CardDescription className={authCardDescriptionClassName}>
          Choose a new password for your Memovix account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={token} />
      </CardContent>
    </Card>
  );
}
