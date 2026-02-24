#!/usr/bin/env bun
// cli.ts — CLI entry point for hig-doctor audit
import { audit } from "./audit";
import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter(a => a.startsWith("--")));
  const positional = args.filter(a => !a.startsWith("--"));

  const directory = positional[0] || process.cwd();
  const skillsDir = positional[1]; // optional second positional arg

  if (flags.has("--help") || flags.has("-h")) {
    console.log(`
hig-doctor audit — Apple HIG compliance audit tool

Usage:
  hig-doctor <directory> [skills-dir] [options]

Arguments:
  directory    Path to the app project to audit (default: cwd)
  skills-dir   Path to apple-hig-skills/skills directory (auto-detected)

Options:
  --export     Write audit markdown to <directory>/hig-audit.md
  --stdout     Print audit markdown to stdout
  --help, -h   Show this help

Examples:
  bun src/cli.ts ./my-swiftui-app --stdout
  bun src/cli.ts ./my-swiftui-app --export
  bun src/cli.ts ./my-swiftui-app ../skills --stdout
`);
    process.exit(0);
  }

  console.error(`Scanning ${resolve(directory)}...`);
  const result = await audit(directory, skillsDir);

  const { categories, scanResult, allMatches, markdown } = result;
  console.error(`Frameworks: ${scanResult.frameworks.join(", ")}`);
  console.error(`Found ${scanResult.codeFiles.length} code + ${scanResult.styleFiles.length} style files, ${allMatches.length} pattern matches across ${categories.length} categories`);

  if (flags.has("--stdout")) {
    process.stdout.write(markdown);
    process.exit(0);
  }

  if (flags.has("--export")) {
    const outPath = join(resolve(directory), "hig-audit.md");
    await writeFile(outPath, markdown);
    console.log(`Audit exported to ${outPath}`);
    process.exit(0);
  }

  // Default: print summary
  console.log("");
  console.log(`HIG Audit: ${scanResult.directory.split("/").pop()}`);
  console.log(`${"─".repeat(50)}`);
  for (const cat of categories) {
    const concerns = cat.concerns > 0 ? ` (${cat.concerns} concerns)` : "";
    const positives = cat.positives > 0 ? ` (${cat.positives} good)` : "";
    console.log(`  ${cat.label.padEnd(25)} ${String(cat.matches.length).padStart(3)} detections${concerns}${positives}`);
  }
  console.log(`${"─".repeat(50)}`);
  console.log(`Use --stdout to get the full audit markdown, or --export to write to file.`);
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
