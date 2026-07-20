"use client";

import { Check, Copy } from "lucide-react";
import { CopyStatus, useCopyToClipboard } from "@/lib/useCopyToClipboard";

/** Code block with a copy affordance, matching the Install section's pattern. */
export default function McpCodeBlock({ children }: { children: string }) {
  const { copied, copy } = useCopyToClipboard();
  const isCopied = copied !== null;

  return (
    <div className="relative group">
      <pre className="overflow-x-auto rounded-xl border bg-[#1d1d1f] px-4 py-3.5 pr-12 text-sm leading-7 text-white/85">
        <code>{children}</code>
      </pre>
      <button
        type="button"
        onClick={() => copy(children)}
        className="absolute right-2 top-2 p-2 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Copy command"
      >
        {isCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
      <CopyStatus active={isCopied} />
    </div>
  );
}
