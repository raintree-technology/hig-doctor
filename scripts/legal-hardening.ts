#!/usr/bin/env bun
// legal-hardening.ts — post-process scraped HIG reference files to reduce
// IP transfer and strengthen attribution. Idempotent; safe to re-run.
//
// - Strips embedded Apple CDN images (docs-assets.developer.apple.com).
// - Inserts an Attribution block below the YAML frontmatter pointing to the
//   canonical Apple HIG URL.
//
// On re-run, the script detects and rewrites the existing attribution block,
// so formatting tweaks to the block content propagate across all files.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SKILLS_DIR = join(import.meta.dir, "..", "skills");
const APPLE_IMG = /!\[[^\]]*\]\(https:\/\/docs-assets\.developer\.apple\.com[^)]*\)/g;
const ATTRIBUTION_MARKER = "<!-- hig-doctor:attribution -->";
// Match the marker plus any blockquote lines that follow, plus trailing blank lines.
const ATTRIBUTION_BLOCK = new RegExp(
  `${ATTRIBUTION_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n(?:>.*\\n)*\\n*`,
  "g",
);

function sourceFromFrontmatter(raw: string): string | null {
  const fm = raw.match(/^---\s*\n([\s\S]*?)(\n---\s*\n|\n\n)/);
  if (!fm) return null;
  const source = fm[1].match(/^source:\s*(\S.*)$/m);
  return source ? source[1].trim() : null;
}

function buildBlock(source: string | null): string {
  const canonical =
    source ?? "https://developer.apple.com/design/human-interface-guidelines/";
  return [
    ATTRIBUTION_MARKER,
    "> **Source**: Apple Inc. Canonical content at " + canonical + ".",
    "> This file is a structured index of that content, snapshot 2025-02-02.",
    "> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.",
    "",
    "",
  ].join("\n");
}

function insertAttribution(raw: string, source: string | null): string {
  const block = buildBlock(source);
  // Remove any existing attribution block so we re-emit with current formatting.
  const cleaned = raw.replace(ATTRIBUTION_BLOCK, "");

  const fmEnd = cleaned.match(/^---\s*\n[\s\S]*?(\n---\s*\n|\n\n)/);
  if (!fmEnd) return block + cleaned;
  const endIdx = fmEnd.index! + fmEnd[0].length;
  return cleaned.slice(0, endIdx) + block + cleaned.slice(endIdx);
}

async function processFile(path: string): Promise<{ imagesStripped: number }> {
  const original = await readFile(path, "utf-8");
  const imagesStripped = (original.match(APPLE_IMG) ?? []).length;
  const stripped = original.replace(APPLE_IMG, "");
  const source = sourceFromFrontmatter(stripped);
  const next = insertAttribution(stripped, source);
  if (next !== original) await writeFile(path, next);
  return { imagesStripped };
}

async function main() {
  const skills = await readdir(SKILLS_DIR, { withFileTypes: true });
  let totalFiles = 0;
  let totalImages = 0;

  for (const skill of skills) {
    if (!skill.isDirectory()) continue;
    const refsDir = join(SKILLS_DIR, skill.name, "references");
    let refs: string[] = [];
    try {
      refs = (await readdir(refsDir)).filter((f) => f.endsWith(".md"));
    } catch {
      continue;
    }

    for (const ref of refs) {
      const path = join(refsDir, ref);
      const { imagesStripped } = await processFile(path);
      totalFiles++;
      totalImages += imagesStripped;
    }
  }

  console.log(
    `Processed ${totalFiles} files. Stripped ${totalImages} Apple-hosted images this run. Attribution blocks refreshed.`,
  );
}

await main();
