// audit.ts — Full pipeline: scan → detect → categorize → generate markdown
import { scanProject, type ScanResult } from "./scanner";
import { detectPatterns, type PatternMatch } from "./patterns";
import { categorizeMatches, type CategorySummary } from "./categorizer";
import { generateAuditMarkdown, loadSkillContent } from "./audit-generator";
import { resolve, join } from "node:path";
import { access } from "node:fs/promises";

export interface AuditResult {
  scanResult: ScanResult;
  allMatches: PatternMatch[];
  categories: CategorySummary[];
  markdown: string;
}

export async function audit(directory: string, skillsDir?: string): Promise<AuditResult> {
  const resolvedDir = resolve(directory);

  // 1. Scan project
  const scanResult = await scanProject(resolvedDir);

  // 2. Detect patterns in all source files (code + style + markup)
  const allMatches: PatternMatch[] = [];
  const allFiles = [...scanResult.codeFiles, ...scanResult.styleFiles, ...scanResult.markupFiles];
  for (const file of allFiles) {
    const matches = detectPatterns(file.content, file.relativePath);
    allMatches.push(...matches);
  }

  // 3. Categorize
  const categories = categorizeMatches(allMatches);

  // 4. Try to load skill content
  let resolvedSkillsDir: string | null = null;
  const skillContents = new Map<string, string>();

  if (skillsDir) {
    resolvedSkillsDir = resolve(skillsDir);
  } else {
    // Try to find skills directory relative to common locations
    const candidates = [
      join(resolvedDir, "skills"),
      join(resolvedDir, "..", "skills"),
      join(resolvedDir, "..", "..", "skills"),
      // Relative to this package (for development)
      join(import.meta.dir, "..", "..", "..", "..", "skills"),
    ];
    for (const candidate of candidates) {
      try {
        await access(candidate);
        resolvedSkillsDir = candidate;
        break;
      } catch {}
    }
  }

  if (resolvedSkillsDir) {
    for (const category of categories) {
      const content = await loadSkillContent(resolvedSkillsDir, category.skillName);
      if (content) skillContents.set(category.skillName, content);
    }
  }

  // 5. Generate markdown
  const markdown = generateAuditMarkdown(scanResult, categories, resolvedSkillsDir, skillContents);

  return { scanResult, allMatches, categories, markdown };
}
