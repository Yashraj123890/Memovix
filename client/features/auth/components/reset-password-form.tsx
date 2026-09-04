"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  authAccentLinkClassName,
  authInputClassName,
  authLabelClassName,
  authPasswordToggleClassName,
  authPrimaryButtonClassName,
} from "@/features/auth/auth-form-styles";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/reset-password.schema";
import { getErrorMessage } from "@/utils/error";
import { LOGIN_ROUTE } from "@/constants/routes";

interface ResetPasswordFormProps {
  token: string;
}

const GENERIC_RESET_ERROR = "Unable to reset your password. Please try again.";

/**
 * Defense-in-depth: the backend already returns clean messages, but never let a
 * raw DB/Prisma/stack-trace string reach the UI. Show the backend's message
 * only when it looks like a real user-facing sentence; otherwise fall back to a
 * generic message.
 */
function friendlyResetError(error: unknown): string {
  const message = getErrorMessage(error);
  if (
    !message ||
    message.length > 160 ||
    /prisma|invocation|postgres|row-level security|rls|\bat\s|\n/i.test(message)
  ) {
    return GENERIC_RESET_ERROR;
  }
  return message;
}

/**
 * New-password form for /reset-password/[token]. On submit it posts the token
 * from the URL plus the new password to the real backend endpoint; the token is
 * validated server-side (single-use + expiry). Success and token errors both
 * render inline here — the page never 404s or crashes.
 */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const reset = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(({ password }) => {
    reset.mutate({ token, password });
  });

  // Success — the token is now consumed; send the user to sign in.
  if (reset.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bg-success/10 text-success flex size-12 items-center justify-center rounded-full">
          <CheckCircle2Icon className="size-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-foreground text-sm font-medium">Password updated</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Your password has been changed. You can now sign in with your new password.
          </p>
        </div>
        <Button asChild className={cn("w-full", authPrimaryButtonClassName)}>
          <Link href={LOGIN_ROUTE}>Continue to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className={authLabelClassName}>
          New password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Enter a new password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            disabled={reset.isPending}
            className={cn("pr-10", authInputClassName)}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={authPasswordToggleClassName}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={reset.isPending}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOffIcon className="size-4" aria-hidden="true" />
            ) : (
              <EyeIcon className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" role="alert" className="text-destructive text-sm">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword" className={authLabelClassName}>
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
          disabled={reset.isPending}
          className={authInputClassName}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p id="confirm-error" role="alert" className="text-destructive text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {reset.isError && (
        <p role="alert" className="text-destructive text-sm">
          {friendlyResetError(reset.error)}
        </p>
      )}

      <Button
        type="submit"
        loading={reset.isPending}
        disabled={reset.isPending}
        className={cn("mt-1 w-full", authPrimaryButtonClassName)}
      >
        Reset password
      </Button>

      <p className="text-center text-sm">
        <Link href={LOGIN_ROUTE} className={authAccentLinkClassName}>
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
