"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLogin } from "@/features/auth/hooks/use-login";
import {
  authInputClassName,
  authLabelClassName,
  authPasswordToggleClassName,
  authPrimaryButtonClassName,
} from "@/features/auth/auth-form-styles";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";

/**
 * Presentation + form wiring only — the actual request, session storage,
 * and redirect all live in useLogin (docs/coding-standards.md "Business
 * Logic": never place it inside UI components).
 */
export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    mutate(values);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className={authLabelClassName}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          className={authInputClassName}
          // Canonical login-identifier token (web.dev "Sign-in form best
          // practices"): pairs with current-password so real password managers
          // still work, while being the account-username field rather than a
          // generic email/address-autofill field. Does NOT and cannot suppress
          // a credential the browser already saved for this origin.
          autoComplete="username"
          placeholder="you@company.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          disabled={isPending}
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
            autoComplete="current-password"
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

      <Button
        type="submit"
        loading={isPending}
        disabled={isPending}
        className={cn("mt-2 w-full", authPrimaryButtonClassName)}
      >
        Sign in
      </Button>
    </form>
  );
}
