import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/features/auth/components/register-form";
import { RequireGuest } from "@/features/auth/components/require-guest";
import {
  authAccentLinkClassName,
  authCardClassName,
  authCardDescriptionClassName,
  authCardTitleClassName,
  authFooterTextClassName,
} from "@/features/auth/auth-form-styles";
import { cn } from "@/lib/utils";
import { LOGIN_ROUTE } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Create your workspace · Memovix",
  description: "Create a Memovix workspace for your team.",
};

export default function RegisterPage() {
  return (
    <RequireGuest>
      <Card className={authCardClassName}>
        <CardHeader>
          <CardTitle className={authCardTitleClassName}>
            Create your workspace
          </CardTitle>
          <CardDescription className={authCardDescriptionClassName}>
            Set up Memovix for your team in a couple of minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className={cn("mt-6 text-center text-sm", authFooterTextClassName)}>
            Already have a workspace?{" "}
            <Link href={LOGIN_ROUTE} className={authAccentLinkClassName}>
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </RequireGuest>
  );
}
