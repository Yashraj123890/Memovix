"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
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
import { useInviteMemberMutation } from "@/features/team/hooks/use-invite-member-mutation";
import { inviteMemberSchema, type InviteMemberFormValues } from "@/features/team/schemas/invite-member.schema";

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Sends a workspace-level invitation by email (POST /api/members/invite) —
 * this invites someone into the tenant, not directly onto this project.
 * Once they accept, add them to this project's roster with "Add member"
 * (which pulls from workspace members). Role is shown as a fixed badge,
 * not a select: the backend always creates invited members with role
 * MEMBER, there's nothing to choose.
 */
export function InviteMemberModal({ open, onOpenChange }: InviteMemberModalProps) {
  const { mutate, isPending } = useInviteMemberMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
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
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>
              Send a workspace invitation. They&apos;ll be added to your team once they accept.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              autoComplete="off"
              placeholder="jane@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "invite-email-error" : undefined}
              disabled={isPending}
              {...register("email")}
            />
            {errors.email && (
              <p id="invite-email-error" role="alert" className="text-destructive text-sm">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Role</Label>
            <div>
              <Badge variant="secondary">Member</Badge>
            </div>
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
