"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useInviteClientMutation } from "@/features/clients/hooks/use-invite-client-mutation";
import { inviteClientSchema, type InviteClientFormValues } from "@/features/clients/schemas/invite-client.schema";

interface InviteClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

/**
 * Sends a project-scoped client invitation by email
 * (POST /projects/:projectId/invite-client) — an email is now actually
 * dispatched (server/src/services/clientInvitation.service.ts calls
 * EmailService.sendClientInvitation), unlike when this was first audited.
 * Same email-only shape as InviteMemberModal (features/team) since the
 * backend only accepts { email } here too.
 */
export function InviteClientModal({ open, onOpenChange, projectId }: InviteClientModalProps) {
  const { mutate, isPending } = useInviteClientMutation(projectId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteClientFormValues>({
    resolver: zodResolver(inviteClientSchema),
    defaultValues: { email: "" },
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset();
    }
    onOpenChange(next);
  }

  const onSubmit = handleSubmit((values) => {
    mutate(values.email, { onSuccess: () => handleOpenChange(false) });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Invite client</DialogTitle>
            <DialogDescription>
              Send an invitation to this project. They&apos;ll get access once they accept.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="client-invite-email">Email address</Label>
            <Input
              id="client-invite-email"
              type="email"
              autoComplete="off"
              placeholder="client@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "client-invite-email-error" : undefined}
              disabled={isPending}
              {...register("email")}
            />
            {errors.email && (
              <p id="client-invite-email-error" role="alert" className="text-destructive text-sm">
                {errors.email.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending} disabled={isPending}>
              Send invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
