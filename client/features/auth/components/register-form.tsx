"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRegister } from "@/features/auth/hooks/use-register";
import {
  authInputClassName,
  authLabelClassName,
  authPasswordToggleClassName,
  authPrimaryButtonClassName,
} from "@/features/auth/auth-form-styles";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";

/**
 * Presentation + form wiring only — the actual request, session storage,
 * and redirect all live in useRegister (docs/coding-standards.md "Business
 * Logic": never place it inside UI components). Mirrors login-form.tsx's
 * structure and conventions.
 */
export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(
    ({ confirmPassword: _confirmPassword, ...payload }) => {
      mutate(payload);
    },
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className={authLabelClassName}>
          Full name
        </Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Cooper"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          disabled={isPending}
          className={authInputClassName}
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-destructive text-sm">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="companyName" className={authLabelClassName}>
          Company name
        </Label>
        <Input
          id="companyName"
          type="text"
          autoComplete="organization"
          placeholder="Acme Inc."
          aria-invalid={Boolean(errors.companyName)}
          aria-describedby={
            errors.companyName ? "companyName-error" : undefined
          }
          disabled={isPending}
          className={authInputClassName}
          {...register("companyName")}
        />
        {errors.companyName && (
          <p
            id="companyName-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.companyName.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className={authLabelClassName}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          disabled={isPending}
          className={authInputClassName}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-destructive text-sm">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className={authLabelClassName}>
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
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
          <p
            id="password-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword" className={authLabelClassName}>
          Confirm password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? "confirmPassword-error" : undefined
            }
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
          <p
            id="confirmPassword-error"
            role="alert"
            className="text-destructive text-sm"
          >
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
        Create workspace
      </Button>
    </form>
  );
}
