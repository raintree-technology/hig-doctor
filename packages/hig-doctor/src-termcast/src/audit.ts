// audit.ts — Full pipeline: scan → detect → categorize → generate markdown

import { access } from "node:fs/promises"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { generateAuditMarkdown, loadSkillContent } from "./audit-generator"
import { type CategorySummary, categorizeMatches } from "./categorizer"
import { detectPatterns, type PatternMatch } from "./patterns"
import { type ScanResult, scanProject } from "./scanner"

// Directory of this module, resolved cross-runtime (Bun has import.meta.dir,
// Node does not). Used only to locate the bundled skills/ folder in dev.
const moduleDir = fileURLToPath(new URL(".", import.meta.url))

export interface AuditOptions {
  /** Path globs (relative to the audited directory) to exclude from scanning. */
  exclude?: string[]
}

export interface AuditResult {
  scanResult: ScanResult
  allMatches: PatternMatch[]
  categories: CategorySummary[]
  markdown: string
}

export async function audit(directory: string, skillsDir?: string, options: AuditOptions = {}): Promise<AuditResult> {
  const resolvedDir = resolve(directory)

  // 1. Scan project
  const scanResult = await scanProject(resolvedDir, { exclude: options.exclude })

  // 2. Detect patterns in all source files (code + style + markup)
  const allMatches: PatternMatch[] = []
  const allFiles = [...scanResult.codeFiles, ...scanResult.styleFiles, ...scanResult.markupFiles]
  for (const file of allFiles) {
    const matches = detectPatterns(file.content, file.relativePath)
    allMatches.push(...matches)
  }

  // 3. Categorize
  const categories = categorizeMatches(allMatches)

  // 4. Try to load skill content
  let resolvedSkillsDir: string | null = null
  const skillContents = new Map<string, string>()

  if (skillsDir) {
    resolvedSkillsDir = resolve(skillsDir)
  } else {
    // Try to find skills directory relative to common locations
    const candidates = [
      join(resolvedDir, "skills"),
      join(resolvedDir, "..", "skills"),
      join(resolvedDir, "..", "..", "skills"),
      // Relative to this package (for development)
      join(moduleDir, "..", "..", "..", "..", "skills"),
    ]
    for (const candidate of candidates) {
      try {
        await access(candidate)
        resolvedSkillsDir = candidate
        break
      } catch {}
    }
  }

  if (resolvedSkillsDir) {
    for (const category of categories) {
      const content = await loadSkillContent(resolvedSkillsDir, category.skillName)
      if (content) skillContents.set(category.skillName, content)
    }
  }

  // 5. Generate markdown
  const markdown = generateAuditMarkdown(scanResult, categories, resolvedSkillsDir, skillContents)

  return { scanResult, allMatches, categories, markdown }
}
