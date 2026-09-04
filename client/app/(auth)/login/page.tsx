import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { RequireGuest } from "@/features/auth/components/require-guest";
import {
  authAccentLinkClassName,
  authCardClassName,
  authCardDescriptionClassName,
  authCardTitleClassName,
  authFooterTextClassName,
} from "@/features/auth/auth-form-styles";
import { cn } from "@/lib/utils";
import { REGISTER_ROUTE } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Sign in · Memovix",
  description: "Sign in to your Memovix workspace.",
};

export default function LoginPage() {
  return (
    <RequireGuest>
      <Card className={authCardClassName}>
        <CardHeader>
          <CardTitle className={authCardTitleClassName}>Welcome back</CardTitle>
          <CardDescription className={authCardDescriptionClassName}>
            Sign in to your Memovix workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className={cn("mt-6 text-center text-sm", authFooterTextClassName)}>
            Don&apos;t have a workspace yet?{" "}
            <Link href={REGISTER_ROUTE} className={authAccentLinkClassName}>
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </RequireGuest>
  );
}
