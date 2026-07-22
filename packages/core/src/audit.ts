// audit.ts — Full pipeline: scan → detect → categorize → generate markdown
import { scanProject, type ScanResult } from "./scanner";
import { detectPatterns, type PatternMatch } from "./patterns";
import { categorizeMatches, type CategorySummary } from "./categorizer";
import { generateAuditMarkdown, loadSkillContent } from "./audit-generator";
import { applyConfig, loadConfig } from "./config";
import { resolve, join } from "node:path";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Directory of this module, resolved cross-runtime (Bun has import.meta.dir,
// Node does not). Used only to locate the bundled skills/ folder in dev.
const moduleDir = fileURLToPath(new URL(".", import.meta.url));

export interface AuditOptions {
  /** Path globs (relative to the audited directory) to exclude from scanning. */
  exclude?: string[];
  /** Explicit path to a hig-doctor.config.json (default: discovered in the audited directory). */
  configPath?: string;
  /** Skip config discovery entirely. */
  noConfig?: boolean;
}

export interface AuditResult {
  scanResult: ScanResult;
  allMatches: PatternMatch[];
  categories: CategorySummary[];
  markdown: string;
  /** Absolute path of the applied config file, or null. */
  configPath: string | null;
  /** Non-fatal config problems (unknown rule IDs etc.). */
  configWarnings: string[];
}

export async function audit(directory: string, skillsDir?: string, options: AuditOptions = {}): Promise<AuditResult> {
  const resolvedDir = resolve(directory);

  // 1. Load config (unless disabled), merging its ignore globs with caller excludes
  const loaded = options.noConfig
    ? { path: null, config: {}, warnings: [] as string[] }
    : await loadConfig(resolvedDir, options.configPath);
  const exclude = [...(loaded.config.ignore ?? []), ...(options.exclude ?? [])];

  // 2. Scan project
  const scanResult = await scanProject(resolvedDir, { exclude });

  // 3. Detect patterns in all source files (code + style + markup), then apply
  // rule settings from the config (off / severity remap / per-path overrides)
  const detected: PatternMatch[] = [];
  const allFiles = [...scanResult.codeFiles, ...scanResult.styleFiles, ...scanResult.markupFiles];
  for (const file of allFiles) {
    const matches = detectPatterns(file.content, file.relativePath);
    detected.push(...matches);
  }
  const allMatches = applyConfig(detected, loaded.config);

  // 4. Categorize
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
      // Relative to this package (for development: packages/core/src → repo root)
      join(moduleDir, "..", "..", "..", "skills"),
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

  return { scanResult, allMatches, categories, markdown, configPath: loaded.path, configWarnings: loaded.warnings };
}
