"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/features/ai-workspace/utils/copy-to-clipboard";

interface CopyButtonProps {
  text: string;
  label?: string;
}

/**
 * Shared "Copy" action for every AI report card (Summary, Requirements,
 * Comparison, Scope). Shows a brief checkmark + "Copied" state instead of
 * only relying on the toast, so the confirmation is visible even if the
 * user's attention is on the button itself.
 *
 * The revert-to-idle timer is tracked in a ref and cleared on unmount —
 * without that, copying then immediately navigating away (or a regenerate
 * clearing `content` out from under this button) would still fire
 * `setCopied` after the component is gone.
 */
export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    const succeeded = await copyToClipboard(text);
    if (succeeded) {
      setCopied(true);
      toast.success("Copied to clipboard");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopied(false), 1800);
    } else {
      toast.error("Couldn't copy to clipboard");
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
      {copied ? <CheckIcon className="size-3.5" aria-hidden="true" /> : <CopyIcon className="size-3.5" aria-hidden="true" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
