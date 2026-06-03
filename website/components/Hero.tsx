"use client";

import { ArrowRight, Check, Copy, Github } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyStatus } from "@/lib/useCopyToClipboard";
import { cn } from "@/lib/utils";

const terminalLines = [
  { type: "prompt", content: "claude" },
  { type: "blank", content: "" },
  {
    type: "user",
    content: "> How should I design the tab bar for my iPad app?",
  },
  { type: "blank", content: "" },
  { type: "system", content: "Loading hig-components-layout..." },
  { type: "system", content: "Reading references/tab-bars.md" },
  { type: "blank", content: "" },
  { type: "response", content: "Based on Apple's HIG for iPadOS tab bars," },
  {
    type: "response",
    content: "use a sidebar instead of a bottom tab bar.",
  },
  {
    type: "response",
    content: "iPadOS has more screen space, so a sidebar",
  },
  {
    type: "response",
    content: "gives users persistent, scannable navigation.",
  },
] as const;

const INSTALL_COMMAND = "npx skills add raintree-technology/hig-doctor";

export default function Hero({ stars }: { stars: number | null }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion.current) {
      setVisibleLines(terminalLines.length);
      return;
    }

    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= terminalLines.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 350);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(INSTALL_COMMAND);
    setCopied(true);
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section
      aria-labelledby="hero-heading"
      className="pt-32 sm:pt-40 lg:pt-48 pb-20 sm:pb-28"
    >
      <div className="mx-auto max-w-6xl w-full px-6">
        <div className="text-center mb-16">
          <h1
            id="hero-heading"
            className="text-4xl sm:text-6xl lg:text-[80px] font-semibold tracking-[-0.015em] leading-[1.05] mb-5"
          >
            Teach your AI
            <br />
            Apple&apos;s design language
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground font-medium tracking-tight max-w-3xl mx-auto mb-4">
            Give your AI the complete Apple Human Interface Guidelines. No more
            hallucinated patterns. No more wrong-platform advice.
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground/80 tracking-tight max-w-2xl mx-auto mb-8">
            Accurate, platform-specific guidance for iOS, iPadOS, macOS,
            watchOS, and visionOS — without reading 500 pages yourself.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Button size="lg" asChild>
              <a href="#install">
                Install now — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#before-after">See it in action</a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-6">
            <a
              href="https://github.com/raintree-technology/hig-doctor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              Star on GitHub
              {stars !== null && (
                <span className="ml-0.5 inline-flex items-center rounded-full bg-muted/50 px-2 py-0.5 text-xs tabular-nums">
                  {stars.toLocaleString()}
                </span>
              )}
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <span className="text-muted-foreground/30 hidden sm:inline">|</span>
            <a
              href="https://www.producthunt.com/products/apple-hig-skills"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13.6 13.4h-3.1V9h3.1c1.2 0 2.2 1 2.2 2.2s-1 2.2-2.2 2.2zM12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm1.6 16.4h-3.1V16.4 13.4 16.4H7.5V7h6.1c2.3 0 4.2 1.9 4.2 4.2s-1.9 4.2-4.2 4.2z" />
              </svg>
              Product Hunt
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <span className="text-muted-foreground/30 hidden sm:inline">|</span>
            <span className="text-sm text-muted-foreground">
              14 skills. 156 HIG reference topics.
            </span>
          </div>

          <div className="inline-flex items-center gap-2 max-w-full">
            <code className="px-4 py-2.5 rounded-lg border bg-muted/50 text-sm font-mono text-muted-foreground overflow-x-auto min-w-0">
              npx skills add raintree-technology/hig-doctor
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              aria-label="Copy install command"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <CopyStatus active={copied} />
          </div>
        </div>

        {/* Terminal demo */}
        <div
          className="max-w-3xl mx-auto rounded-xl border glass overflow-hidden shadow-lg"
          role="img"
          aria-label="Terminal showing Claude Code loading HIG skills to answer a design question about iPad tab bars"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]/80" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]/80" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]/80" />
            </div>
            <span className="flex-1 text-center text-xs text-muted-foreground font-medium">
              Claude Code
            </span>
            <div className="w-[54px]" />
          </div>
          <div className="p-5 sm:p-6 font-mono text-sm leading-relaxed min-h-[240px] bg-[#1d1d1f] dark:bg-[#0a0a0a]">
            {terminalLines.slice(0, visibleLines).map((line, i) => (
              <div
                key={i}
                className={cn(
                  "mb-0.5",
                  line.type === "prompt" && "text-white",
                  line.type === "user" && "text-white font-medium",
                  line.type === "system" && "text-white/60",
                  line.type === "response" && "text-white/80",
                  line.type === "blank" && "h-5",
                )}
              >
                {line.type === "prompt" && (
                  <span className="text-white/60">$ </span>
                )}
                {line.content}
              </div>
            ))}
            {visibleLines < terminalLines.length ? (
              <span
                className="inline-block w-2 h-4 bg-white/60 animate-pulse"
                aria-hidden="true"
              />
            ) : visibleLines > 0 ? (
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className="text-white/30 text-xs">
                  ${" "}
                  <span className="inline-block w-1.5 h-3.5 bg-white/40 align-text-bottom animate-pulse" />
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
