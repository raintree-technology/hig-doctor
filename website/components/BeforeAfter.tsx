"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const examples = [
  {
    id: "ipad-nav",
    label: "iPad navigation",
    question: "How should I handle navigation in my iPad app?",
    without: {
      lines: [
        "Based on common iOS patterns, you should",
        "use a UITabBarController with bottom tabs",
        "for your main navigation. Add 3-5 tabs for",
        "your key sections. You can also add a",
        "hamburger menu for additional options.",
      ],
      problems: [
        "Applies iOS phone patterns to iPad",
        "Suggests hamburger menus (Apple discourages these)",
        "No mention of iPadOS-specific conventions",
      ],
    },
    with: {
      lines: [
        "Per Apple's HIG for iPadOS, use a sidebar",
        "instead of a bottom tab bar. iPadOS has more",
        "screen space, so a sidebar gives users",
        "persistent, scannable navigation.",
        "",
        "Use a split view with a two- or three-column",
        "layout. The sidebar should collapse on compact",
        "widths and support iPad multitasking.",
      ],
      strengths: [
        "Knows iPadOS uses sidebars, not tab bars",
        "References split views and multitasking",
        "Cites the specific HIG topic",
      ],
    },
  },
  {
    id: "dark-mode",
    label: "Dark mode",
    question: "How should I implement dark mode in my app?",
    without: {
      lines: [
        "To add dark mode, create a toggle in your",
        "settings screen. Define a dark color palette",
        "with a dark gray background (#1a1a1a) and",
        "white text. Swap colors based on the user's",
        "preference using a theme provider.",
      ],
      problems: [
        "Suggests hard-coded hex colors instead of semantic tokens",
        "Misses system appearance, materials, and vibrancy",
        "No mention of elevated surfaces or Dark Mode testing",
      ],
    },
    with: {
      lines: [
        "Per Apple's HIG, use semantic system colors",
        "(like .systemBackground, .label) that adapt",
        "automatically. Never hard-code color values.",
        "",
        "Use material backgrounds for depth, support",
        "vibrancy for layered content, and test both",
        "appearances. Elevated surfaces should use",
        "lighter backgrounds in Dark Mode.",
      ],
      strengths: [
        "Uses Apple's semantic color system",
        "Covers materials, vibrancy, and elevation",
        "Follows actual HIG Dark Mode specification",
      ],
    },
  },
  {
    id: "notifications",
    label: "Notifications",
    question: "How should I design notifications for my app?",
    without: {
      lines: [
        "Use push notifications to keep users engaged.",
        "Send a welcome notification after install,",
        "then daily reminders about new content.",
        "Include deep links to drive users back to",
        "your app and boost retention.",
      ],
      problems: [
        "Treats notifications as a retention tool, not a communication tool",
        "No mention of notification grouping or categories",
        "Ignores Apple's guidance on respecting user attention",
      ],
    },
    with: {
      lines: [
        "Per Apple's HIG, notifications should provide",
        "useful, timely information — not marketing.",
        "Group related notifications and support",
        "notification actions for quick responses.",
        "",
        "Use provisional authorization to let users",
        "try your notifications before committing.",
        "Never send notifications just for engagement.",
      ],
      strengths: [
        "Prioritizes user attention over engagement",
        "Covers grouping, actions, and authorization",
        "Aligns with App Review expectations",
      ],
    },
  },
];

function TerminalDots() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-full bg-[#ff5f57]/80" />
      <div className="w-3 h-3 rounded-full bg-[#febc2e]/80" />
      <div className="w-3 h-3 rounded-full bg-[#28c840]/80" />
    </div>
  );
}

export default function BeforeAfter() {
  const [activeExample, setActiveExample] = useState(0);
  const example = examples[activeExample];

  return (
    <section
      id="before-after"
      aria-labelledby="before-after-heading"
      className="py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2
            id="before-after-heading"
            className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4"
          >
            See the difference
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Same question. Same AI. The only difference is whether it has
            Apple&apos;s actual guidelines or not.
          </p>
        </div>

        {/* Example selector */}
        <div
          className="flex items-center justify-center gap-1 mb-8 mx-auto w-full rounded-full bg-muted/30 p-1 sm:w-auto"
          role="tablist"
          aria-label="Comparison examples"
        >
          {examples.map((ex, i) => (
            <button
              key={ex.id}
              type="button"
              role="tab"
              aria-selected={i === activeExample}
              onClick={() => setActiveExample(i)}
              className={cn(
                "flex-1 sm:flex-none px-3.5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                i === activeExample
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Question */}
        <p className="text-center text-sm text-muted-foreground mb-6 italic">
          &ldquo;{example.question}&rdquo;
        </p>

        {/* Comparison grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Without */}
          <div>
            <div className="rounded-xl border border-red-500/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-red-500/20 bg-red-500/5">
                <TerminalDots />
                <span className="flex-1 text-center text-xs font-medium flex items-center justify-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 text-red-400" />
                  <span className="text-red-400">Without HIG Doctor</span>
                </span>
                <div className="w-[54px]" />
              </div>
              <div className="p-5 sm:p-6 font-mono text-sm leading-relaxed bg-[#1d1d1f] dark:bg-[#0a0a0a] min-h-[180px]">
                {example.without.lines.map((line, i) => (
                  <div
                    key={i}
                    className={cn("text-white/70", line === "" && "h-5")}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
            <ul
              className="mt-4 space-y-2 px-1"
              aria-label="Problems with generic response"
            >
              {example.without.problems.map((problem) => (
                <li
                  key={problem}
                  className="flex items-start gap-2 text-sm text-red-300/80"
                >
                  <X className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                  {problem}
                </li>
              ))}
            </ul>
          </div>

          {/* With */}
          <div>
            <div className="rounded-xl border border-green-500/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-green-500/20 bg-green-500/5">
                <TerminalDots />
                <span className="flex-1 text-center text-xs font-medium flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">With HIG Doctor</span>
                </span>
                <div className="w-[54px]" />
              </div>
              <div className="p-5 sm:p-6 font-mono text-sm leading-relaxed bg-[#1d1d1f] dark:bg-[#0a0a0a] min-h-[180px]">
                {example.with.lines.map((line, i) => (
                  <div
                    key={i}
                    className={cn("text-white/80", line === "" && "h-5")}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
            <ul
              className="mt-4 space-y-2 px-1"
              aria-label="Strengths of HIG Doctor response"
            >
              {example.with.strengths.map((strength) => (
                <li
                  key={strength}
                  className="flex items-start gap-2 text-sm text-green-300/80"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400 mt-0.5" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mt-10">
          <Button size="lg" asChild>
            <a href="#install">
              Get these answers in your project
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
