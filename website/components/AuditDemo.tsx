"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronDown,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { refineSwift } from "@/lib/audit/engines/swift-structural";
import {
  detectPatterns,
  getRuleById,
  type PatternMatch,
  RULE_COUNT,
} from "@/lib/audit/patterns";
import { cn } from "@/lib/utils";
import { SAMPLES, type SampleKey } from "./audit-demo-fixtures";
import {
  categoryLabel,
  compareReviewRuns,
  concernFindings,
  groupBySeverity,
} from "./audit-review";

export default function AuditDemo() {
  const [sampleKey, setSampleKey] = useState<SampleKey>("react-bad");
  const [code, setCode] = useState<string>(SAMPLES["react-bad"].code);
  const [filename, setFilename] = useState<string>(
    SAMPLES["react-bad"].filename,
  );
  const [results, setResults] = useState<PatternMatch[] | null>(null);
  const [previousResults, setPreviousResults] = useState<PatternMatch[] | null>(
    null,
  );
  const [hasRun, setHasRun] = useState(false);

  const sample = SAMPLES[sampleKey];

  const handleSampleChange = (key: SampleKey) => {
    setSampleKey(key);
    setCode(SAMPLES[key].code);
    setFilename(SAMPLES[key].filename);
    setResults(null);
    setPreviousResults(null);
    setHasRun(false);
  };

  const handleSourceChange = (nextCode: string) => {
    if (results !== null) setPreviousResults(results);
    setCode(nextCode);
    setResults(null);
    setHasRun(false);
  };

  const handleFilenameChange = (nextFilename: string) => {
    if (results !== null) setPreviousResults(results);
    setFilename(nextFilename);
    setResults(null);
    setHasRun(false);
  };

  const handleRun = () => {
    // Mirror the CLI's tiering so the same code yields the same verdict here.
    // The Swift structural tier is dependency-free and runs in the browser; the
    // ast-tsx tier needs the TypeScript compiler and stays server-side only.
    const base = detectPatterns(code, filename);
    const matches = /\.swift$/.test(filename) ? refineSwift(base, code) : base;
    if (results !== null) setPreviousResults(results);
    setResults(matches);
    setHasRun(true);
  };

  const grouped = useMemo(
    () => (results ? groupBySeverity(results) : null),
    [results],
  );
  const prioritized = useMemo(
    () => (results ? concernFindings(results) : []),
    [results],
  );
  const progress = useMemo(
    () => (results ? compareReviewRuns(results, previousResults) : null),
    [previousResults, results],
  );

  return (
    <section
      id="try-it"
      aria-labelledby="try-it-heading"
      className="scroll-mt-16 py-16 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 text-center sm:mb-12">
          <h2
            id="try-it-heading"
            className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4"
          >
            Review interface code in your browser
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
            Paste a component or choose a sample. Run {RULE_COUNT} local checks,
            review the prioritized findings, and re-run the audit after each
            change.
          </p>
        </div>

        <div className="mb-5 sm:hidden">
          <label
            htmlFor="audit-sample"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Sample to review
          </label>
          <select
            id="audit-sample"
            value={sampleKey}
            onChange={(event) =>
              handleSampleChange(event.target.value as SampleKey)
            }
            className="min-h-11 w-full rounded-xl border border-border bg-background/85 px-3 py-2.5 text-base text-foreground"
          >
            {(Object.keys(SAMPLES) as SampleKey[]).map((key) => (
              <option key={key} value={key}>
                {SAMPLES[key].label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 hidden flex-wrap items-center justify-center gap-2 sm:flex">
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <div>
            <div className="rounded-xl border overflow-hidden bg-[#1d1d1f] dark:bg-[#0a0a0a]">
              <div className="sticky top-16 z-10 flex items-center justify-between border-b border-white/10 bg-[#1d1d1f]/95 px-3 py-2.5 backdrop-blur-xl dark:bg-[#0a0a0a]/95 sm:static sm:px-4">
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Filename"
                    value={filename}
                    onChange={(event) =>
                      handleFilenameChange(event.target.value)
                    }
                    className="bg-transparent text-xs text-white/70 font-mono outline-none focus:text-white"
                  />
                  <span className="text-xs text-white/40">·</span>
                  <span className="text-xs text-white/50">
                    {sample.framework}
                  </span>
                </div>
                <Button size="sm" onClick={handleRun} className="gap-1.5">
                  {hasRun ? (
                    <RotateCcw className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  {hasRun ? "Re-run audit" : "Run audit"}
                </Button>
              </div>
              <textarea
                aria-label="Code to audit"
                value={code}
                onChange={(event) => handleSourceChange(event.target.value)}
                spellCheck={false}
                className="min-h-[300px] w-full resize-none bg-transparent p-4 font-mono text-sm text-white/90 outline-none sm:min-h-[360px]"
              />
            </div>
          </div>

          <div>
            <div className="min-h-[400px] overflow-hidden rounded-xl border bg-background/75 backdrop-blur-xl">
              <div className="px-4 py-2.5 border-b flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Design review
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
                        {grouped.positives.length} positive
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 text-sm">
                <div aria-live="polite">
                  {progress && <ReviewProgressSummary progress={progress} />}
                </div>

                {!hasRun && (
                  <p className="text-muted-foreground italic">
                    Select <span className="font-medium">Run audit</span> to see
                    prioritized findings. The browser runs this audit locally.
                  </p>
                )}

                {grouped &&
                  grouped.critical.length === 0 &&
                  grouped.serious.length === 0 &&
                  grouped.moderate.length === 0 && (
                    <div className="flex items-center gap-2 text-green-400">
                      <Check className="h-4 w-4" />
                      No concerns detected by these rules.
                      {grouped.positives.length > 0 && (
                        <span className="text-muted-foreground ml-1">
                          ({grouped.positives.length} positive pattern
                          {grouped.positives.length === 1 ? "" : "s"})
                        </span>
                      )}
                    </div>
                  )}

                {grouped && (
                  <div className="space-y-4">
                    {prioritized[0] && (
                      <PriorityFinding
                        finding={prioritized[0]}
                        remaining={prioritized.length}
                      />
                    )}
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
                      label="Positive patterns"
                      tone="green"
                      items={grouped.positives}
                      collapsedByDefault
                    />
                  </div>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Uses the shared browser-compatible rules from the{" "}
              <code className="px-1 py-0.5 rounded bg-muted">
                bun run audit
              </code>{" "}
              CLI and the{" "}
              <code className="px-1 py-0.5 rounded bg-muted">hig_audit</code>{" "}
              MCP tool. TypeScript AST checks remain available in the CLI and
              MCP audit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewProgressSummary({
  progress,
}: {
  progress: { resolved: number; introduced: number; unchanged: number };
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2 text-xs">
      <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-green-300">
        {progress.resolved} resolved
      </span>
      <span
        className={cn(
          "rounded-full border px-2.5 py-1",
          progress.introduced > 0
            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
            : "border-border bg-muted/40 text-muted-foreground",
        )}
      >
        {progress.introduced} new
      </span>
      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-muted-foreground">
        {progress.unchanged} remaining
      </span>
    </div>
  );
}

function PriorityFinding({
  finding,
  remaining,
}: {
  finding: PatternMatch;
  remaining: number;
}) {
  const rule = getRuleById(finding.ruleId);
  const severity = finding.severity ?? "moderate";

  return (
    <article className="rounded-xl border border-foreground/15 bg-foreground/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Fix this first
        </span>
        <span className="text-xs text-muted-foreground">1 of {remaining}</span>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="capitalize text-amber-300">{severity}</span>
        <span className="text-foreground/30">·</span>
        <span className="text-muted-foreground">
          {categoryLabel(finding.category)}
        </span>
        <span className="text-foreground/30">·</span>
        <span className="font-mono text-muted-foreground">
          Line {finding.line}
        </span>
      </div>
      <h3 className="text-base font-semibold text-foreground">
        {finding.pattern}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {rule?.fix ??
          "Review this pattern against the linked guidance and replace it with a platform-appropriate implementation."}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {rule?.hig && (
          <a
            href={rule.hig}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-white"
          >
            Open Apple guidance
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
        <span className="font-mono text-[11px] text-muted-foreground">
          {finding.ruleId}
        </span>
      </div>
      <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
        Update the source, then re-run the audit. Automated findings support a
        design review; they do not prove HIG conformance or overall quality.
      </p>
    </article>
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
          <span className="text-xs text-muted-foreground">
            ({items.length})
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <ul className="space-y-2 px-3 pb-3">
          {items.map((match) => {
            const rule = getRuleById(match.ruleId);
            return (
              <li
                key={`${match.ruleId}:${match.line}:${match.lineContent}`}
                className="rounded-md bg-background/40 px-2.5 py-2 text-xs"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-mono text-muted-foreground">
                    L{match.line}
                  </span>
                  <span className="font-medium text-foreground">
                    {match.pattern}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {match.ruleId}
                  </span>
                </div>
                <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                  {match.lineContent}
                </div>
                {match.type === "concern" && rule?.fix && (
                  <p className="mt-2 font-sans leading-relaxed text-muted-foreground">
                    {rule.fix}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
