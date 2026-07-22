// audit.ts — Full pipeline: scan → detect → categorize → generate markdown
import { scanProject, type ScanResult } from "./scanner";
import { type PatternMatch } from "./patterns";
import { analyzeFile } from "./analyze";
import { categorizeMatches, type CategorySummary } from "./categorizer";
import { generateAuditMarkdown, loadSkillContent } from "./audit-generator";
import { applyConfig, loadConfig } from "./config";
import { applyBaseline, loadBaseline } from "./baseline";
import { ScanCache, CACHE_FILENAME } from "./cache";
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
  /** Explicit path to a .hig-baseline.json (default: discovered in the audited directory). */
  baselinePath?: string;
  /** Skip baseline discovery entirely. */
  noBaseline?: boolean;
  /** Enable the content-hash cache under the audited directory (local scans). */
  cache?: boolean;
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
  /** Absolute path of the applied baseline file, or null. */
  baselinePath: string | null;
  /** Concerns absorbed by the baseline (hidden from results and gating). */
  baselined: number;
  /** Baseline occurrences that no longer match anything — time to re-snapshot. */
  baselineStale: number;
  /** Cache hit/miss counts when the cache is enabled, else null. */
  cacheStats: { hits: number; misses: number } | null;
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
  // rule settings from the config (off / severity remap / per-path overrides).
  // The optional content-hash cache skips re-analysis of unchanged files.
  const detected: PatternMatch[] = [];
  const allFiles = [...scanResult.codeFiles, ...scanResult.styleFiles, ...scanResult.markupFiles];
  const cachePath = join(resolvedDir, CACHE_FILENAME);
  const cache = options.cache ? await ScanCache.load(cachePath) : null;
  const touched = new Set<string>();
  for (const file of allFiles) {
    let matches = cache?.get(file.relativePath, file.content) ?? null;
    if (matches === null) {
      matches = analyzeFile(file.content, file.relativePath);
      cache?.set(file.relativePath, file.content, matches);
    }
    if (cache) touched.add(cache.keyOf(file.relativePath, file.content));
    detected.push(...matches);
  }
  if (cache) await cache.save(cachePath, touched);
  const configured = applyConfig(detected, loaded.config);

  // 4. Apply baseline: previously-snapshotted concerns are absorbed so only
  // new violations surface in results and gating
  let allMatches = configured;
  let baselinePath: string | null = null;
  let baselined = 0;
  let baselineStale = 0;
  if (!options.noBaseline) {
    const found = await loadBaseline(resolvedDir, options.baselinePath);
    if (found) {
      const applied = applyBaseline(configured, found.baseline);
      allMatches = applied.kept;
      baselinePath = found.path;
      baselined = applied.baselined;
      baselineStale = applied.stale;
    }
  }

  // 5. Categorize
  const categories = categorizeMatches(allMatches);

  // 6. Try to load skill content
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

  // 7. Generate markdown
  const markdown = generateAuditMarkdown(scanResult, categories, resolvedSkillsDir, skillContents);

  return {
    scanResult,
    allMatches,
    categories,
    markdown,
    configPath: loaded.path,
    configWarnings: loaded.warnings,
    baselinePath,
    baselined,
    baselineStale,
    cacheStats: cache ? cache.stats : null,
  };
}
