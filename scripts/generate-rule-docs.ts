// Generates docs/rules.md from the rule catalog. Run: bun scripts/generate-rule-docs.ts
// CI guards drift via test/rule-docs-sync.test.mjs.
import { ruleCatalog, RULE_COUNT } from "../packages/core/src/index";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const catalog = ruleCatalog();
const byFramework = new Map<string, typeof catalog>();
for (const rule of catalog) {
  const list = byFramework.get(rule.framework) ?? [];
  list.push(rule);
  byFramework.set(rule.framework, list);
}

const FRAMEWORK_TITLES: Record<string, string> = {
  swift: "Swift / SwiftUI",
  uikit: "UIKit",
  appkit: "AppKit",
  watchos: "watchOS",
  visionos: "visionOS",
  web: "Web / React / Next.js",
  css: "CSS / SCSS",
  vue: "Vue / Nuxt",
  svelte: "Svelte / SvelteKit",
  angular: "Angular",
  compose: "Jetpack Compose",
  "android-xml": "Android XML",
  "react-native": "React Native",
  flutter: "Flutter",
};

const esc = (s: string) => s.replace(/\|/g, "\\|");

let out = `# Rule catalog

Generated from \`packages/core/src/patterns.ts\` — do not edit by hand; run \`bun scripts/generate-rule-docs.ts\`.

${RULE_COUNT} rules. Every rule has a stable ID (\`framework/label-slug\`) used by inline suppressions, baselines, SARIF output, and the MCP server's \`hig_explain_finding\`.

Rule types: **concern** (a probable HIG violation, carries a severity), **positive** (good practice worth crediting), **pattern** (neutral component usage that routes HIG reference material into the report).

Engines: \`regex\` (zero-dependency line/document scanner), \`swift-structural\` (comment/string-aware Swift structural analysis), \`ast-tsx\` (TypeScript compiler API).

`;

for (const [framework, rules] of byFramework) {
  const concerns = rules.filter(r => r.type === "concern").length;
  out += `## ${FRAMEWORK_TITLES[framework] ?? framework} (${rules.length} rules, ${concerns} concerns)\n\n`;
  out += `| Rule ID | Type | Severity | Engine | Guidance | HIG |\n`;
  out += `|---------|------|----------|--------|----------|-----|\n`;
  for (const r of rules) {
    const sev = r.severity ?? "—";
    const fix = r.fix ? esc(r.fix) : "—";
    const higSlug = r.hig.replace("https://developer.apple.com/design/human-interface-guidelines/", "") || "hig";
    out += `| \`${r.id}\` | ${r.type} | ${sev} | ${r.engine} | ${fix} | [${higSlug}](${r.hig}) |\n`;
  }
  out += `\n`;
}

const target = join(import.meta.dir, "..", "docs", "rules.md");
writeFileSync(target, out);
console.log(`Wrote ${target}: ${catalog.length} rules across ${byFramework.size} frameworks`);
