"use client";

import { Button } from "@workspace/ui/components/button";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const COPIED_RESET_MS = 1500;

interface CopyButtonProps {
  label?: string;
  value: string;
}

/**
 * Icon-only button that copies `value` to the clipboard and briefly swaps its
 * icon to a check. Fails silently when the Clipboard API is unavailable
 * (e.g. insecure/non-loopback contexts) and announces state to screen readers.
 */
export const CopyButton = ({
  value,
  label = "Copy command to clipboard",
}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard write can reject in restricted contexts — fail silently.
    }
  };

  return (
    <Button
      aria-label={label}
      onClick={handleCopy}
      size="icon"
      type="button"
      variant="ghost"
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </Button>
  );
};
