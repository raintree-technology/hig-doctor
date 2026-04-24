"use client";

import { AlertTriangle, Check, ChevronDown, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { detectPatterns, type PatternMatch, type Severity } from "@/lib/audit/patterns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SampleKey = "swiftui-bad" | "swiftui-good" | "react-bad" | "react-good" | "html-bad";

interface Sample {
  label: string;
  framework: string;
  filename: string;
  code: string;
}

const SAMPLES: Record<SampleKey, Sample> = {
  "swiftui-bad": {
    label: "SwiftUI (common mistakes)",
    framework: "SwiftUI",
    filename: "ContentView.swift",
    code: `import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("Welcome")
                    .foregroundColor(.red)
                    .font(.system(size: 28))

                Image(systemName: "star.fill")

                Button("Tap me") {
                    print("tapped")
                }
                .onTapGesture {
                    action()
                }
            }
        }
    }
}`,
  },
  "swiftui-good": {
    label: "SwiftUI (HIG-aligned)",
    framework: "SwiftUI",
    filename: "ContentView.swift",
    code: `import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            VStack {
                Text("Welcome")
                    .foregroundStyle(.primary)
                    .font(.largeTitle)

                Image(systemName: "star.fill")
                    .accessibilityLabel("Favorite")
                    .accessibilityHint("Marks this item as a favorite")

                Button("Tap me", action: handleTap)
                    .buttonStyle(.borderedProminent)
            }
        }
    }
}`,
  },
  "react-bad": {
    label: "React (common mistakes)",
    framework: "React / Next.js",
    filename: "Hero.tsx",
    code: `export function Hero() {
  return (
    <div className="flex">
      <img src="/hero.png" />
      <div onClick={open} style={{ color: "#ff0000" }}>
        <h1 style={{ fontSize: "13px" }}></h1>
        <a href="/learn">click here</a>
      </div>
      <video src="/demo.mp4" autoPlay />
      <button onMouseOver={preview} tabIndex={3}></button>
    </div>
  );
}`,
  },
  "react-good": {
    label: "React (HIG-aligned)",
    framework: "React / Next.js",
    filename: "Hero.tsx",
    code: `export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="flex">
      <img src="/hero.png" alt="Product hero shot showing the dashboard" />
      <div>
        <h1 id="hero-title" className="text-foreground">Welcome</h1>
        <a href="/learn" aria-label="Learn more about the product">
          Read the overview
        </a>
      </div>
      <video src="/demo.mp4" controls>
        <track kind="captions" src="/demo.vtt" srcLang="en" label="English" />
      </video>
      <button
        onFocus={preview}
        onMouseOver={preview}
        aria-label="Preview"
      >
        <span aria-hidden="true">👁</span>
      </button>
    </section>
  );
}`,
  },
  "html-bad": {
    label: "HTML (common mistakes)",
    framework: "HTML",
    filename: "index.html",
    code: `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, user-scalable=no" />
    <style>
      body { overflow: hidden; }
      a:hover { color: red; }
      button:focus { outline: none; }
      .price { font-size: 10px; text-align: justify; }
    </style>
  </head>
  <body>
    <img src="/banner.jpg">
    <div class="nav">
      <div onClick="go('/a')">A</div>
      <h2></h2>
    </div>
    <marquee>Sale!</marquee>
  </body>
</html>`,
  },
};

function severityFor(match: PatternMatch): Severity | null {
  return match.severity ?? null;
}

function groupBySeverity(matches: PatternMatch[]): {
  critical: PatternMatch[];
  serious: PatternMatch[];
  moderate: PatternMatch[];
  positives: PatternMatch[];
} {
  const critical: PatternMatch[] = [];
  const serious: PatternMatch[] = [];
  const moderate: PatternMatch[] = [];
  const positives: PatternMatch[] = [];

  for (const m of matches) {
    if (m.type === "positive") {
      positives.push(m);
      continue;
    }
    if (m.type !== "concern") continue;
    const sev = severityFor(m);
    if (sev === "critical") critical.push(m);
    else if (sev === "serious") serious.push(m);
    else moderate.push(m);
  }

  return { critical, serious, moderate, positives };
}

export default function AuditDemo() {
  const [sampleKey, setSampleKey] = useState<SampleKey>("react-bad");
  const [code, setCode] = useState<string>(SAMPLES["react-bad"].code);
  const [filename, setFilename] = useState<string>(SAMPLES["react-bad"].filename);
  const [results, setResults] = useState<PatternMatch[] | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const sample = SAMPLES[sampleKey];

  const handleSampleChange = (key: SampleKey) => {
    setSampleKey(key);
    setCode(SAMPLES[key].code);
    setFilename(SAMPLES[key].filename);
    setResults(null);
    setHasRun(false);
  };

  const handleRun = () => {
    const matches = detectPatterns(code, filename);
    setResults(matches);
    setHasRun(true);
  };

  const grouped = useMemo(
    () => (results ? groupBySeverity(results) : null),
    [results],
  );

  return (
    <section
      id="try-it"
      aria-labelledby="try-it-heading"
      className="py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2
            id="try-it-heading"
            className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4"
          >
            Try the audit in your browser
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Paste a component or pick a sample. The audit runs locally, in your
            browser, against the same 349 rules the CLI and MCP server use.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          {(Object.keys(SAMPLES) as SampleKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSampleChange(key)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                key === sampleKey
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {SAMPLES[key].label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="rounded-xl border overflow-hidden bg-[#1d1d1f] dark:bg-[#0a0a0a]">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="bg-transparent text-xs text-white/70 font-mono outline-none focus:text-white"
                  />
                  <span className="text-xs text-white/40">·</span>
                  <span className="text-xs text-white/50">{sample.framework}</span>
                </div>
                <Button size="sm" onClick={handleRun} className="gap-1.5">
                  <Play className="h-3.5 w-3.5" />
                  Run audit
                </Button>
              </div>
              <textarea
                aria-label="Code to audit"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setResults(null);
                  setHasRun(false);
                }}
                spellCheck={false}
                className="w-full bg-transparent text-white/90 font-mono text-sm p-4 outline-none resize-none min-h-[360px]"
              />
            </div>
          </div>

          <div>
            <div className="rounded-xl border overflow-hidden min-h-[400px]">
              <div className="px-4 py-2.5 border-b flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Findings
                </span>
                {grouped && (
                  <div className="flex items-center gap-3 text-xs">
                    {grouped.critical.length > 0 && (
                      <span className="text-red-400">
                        {grouped.critical.length} critical
                      </span>
                    )}
                    {grouped.serious.length > 0 && (
                      <span className="text-amber-400">
                        {grouped.serious.length} serious
                      </span>
                    )}
                    {grouped.moderate.length > 0 && (
                      <span className="text-amber-300/80">
                        {grouped.moderate.length} moderate
                      </span>
                    )}
                    {grouped.positives.length > 0 && (
                      <span className="text-green-400">
                        {grouped.positives.length} good
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 text-sm">
                {!hasRun && (
                  <p className="text-muted-foreground italic">
                    Click <span className="font-medium">Run audit</span> to see
                    detected HIG patterns. No code leaves your browser.
                  </p>
                )}

                {grouped && grouped.critical.length === 0 && grouped.serious.length === 0 && grouped.moderate.length === 0 && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="h-4 w-4" />
                    Clean — no HIG concerns detected.
                    {grouped.positives.length > 0 && (
                      <span className="text-muted-foreground ml-1">
                        ({grouped.positives.length} positive{grouped.positives.length === 1 ? "" : "s"})
                      </span>
                    )}
                  </div>
                )}

                {grouped && (
                  <div className="space-y-4">
                    <FindingBucket
                      label="Critical"
                      tone="red"
                      items={grouped.critical}
                    />
                    <FindingBucket
                      label="Serious"
                      tone="amber"
                      items={grouped.serious}
                    />
                    <FindingBucket
                      label="Moderate"
                      tone="amber"
                      items={grouped.moderate}
                    />
                    <FindingBucket
                      label="Good practices"
                      tone="green"
                      items={grouped.positives}
                      collapsedByDefault
                    />
                  </div>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Same detection engine as the{" "}
              <code className="px-1 py-0.5 rounded bg-muted">bun run audit</code>{" "}
              CLI and the{" "}
              <code className="px-1 py-0.5 rounded bg-muted">hig_audit</code>{" "}
              MCP tool.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FindingBucket({
  label,
  tone,
  items,
  collapsedByDefault,
}: {
  label: string;
  tone: "red" | "amber" | "green";
  items: PatternMatch[];
  collapsedByDefault?: boolean;
}) {
  const [open, setOpen] = useState(!collapsedByDefault);

  if (items.length === 0) return null;

  const toneClasses = {
    red: "text-red-400 border-red-500/30",
    amber: "text-amber-400 border-amber-500/30",
    green: "text-green-400 border-green-500/30",
  }[tone];

  return (
    <div className={cn("rounded-lg border", toneClasses, "border-opacity-40")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          {tone === "red" && <AlertTriangle className="h-3.5 w-3.5" />}
          {tone === "amber" && <AlertTriangle className="h-3.5 w-3.5" />}
          {tone === "green" && <Check className="h-3.5 w-3.5" />}
          {label}
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <ul className="px-3 pb-3 space-y-1.5">
          {items.map((m, i) => (
            <li key={i} className="text-xs font-mono">
              <span className="text-muted-foreground">L{m.line}</span>
              <span className="mx-2 text-foreground/60">·</span>
              <span className="text-foreground">{m.pattern}</span>
              <div className="ml-6 mt-0.5 text-muted-foreground truncate">
                {m.lineContent}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
