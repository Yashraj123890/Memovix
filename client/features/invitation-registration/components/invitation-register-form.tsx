"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/shared/error-state";
import { cn } from "@/lib/utils";
import {
  authInputClassName,
  authLabelClassName,
  authPasswordToggleClassName,
  authPrimaryButtonClassName,
} from "@/features/auth/auth-form-styles";
import {
  invitationRegisterSchema,
  type InvitationRegisterFormValues,
} from "@/features/invitation-registration/schemas/invitation-register.schema";
import { getErrorMessage } from "@/utils/error";

/**
 * Payload every invitation-registration mutation accepts. Both
 * useClientRegisterMutation and useMemberRegisterMutation post this exact
 * shape ({ token, name, password }) — the token comes from the URL, so it
 * is supplied by the page, not typed into the form.
 */
export interface InvitationRegisterPayload {
  token: string;
  name: string;
  password: string;
}

/**
 * The subset of a TanStack `useMutation` result this form drives. Kept as a
 * minimal structural interface (rather than importing UseMutationResult) so
 * the client and member register hooks can both satisfy it without the form
 * knowing about either endpoint's response type.
 */
export interface InvitationRegisterMutation {
  mutate: (payload: InvitationRegisterPayload) => void;
  isPending: boolean;
  isError: boolean;
  error: unknown;
}

interface InvitationRegisterFormProps {
  token: string;
  mutation: InvitationRegisterMutation;
  /** Field id prefix so multiple forms never collide on the page (and for stable a11y ids). */
  idPrefix?: string;
  submitLabel?: string;
}

/**
 * Presentation + form wiring shared by both invitation self-registration
 * pages — /client/register/:token and /member/register/:token. Same
 * split as RegisterForm (features/auth): the request, session storage and
 * redirect all live in the mutation passed in, so this component is
 * endpoint-agnostic. Differs from RegisterForm in two ways: no
 * email/companyName fields (the email is fixed by the invitation the token
 * points at, not re-entered here), and a persistent inline ErrorState above
 * the form on failure — worth the extra visibility beyond the app-wide
 * toast because errors here are often terminal (invitation expired, already
 * used, already registered) rather than something to just retry blindly.
 */
export function InvitationRegisterForm({
  token,
  mutation,
  idPrefix = "invitation",
  submitLabel = "Accept invitation",
}: InvitationRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate, isPending, isError, error } = mutation;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvitationRegisterFormValues>({
    resolver: zodResolver(invitationRegisterSchema),
    defaultValues: { name: "", password: "", confirmPassword: "" },
  });

  const nameId = `${idPrefix}-name`;
  const passwordId = `${idPrefix}-password`;
  const confirmPasswordId = `${idPrefix}-confirm-password`;

  const onSubmit = handleSubmit(({ name, password }) => {
    mutate({ token, name, password });
  });

  return (
    <div className="flex flex-col gap-5">
      {isError && (
        <ErrorState
          title="Couldn't accept this invitation"
          description={getErrorMessage(error)}
          className="py-8"
        />
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor={nameId} className={authLabelClassName}>
            Full name
          </Label>
          <Input
            id={nameId}
            type="text"
            autoComplete="name"
            placeholder="Jane Cooper"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            disabled={isPending}
            className={authInputClassName}
            {...register("name")}
          />
          {errors.name && (
            <p id={`${nameId}-error`} role="alert" className="text-destructive text-sm">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={passwordId} className={authLabelClassName}>
            Password
          </Label>
          <div className="relative">
            <Input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? `${passwordId}-error` : undefined}
              disabled={isPending}
              className={cn("pr-10", authInputClassName)}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={authPasswordToggleClassName}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isPending}
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
            <p id={`${passwordId}-error`} role="alert" className="text-destructive text-sm">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={confirmPasswordId} className={authLabelClassName}>
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id={confirmPasswordId}
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? `${confirmPasswordId}-error` : undefined}
              disabled={isPending}
              className={cn("pr-10", authInputClassName)}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className={authPasswordToggleClassName}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              disabled={isPending}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="size-4" aria-hidden="true" />
              ) : (
                <EyeIcon className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id={`${confirmPasswordId}-error`} role="alert" className="text-destructive text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          loading={isPending}
          disabled={isPending}
          className={cn("mt-2 w-full", authPrimaryButtonClassName)}
        >
          {submitLabel}
        </Button>
      </form>
    </div>
  );
}
