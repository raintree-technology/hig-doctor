"use client";

import { Check, Copy } from "lucide-react";
import { CopyStatus, useCopyToClipboard } from "@/lib/useCopyToClipboard";

export default function TopicCopyButton({ text }: { text: string }) {
  const { copied, copy } = useCopyToClipboard();
  const isCopied = copied !== null;

  return (
    <>
      <button
        type="button"
        onClick={() => copy(text)}
        className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
        aria-label="Copy install command"
      >
        {isCopied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
      <CopyStatus active={isCopied} />
    </>
  );
}
