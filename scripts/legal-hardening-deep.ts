#!/usr/bin/env bun
// legal-hardening-deep.ts — aggressive content transform over scraped HIG
// reference files. Destructive but idempotent-in-result: preserves structure
// (headings) and the bold "principle" sentences that are load-bearing for
// agents, drops Apple's expository prose, appends a canonical-source footer.
//
// This is a SEPARATE pass from legal-hardening.ts (which just strips images
// and inserts the attribution block). Run only after reviewing a diff.
//
// Usage:
//   bun scripts/legal-hardening-deep.ts           # dry-run, prints a diff summary
//   bun scripts/legal-hardening-deep.ts --apply   # writes the transform
//
// What it keeps per file:
//   - YAML frontmatter
//   - Attribution block (inserted by legal-hardening.ts)
//   - H1/H2/H3/H4 headings
//   - **Bolded principle sentences** (truncated to the bolded portion only)
//   - List items (- … / * … / 1. …)
//   - Canonical-source footer (appended)
//
// What it drops:
//   - Expository prose after principles
//   - Orphaned caption lines (remnants of stripped images)
//   - "Tip" callouts and similar marketing-shaped asides

import { readdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

const SKILLS_DIR = join(import.meta.dir, "..", "skills")
const APPLY = process.argv.includes("--apply")

const HEADING_RE = /^(#{1,6})\s/
const LIST_RE = /^\s*([-*+]|\d+\.)\s/
const BOLD_LINE_RE = /^\*\*([^*][^*]*?\.)\*\*/
const ATTRIBUTION_MARKER = "<!-- hig-doctor:attribution -->"
const CANONICAL_FOOTER_MARKER = "<!-- hig-doctor:canonical-footer -->"

// Navigation chrome scraped from Apple's doc pages — these headings never
// carried guidance. Drop the heading and everything beneath it.
const BOILERPLATE_HEADINGS = new Set([
  "Resources",
  "Related",
  "Developer documentation",
  "Videos",
  "Change log",
  "See also",
  "See Also",
])

const headingLevel = (line: string): number => {
  const m = line.match(HEADING_RE)
  return m ? m[1].length : 0
}

// "## [Title](url)" -> "## Title"; strips the scraped link wrapper that wraps
// ~92% of headings (the canonical URL still lives in frontmatter + the footer).
const headingText = (line: string): string =>
  line
    .replace(/^#{1,6}\s+/, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim()

interface Section {
  frontmatter: string
  attributionBlock: string
  body: string
  source: string | null
  title: string | null
}

function splitFile(raw: string): Section {
  // Frontmatter: from start `---\n` to first blank line or closing `---\n`.
  let frontmatterEnd = 0
  const fm = raw.match(/^---\s*\n[\s\S]*?(\n---\s*\n|\n\n)/)
  if (fm) frontmatterEnd = fm.index! + fm[0].length

  // Attribution block: <!-- hig-doctor:attribution --> plus blockquote lines,
  // optionally followed by blank lines.
  const attributionRe = new RegExp(ATTRIBUTION_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\n(?:>.*\\n)*\\n*")
  const rest = raw.slice(frontmatterEnd)
  // A closed frontmatter fence leaves a blank line before the attribution marker;
  // tolerate that leading whitespace so the block is still recognized.
  const leadingBlank = rest.match(/^\s*\n/)?.[0] ?? ""
  const afterBlank = rest.slice(leadingBlank.length)
  const attr = afterBlank.match(attributionRe)

  let attributionBlock = ""
  let body = rest
  if (attr && attr.index === 0) {
    attributionBlock = leadingBlank + attr[0]
    body = afterBlank.slice(attr[0].length)
  }

  const frontmatter = raw.slice(0, frontmatterEnd)
  const sourceMatch = frontmatter.match(/^source:\s*(\S.*)$/m)
  const titleMatch = body.match(/^#\s+(.+)$/m)

  return {
    frontmatter,
    attributionBlock,
    body,
    source: sourceMatch ? sourceMatch[1].trim() : null,
    title: titleMatch ? titleMatch[1].trim() : null,
  }
}

function transformBody(body: string): string {
  const lines = body.split("\n")
  const kept: string[] = []
  let inFooter = false
  let skipUntilLevel = 0 // >0 while inside a dropped boilerplate section

  for (const line of lines) {
    if (line.includes(CANONICAL_FOOTER_MARKER)) inFooter = true
    if (inFooter) continue

    const level = headingLevel(line)
    if (level > 0) {
      // A same-or-higher heading ends an in-progress boilerplate section.
      if (skipUntilLevel > 0 && level <= skipUntilLevel) skipUntilLevel = 0
      if (skipUntilLevel > 0) continue
      if (BOILERPLATE_HEADINGS.has(headingText(line))) {
        skipUntilLevel = level // drop this heading and everything beneath it
        continue
      }
      // Emit headings as plain text (drop the scraped "[Title](url)" wrapper).
      kept.push(`${"#".repeat(level)} ${headingText(line)}`)
      continue
    }

    if (skipUntilLevel > 0) continue // still inside a dropped section

    if (line.trim() === "") {
      kept.push("")
      continue
    }
    // Keep list items verbatim (they often enumerate HIG values).
    if (LIST_RE.test(line)) {
      kept.push(line)
      continue
    }
    // Truncate bold-principle lines to just the bolded sentence.
    const bold = line.match(BOLD_LINE_RE)
    if (bold) {
      kept.push(`**${bold[1]}**`)
    }
    // Drop everything else (prose).
  }

  // Prune empty headings: a heading (below the H1 title, which is always kept)
  // with no content before the next same-or-higher heading. Iterate to a
  // fixpoint so a parent that only held now-removed empty children collapses too.
  let working = kept
  let changed = true
  while (changed) {
    changed = false
    const next: string[] = []
    for (let i = 0; i < working.length; i++) {
      const level = headingLevel(working[i])
      if (level > 1) {
        let hasContent = false
        for (let j = i + 1; j < working.length; j++) {
          const jl = headingLevel(working[j])
          if (jl > 0 && jl <= level) break // end of this heading's section
          if (jl === 0 && working[j].trim() !== "") {
            hasContent = true
            break
          }
        }
        if (!hasContent) {
          changed = true
          continue // drop the empty heading
        }
      }
      next.push(working[i])
    }
    working = next
  }

  // Collapse consecutive blank lines and trim leading/trailing blanks.
  const final: string[] = []
  let lastBlank = false
  for (const l of working) {
    if (l.trim() === "") {
      if (!lastBlank && final.length > 0) final.push("")
      lastBlank = true
    } else {
      final.push(l)
      lastBlank = false
    }
  }
  while (final.length > 0 && final[final.length - 1].trim() === "") final.pop()
  return final.join("\n")
}

function appendFooter(body: string, source: string | null): string {
  const canonical = source ?? "https://developer.apple.com/design/human-interface-guidelines/"
  const footer = [
    "",
    "",
    "---",
    "",
    CANONICAL_FOOTER_MARKER,
    `For the complete guidance, including worked examples and illustrations, see the canonical page: ${canonical}`,
    "",
  ].join("\n")
  return body + footer
}

interface FileResult {
  path: string
  beforeLines: number
  afterLines: number
  droppedLines: number
}

async function processFile(path: string): Promise<FileResult> {
  const original = await readFile(path, "utf-8")
  const beforeLines = original.split("\n").length

  const section = splitFile(original)
  const newBody = transformBody(section.body)
  const withFooter = appendFooter(newBody, section.source)
  const next = section.frontmatter + section.attributionBlock + withFooter + "\n"
  const afterLines = next.split("\n").length

  if (APPLY && next !== original) await writeFile(path, next)

  return {
    path,
    beforeLines,
    afterLines,
    droppedLines: beforeLines - afterLines,
  }
}

async function main() {
  const skills = await readdir(SKILLS_DIR, { withFileTypes: true })
  const results: FileResult[] = []

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
      results.push(await processFile(join(refsDir, ref)))
    }
  }

  const totalBefore = results.reduce((s, r) => s + r.beforeLines, 0)
  const totalAfter = results.reduce((s, r) => s + r.afterLines, 0)
  const totalDropped = totalBefore - totalAfter

  console.log(
    `${APPLY ? "Applied" : "DRY RUN"} — ${results.length} files, ${totalBefore} → ${totalAfter} lines (${totalDropped} dropped, ${(
      (totalDropped / totalBefore) * 100
    ).toFixed(1)}%)`,
  )

  if (!APPLY) {
    console.log("\nTop 10 by reduction:")
    const sorted = [...results].sort((a, b) => b.droppedLines - a.droppedLines).slice(0, 10)
    for (const r of sorted) {
      const rel = r.path.replace(process.cwd() + "/", "")
      console.log(`  ${rel}: ${r.beforeLines} → ${r.afterLines} (-${r.droppedLines})`)
    }
    console.log("\nRe-run with --apply to write changes.")
  }
}

await main()
