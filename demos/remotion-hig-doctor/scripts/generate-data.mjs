import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const demoRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(demoRoot, "..", "..");
const auditCli = path.resolve(repoRoot, "packages", "hig-doctor", "src-termcast", "src", "cli.ts");
const outputPath = path.resolve(demoRoot, "src", "data", "report-data.json");

const runAudit = (targetDir) => {
  const rawOutput = execFileSync("bun", [auditCli, targetDir, "--json"], {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  return JSON.parse(rawOutput);
};

const audit = runAudit(repoRoot);

const topCategories = audit.categories
  .sort((a, b) => b.detections - a.detections)
  .slice(0, 6);

const frameworkRuleCounts = [
  { framework: "React / Next.js", rules: "100+" },
  { framework: "SwiftUI", rules: "55+" },
  { framework: "CSS / SCSS", rules: "40+" },
  { framework: "Jetpack Compose", rules: "30+" },
  { framework: "Angular", rules: "25+" },
  { framework: "Vue / Nuxt", rules: "25+" },
  { framework: "Svelte / SvelteKit", rules: "20+" },
  { framework: "Android XML", rules: "20+" },
  { framework: "Flutter", rules: "20+" },
  { framework: "React Native", rules: "15+" },
  { framework: "HTML", rules: "15+" },
  { framework: "UIKit", rules: "10+" },
];

const output = {
  generatedAt: new Date().toISOString(),
  project: {
    name: "hig-doctor",
    score: audit.score,
    lowDensity: audit.lowDensity,
    frameworks: audit.frameworks,
    files: audit.files,
    totals: audit.totals,
    categories: audit.categories,
  },
  totalRules: 349,
  totalFrameworks: 12,
  topCategories,
  frameworkRuleCounts,
  scoreTimeline: [
    { label: "Poor project", score: 35 },
    { label: "Average project", score: 72 },
    { label: "This repo", score: audit.score },
  ],
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

process.stdout.write(`Wrote ${outputPath}\n`);
