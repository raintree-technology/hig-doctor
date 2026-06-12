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

import { readdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

const SKILLS_DIR = join(import.meta.dir, "..", "skills")
const APPLE_IMG = /!\[[^\]]*\]\(https:\/\/docs-assets\.developer\.apple\.com[^)]*\)/g
const ATTRIBUTION_MARKER = "<!-- hig-doctor:attribution -->"
// Match the marker plus any blockquote lines that follow, plus trailing blank lines.
const ATTRIBUTION_BLOCK = new RegExp(
  `${ATTRIBUTION_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n(?:>.*\\n)*\\n*`,
  "g",
)

// Parse a reference file into its frontmatter field lines and the body that
// follows. Tolerates BOTH a properly closed fence (--- … ---) and the legacy
// unclosed form (--- … <blank line>), so the pass repairs the latter and is
// idempotent on the former.
function parseFrontmatter(raw: string): { fmLines: string[]; body: string } | null {
  if (!/^---\s*\r?\n/.test(raw)) return null
  const lines = raw.split("\n")
  const fmLines: string[] = []
  let i = 1
  for (; i < lines.length; i++) {
    const t = lines[i].trim()
    if (t === "---") {
      i++
      break
    } // closed fence
    if (t === "") break // legacy: a blank line terminated the (unclosed) frontmatter
    fmLines.push(lines[i])
  }
  while (i < lines.length && lines[i].trim() === "") i++ // skip blank separators
  return { fmLines, body: lines.slice(i).join("\n") }
}

function sourceFromFields(fmLines: string[]): string | null {
  const source = fmLines.join("\n").match(/^source:\s*(\S.*)$/m)
  return source ? source[1].trim() : null
}

function buildBlock(source: string | null): string {
  const canonical = source ?? "https://developer.apple.com/design/human-interface-guidelines/"
  return [
    ATTRIBUTION_MARKER,
    "> **Source**: Apple Inc. Canonical content at " + canonical + ".",
    "> This file is a structured index of that content, snapshot 2025-02-02.",
    "> Apple HIG text and imagery are © Apple Inc.; this repository provides organization and cross-referencing for AI agent consumption only.",
  ].join("\n")
}

async function processFile(path: string): Promise<{ imagesStripped: number }> {
  const original = await readFile(path, "utf-8")
  const parsed = parseFrontmatter(original)
  if (!parsed) return { imagesStripped: 0 }

  const imagesStripped = (parsed.body.match(APPLE_IMG) ?? []).length
  let body = parsed.body.replace(APPLE_IMG, "")
  // Drop any existing attribution block so we re-emit with current formatting.
  body = body.replace(ATTRIBUTION_BLOCK, "")
  body = body.replace(/^\n+/, "") // trim leading blank lines

  const source = sourceFromFields(parsed.fmLines)
  // Always emit a properly closed frontmatter fence, a blank line, the
  // attribution block, a blank line, then the body. Deterministic + idempotent.
  const frontmatter = "---\n" + parsed.fmLines.join("\n") + "\n---\n"
  const next = frontmatter + "\n" + buildBlock(source) + "\n\n" + body
  if (next !== original) await writeFile(path, next)
  return { imagesStripped }
}

async function main() {
  const skills = await readdir(SKILLS_DIR, { withFileTypes: true })
  let totalFiles = 0
  let totalImages = 0

  for (const skill of skills) {
    if (!skill.isDirectory()) continue
    const refsDir = join(SKILLS_DIR, skill.name, "references")
    let refs: string[] = []
    try {
      refs = (await readdir(refsDir)).filter((f) => f.endsWith(".md"))
    } catch {
      continue
    }

    for (const ref of refs) {
      const path = join(refsDir, ref)
      const { imagesStripped } = await processFile(path)
      totalFiles++
      totalImages += imagesStripped
    }
  }

  console.log(
    `Processed ${totalFiles} files. Stripped ${totalImages} Apple-hosted images this run. Attribution blocks refreshed.`,
  )
}

await main()
