"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfile } from "@/features/settings/hooks/use-update-profile";
import type { UserProfile } from "@/types/profile";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile | undefined;
}

/** Edit the current user's Title and About (PATCH /users/me/profile). */
export function ProfileEditDialog({ open, onOpenChange, profile }: ProfileEditDialogProps) {
  const update = useUpdateProfile();
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");

  // Seed the form from the latest profile each time the dialog opens.
  useEffect(() => {
    if (open) {
      setTitle(profile?.title ?? "");
      setAbout(profile?.about ?? "");
    }
  }, [open, profile]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    update.mutate(
      { title, about },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update your title and a short about.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-title">Title</Label>
            <Input
              id="profile-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              placeholder="e.g. Founder, Project Manager, Designer"
              disabled={update.isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-about">About</Label>
            <Textarea
              id="profile-about"
              rows={4}
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              maxLength={1000}
              placeholder="A short description about you."
              disabled={update.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={update.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={update.isPending}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
