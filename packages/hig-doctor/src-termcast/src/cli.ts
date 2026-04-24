#!/usr/bin/env bun
// cli.ts — CLI entry point for hig-doctor audit
import { audit } from "./audit";
import type { Severity } from "./patterns";
import { writeFile } from "node:fs/promises";
import { join, resolve, basename } from "node:path";

// ── ANSI helpers ──────────────────────────────────────────────────────
const isTTY = process.stderr.isTTY ?? false;
const c = {
  reset:   isTTY ? "\x1b[0m" : "",
  bold:    isTTY ? "\x1b[1m" : "",
  dim:     isTTY ? "\x1b[2m" : "",
  green:   isTTY ? "\x1b[32m" : "",
  yellow:  isTTY ? "\x1b[33m" : "",
  red:     isTTY ? "\x1b[31m" : "",
  cyan:    isTTY ? "\x1b[36m" : "",
  magenta: isTTY ? "\x1b[35m" : "",
  blue:    isTTY ? "\x1b[34m" : "",
  white:   isTTY ? "\x1b[37m" : "",
  bgGreen: isTTY ? "\x1b[42m\x1b[30m" : "",
  bgYellow: isTTY ? "\x1b[43m\x1b[30m" : "",
  bgRed:   isTTY ? "\x1b[41m\x1b[37m" : "",
};

function severityBadge(critical: number, serious: number, moderate: number): string {
  if (critical > 0) return `${c.bgRed} ${critical} critical ${c.reset}`;
  if (serious > 0) return `${c.bgYellow} ${serious} serious ${c.reset}`;
  if (moderate > 0) return `${c.bgYellow} ${moderate} moderate ${c.reset}`;
  return `${c.bgGreen} clean ${c.reset}`;
}

function parseFailOn(flags: Set<string>, args: string[]): Severity | null {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--fail-on" && i + 1 < args.length) {
      const v = args[i + 1];
      if (v === "critical" || v === "serious" || v === "moderate") return v;
      process.stderr.write(`${c.red}Error:${c.reset} --fail-on must be critical|serious|moderate\n`);
      process.exit(2);
    }
    const m = args[i].match(/^--fail-on=(critical|serious|moderate)$/);
    if (m) return m[1] as Severity;
  }
  return null;
}

function exceedsThreshold(critical: number, serious: number, moderate: number, threshold: Severity): boolean {
  if (threshold === "critical") return critical > 0;
  if (threshold === "serious") return critical + serious > 0;
  return critical + serious + moderate > 0;
}

function bar(positives: number, concerns: number, total: number, width: number = 20): string {
  if (total === 0) return c.dim + "░".repeat(width) + c.reset;
  const goodW = Math.round((positives / total) * width);
  const badW = Math.round((concerns / total) * width);
  const neutralW = width - goodW - badW;
  return (
    c.green + "█".repeat(goodW) +
    c.dim + "░".repeat(Math.max(0, neutralW)) +
    c.red + "█".repeat(badW) +
    c.reset
  );
}

function spinner(): { update(msg: string): void; done(msg: string): void } {
  if (!isTTY) return { update(msg) { process.stderr.write(msg + "\n"); }, done(msg) { process.stderr.write(msg + "\n"); } };
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  let interval: ReturnType<typeof setInterval>;
  let currentMsg = "";
  const render = () => {
    process.stderr.write(`\r\x1b[K${c.cyan}${frames[i % frames.length]}${c.reset} ${currentMsg}`);
    i++;
  };
  return {
    update(msg: string) {
      currentMsg = msg;
      if (!interval) interval = setInterval(render, 80);
      render();
    },
    done(msg: string) {
      if (interval) clearInterval(interval);
      process.stderr.write(`\r\x1b[K${c.green}✓${c.reset} ${msg}\n`);
    },
  };
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter(a => a.startsWith("--")));
  const positional = args.filter(a => !a.startsWith("--"));

  const directory = positional[0] || process.cwd();
  const skillsDir = positional[1];

  if (flags.has("--help") || flags.has("-h")) {
    process.stdout.write(`
${c.bold}hig-doctor audit${c.reset} — Apple HIG compliance audit

${c.bold}Usage:${c.reset}
  ${c.cyan}bun run audit${c.reset} <directory> [skills-dir] [options]

${c.bold}Arguments:${c.reset}
  directory    Path to the project to audit ${c.dim}(default: cwd)${c.reset}
  skills-dir   Path to skills directory ${c.dim}(auto-detected)${c.reset}

${c.bold}Options:${c.reset}
  --export              Write full audit markdown to <directory>/hig-audit.md
  --stdout              Print full audit markdown to stdout ${c.dim}(pipe-friendly)${c.reset}
  --json                Print results as JSON
  --fail-on <severity>  Exit 1 if any concern at/above severity is found
                        ${c.dim}(critical | serious | moderate)${c.reset}
  --help, -h            Show this help

${c.bold}Examples:${c.reset}
  ${c.dim}# Audit a Next.js project${c.reset}
  bun run audit ./my-nextjs-app

  ${c.dim}# Audit a SwiftUI project and export report${c.reset}
  bun run audit ./MyApp --export

  ${c.dim}# Fail CI on any critical a11y violation${c.reset}
  bun run audit ./my-app --fail-on critical

  ${c.dim}# Pipe raw markdown for AI evaluation${c.reset}
  bun run audit ./MyApp --stdout | pbcopy

`);
    process.exit(0);
  }

  const failOn = parseFailOn(flags, args);

  const s = spinner();
  const appName = basename(resolve(directory));
  s.update(`Scanning ${c.bold}${appName}${c.reset}...`);

  const result = await audit(directory, skillsDir);
  const { categories, scanResult, allMatches, markdown } = result;

  s.done(`Scanned ${c.bold}${scanResult.codeFiles.length}${c.reset} code + ${c.bold}${scanResult.styleFiles.length}${c.reset} style files`);

  // Aggregate totals (used by every mode below)
  const totalConcerns = categories.reduce((s, cat) => s + cat.concerns, 0);
  const totalPositives = categories.reduce((s, cat) => s + cat.positives, 0);
  const totalPatterns = categories.reduce((s, cat) => s + cat.patterns, 0);
  const totalCritical = categories.reduce((s, cat) => s + cat.critical, 0);
  const totalSerious = categories.reduce((s, cat) => s + cat.serious, 0);
  const totalModerate = categories.reduce((s, cat) => s + cat.moderate, 0);
  const totalDetections = allMatches.length;
  const gateTripped = failOn !== null && exceedsThreshold(totalCritical, totalSerious, totalModerate, failOn);

  // ── --stdout mode ───────────────────────────────────────────────
  if (flags.has("--stdout")) {
    process.stdout.write(markdown);
    process.exit(gateTripped ? 1 : 0);
  }

  // ── --export mode ───────────────────────────────────────────────
  if (flags.has("--export")) {
    const outPath = join(resolve(directory), "hig-audit.md");
    await writeFile(outPath, markdown);
    process.stderr.write(`${c.green}✓${c.reset} Audit exported to ${c.bold}${outPath}${c.reset}\n`);
    process.exit(gateTripped ? 1 : 0);
  }

  // ── --json mode ─────────────────────────────────────────────────
  if (flags.has("--json")) {
    const totalFiles = scanResult.codeFiles.length + scanResult.styleFiles.length;
    const detectionsPerFile = totalFiles > 0 ? totalDetections / totalFiles : 0;
    const lowDensity = detectionsPerFile < 4 && totalDetections < 500;
    process.stdout.write(JSON.stringify({
      lowDensity,
      frameworks: scanResult.frameworks,
      files: { code: scanResult.codeFiles.length, style: scanResult.styleFiles.length, config: scanResult.configFiles.length },
      severities: { critical: totalCritical, serious: totalSerious, moderate: totalModerate },
      totals: { concerns: totalConcerns, positives: totalPositives, patterns: totalPatterns },
      failOn,
      gateTripped,
      categories: categories.map(cat => ({
        name: cat.label,
        skill: cat.skillName,
        detections: cat.matches.length,
        concerns: cat.concerns,
        positives: cat.positives,
        patterns: cat.patterns,
        severities: { critical: cat.critical, serious: cat.serious, moderate: cat.moderate },
        files: cat.files,
      })),
    }, null, 2));
    process.exit(gateTripped ? 1 : 0);
  }

  // ── Default: rich summary ───────────────────────────────────────
  const w = process.stdout.columns || 72;
  const lineW = Math.min(w, 72);
  const sep = c.dim + "─".repeat(lineW) + c.reset;

  // Header
  process.stdout.write("\n");
  process.stdout.write(`  ${c.bold}HIG Audit: ${appName}${c.reset}  ${severityBadge(totalCritical, totalSerious, totalModerate)}\n`);
  process.stdout.write(`  ${c.dim}${scanResult.frameworks.join(", ")} · ${totalDetections} detections · ${scanResult.codeFiles.length + scanResult.styleFiles.length} files${c.reset}\n`);
  process.stdout.write("\n");
  process.stdout.write(`  ${sep}\n`);

  // Category rows
  const labelW = 24;
  const countW = 5;

  for (const cat of categories) {
    const total = cat.matches.length;
    const label = cat.label.length > labelW ? cat.label.slice(0, labelW - 1) + "…" : cat.label.padEnd(labelW);
    const count = String(total).padStart(countW);

    const sevParts: string[] = [];
    if (cat.critical > 0) sevParts.push(`${c.red}${cat.critical} critical${c.reset}`);
    if (cat.serious > 0) sevParts.push(`${c.yellow}${cat.serious} serious${c.reset}`);
    if (cat.moderate > 0) sevParts.push(`${c.yellow}${cat.moderate} moderate${c.reset}`);
    if (cat.positives > 0 && sevParts.length === 0) sevParts.push(`${c.green}${cat.positives} good${c.reset}`);
    else if (cat.positives > 0) sevParts.unshift(`${c.green}${cat.positives} good${c.reset}`);
    const detail = sevParts.length > 0 ? "  " + sevParts.join(" ") : "";

    const vizBar = bar(cat.positives, cat.concerns, total);
    process.stdout.write(`  ${c.white}${label}${c.reset} ${c.dim}${count}${c.reset}  ${vizBar}${detail}\n`);
  }

  process.stdout.write(`  ${sep}\n`);

  // Totals row
  process.stdout.write(`  ${"Totals".padEnd(labelW)} ${String(totalDetections).padStart(countW)}  `);
  if (totalPositives > 0) process.stdout.write(`${c.green}${totalPositives} good${c.reset}  `);
  if (totalCritical > 0) process.stdout.write(`${c.red}${totalCritical} critical${c.reset}  `);
  if (totalSerious > 0) process.stdout.write(`${c.yellow}${totalSerious} serious${c.reset}  `);
  if (totalModerate > 0) process.stdout.write(`${c.yellow}${totalModerate} moderate${c.reset}  `);
  if (totalPatterns > 0) process.stdout.write(`${c.dim}${totalPatterns} patterns${c.reset}`);
  process.stdout.write("\n");

  // Severity interpretation
  process.stdout.write("\n");
  const totalFiles = scanResult.codeFiles.length + scanResult.styleFiles.length;
  const detectionsPerFile = totalFiles > 0 ? totalDetections / totalFiles : 0;
  const isLowDensity = detectionsPerFile < 4 && totalDetections < 500;

  if (isLowDensity) {
    process.stdout.write(`  ${c.yellow}Low UI density${c.reset} — Few HIG-relevant patterns detected (${detectionsPerFile.toFixed(1)}/file).\n`);
    process.stdout.write(`  ${c.dim}This project may not be UI-focused. Audit results are less meaningful with sparse data.${c.reset}\n`);
  } else if (totalCritical > 0) {
    process.stdout.write(`  ${c.red}Critical issues found${c.reset} — Accessibility-breaking violations need immediate attention.\n`);
  } else if (totalSerious > 0) {
    process.stdout.write(`  ${c.yellow}Serious issues found${c.reset} — Significant HIG violations degrade UX.\n`);
  } else if (totalModerate > 0) {
    process.stdout.write(`  ${c.yellow}Moderate issues found${c.reset} — HIG style violations worth addressing.\n`);
  } else {
    process.stdout.write(`  ${c.green}Clean${c.reset} — No HIG concerns detected.\n`);
  }

  if (failOn) {
    process.stdout.write(`  ${c.dim}--fail-on ${failOn}${c.reset} · `);
    process.stdout.write(gateTripped ? `${c.red}gate tripped${c.reset}\n` : `${c.green}gate clean${c.reset}\n`);
  }

  // Footer
  process.stdout.write(`\n  ${c.dim}Run with --export for a full report, or --stdout to pipe to an AI.${c.reset}\n\n`);

  process.exit(gateTripped ? 1 : 0);
}

main().catch((e) => {
  console.error(`${c.red}Error:${c.reset} ${e.message}`);
  process.exit(1);
});
