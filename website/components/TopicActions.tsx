"use client";

import { Check, Copy, FileCode2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

/**
 * Agent-oriented actions for a topic: copy the canonical markdown (served by
 * /raw/[slug]) or open it directly. Copying fetches the same text an agent
 * would retrieve, including source attribution.
 */
export default function TopicActions({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    const getText = async () => {
      const res = await fetch(`/raw/${slug}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    };
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        // Promise-backed ClipboardItem keeps the user-gesture activation alive
        // across the fetch — required for Safari, where fetch-then-writeText
        // fails once the gesture expires.
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": getText().then(
              (t) => new Blob([t], { type: "text/plain" }),
            ),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(await getText());
      }
      setState("copied");
    } catch {
      setState("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2500);
  }, [slug]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
      >
        {state === "copied" ? (
          <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {state === "copied" ? "Copied for your agent" : "Copy as Markdown"}
      </button>
      <a
        href={`/raw/${slug}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
      >
        <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
        View as Markdown
      </a>
      <span aria-live="polite" className="sr-only">
        {state === "copied" ? "Markdown copied to clipboard" : ""}
        {state === "error" ? "Copy failed" : ""}
      </span>
      {state === "error" && (
        <span className="text-sm text-red-400">
          Couldn’t copy — open the Markdown view instead.
        </span>
      )}
    </div>
  );
}
