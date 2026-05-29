"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Clipboard copy with an auto-resetting "copied" marker. `copied` holds the id
 * of the most-recently-copied item (or null) so a single hook can drive several
 * buttons. Pair with <CopyStatus> for an accessible, announced success state.
 */
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    (text: string, id = "default") => {
      navigator.clipboard?.writeText(text);
      setCopied(id);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), resetMs);
    },
    [resetMs],
  );

  return { copied, copy };
}

/**
 * Visually-hidden polite live region. Screen readers announce copy success
 * here — putting aria-live on the button itself does NOT reliably announce a
 * change to that button's own aria-label, so the success was previously silent
 * to assistive tech.
 */
export function CopyStatus({ active }: { active: boolean }) {
  return (
    <span aria-live="polite" aria-atomic="true" className="sr-only">
      {active ? "Copied to clipboard" : ""}
    </span>
  );
}
