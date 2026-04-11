"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

const ENDPOINT = process.env.NEXT_PUBLIC_EMAIL_ENDPOINT;
const GITHUB_URL = "https://github.com/raintree-technology/apple-hig-skills";

export default function UpdateNotify() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const endpoint = ENDPOINT?.trim();
  const isConfigured = Boolean(endpoint);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || status === "loading" || status === "success") return;
      if (!endpoint) return;

      setStatus("loading");
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error();
        setStatus("success");
      } catch {
        setStatus("error");
      }
    },
    [email, status, endpoint],
  );

  if (!isConfigured) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 bg-card/30 px-4 py-3 text-sm text-muted-foreground">
        Email updates aren&apos;t configured on this deployment yet. Follow the{" "}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          GitHub repo
          <span className="sr-only"> (opens in new tab)</span>
        </a>{" "}
        for updates.
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
        <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
        <span>
          You&apos;re on the list. We&apos;ll email you when HIG skills are
          updated.
        </span>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Get notified when we update for new Apple releases.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          aria-label="Email address for update notifications"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          type="submit"
          size="sm"
          disabled={status === "loading"}
          className="shrink-0"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Notify me
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </form>
      {status === "error" && (
        <p className="text-sm text-red-400 mt-2">
          Something went wrong. Try again.
        </p>
      )}
    </div>
  );
}
