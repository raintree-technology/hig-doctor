// Generates docs/benchmark.md from the fixture corpus. Run:
//   bun scripts/generate-benchmark.ts
// Guarded against drift by test/benchmark-docs-sync.test.mjs.
import { runBenchmark, BENCHMARK_CASES } from "../packages/core/src/benchmark";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const report = runBenchmark();
const good = BENCHMARK_CASES.filter(c => c.kind === "good").length;
const bad = BENCHMARK_CASES.filter(c => c.kind === "bad").length;
const frameworks = [...new Set(BENCHMARK_CASES.map(c => c.framework))].sort();

let out = `# Rule engine benchmark

Generated from the fixture corpus in \`packages/core/src/benchmark.ts\` — do not edit by hand; run \`bun scripts/generate-benchmark.ts\`.

Each fixture is a small source file paired with the exact set of concern rule IDs it should produce. **Bad** fixtures measure recall (a missed rule is a false negative); **good** fixtures measure precision (any concern is a false positive). The suite is a CI regression guard (\`packages/core/src/benchmark.test.ts\`), not a marketing number — it reports measured false-positive and false-negative rates on known inputs.

## Corpus

- ${BENCHMARK_CASES.length} fixtures (${bad} bad, ${good} good)
- ${frameworks.length} frameworks: ${frameworks.join(", ")}

## Results

| Metric | Value |
|--------|-------|
| True positives | ${report.overall.tp} |
| False positives | ${report.overall.fp} |
| False negatives | ${report.overall.fn} |
| **Precision** | **${report.overall.precision.toFixed(3)}** |
| **Recall** | **${report.overall.recall.toFixed(3)}** |

## Per-rule

| Rule ID | TP | FP | FN | Precision | Recall |
|---------|----|----|----|-----------|--------|
`;

for (const r of report.perRule) {
  out += `| \`${r.ruleId}\` | ${r.tp} | ${r.fp} | ${r.fn} | ${r.precision.toFixed(3)} | ${r.recall.toFixed(3)} |\n`;
}

if (report.falsePositives.length > 0) {
  out += `\n## False positives\n\n`;
  for (const fp of report.falsePositives) {
    out += `- \`${fp.ruleId}\` fired on fixture \`${fp.case}\` (line ${fp.line})\n`;
  }
}
if (report.falseNegatives.length > 0) {
  out += `\n## False negatives\n\n`;
  for (const fn of report.falseNegatives) {
    out += `- \`${fn.ruleId}\` expected but not produced by fixture \`${fn.case}\`\n`;
  }
}
if (report.falsePositives.length === 0 && report.falseNegatives.length === 0) {
  out += `\nNo false positives or false negatives on the current corpus.\n`;
}

const target = join(import.meta.dir, "..", "docs", "benchmark.md");
writeFileSync(target, out);
console.log(`Wrote ${target}: precision ${report.overall.precision}, recall ${report.overall.recall}`);
