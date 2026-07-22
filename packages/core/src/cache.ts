// cache.ts — content-hash cache for local scans.
//
// Analysis is a pure function of (path, content, ruleset), so re-scanning a
// project only needs to re-analyze files whose content changed. The cache keys
// each file's findings by a hash of its path + content and is namespaced by the
// engine's rule count and a cache-format version, so a rule change or a cache
// schema change transparently invalidates every stale entry.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { RULE_COUNT, type PatternMatch } from "./patterns";

const CACHE_VERSION = 2; // bump when analysis semantics change independent of rule count
export const CACHE_FILENAME = ".hig-cache.json";

interface CacheFile {
  namespace: string;
  entries: Record<string, PatternMatch[]>;
}

function namespace(): string {
  return `v${CACHE_VERSION}.rules${RULE_COUNT}`;
}

function keyFor(path: string, content: string): string {
  return createHash("sha256").update(path).update("\0").update(content).digest("hex").slice(0, 24);
}

export class ScanCache {
  private entries: Map<string, PatternMatch[]>;
  private hits = 0;
  private misses = 0;

  private constructor(entries: Map<string, PatternMatch[]>) {
    this.entries = entries;
  }

  static async load(path: string): Promise<ScanCache> {
    try {
      const raw = await readFile(path, "utf-8");
      const parsed = JSON.parse(raw) as CacheFile;
      // A namespace mismatch means the ruleset or cache format changed — drop it.
      if (parsed.namespace === namespace() && parsed.entries) {
        return new ScanCache(new Map(Object.entries(parsed.entries)));
      }
    } catch {
      // Missing or unreadable cache → start empty.
    }
    return new ScanCache(new Map());
  }

  /** Return cached findings for this file, or null on a miss. */
  get(path: string, content: string): PatternMatch[] | null {
    const hit = this.entries.get(keyFor(path, content));
    if (hit) {
      this.hits++;
      return hit;
    }
    this.misses++;
    return null;
  }

  set(path: string, content: string, matches: PatternMatch[]): void {
    this.entries.set(keyFor(path, content), matches);
  }

  get stats(): { hits: number; misses: number } {
    return { hits: this.hits, misses: this.misses };
  }

  /** Persist only the keys touched this run, so deleted files don't accumulate. */
  async save(path: string, touched: Set<string>): Promise<void> {
    const entries: Record<string, PatternMatch[]> = {};
    for (const [k, v] of this.entries) {
      if (touched.has(k)) entries[k] = v;
    }
    const file: CacheFile = { namespace: namespace(), entries };
    await writeFile(path, JSON.stringify(file));
  }

  keyOf(path: string, content: string): string {
    return keyFor(path, content);
  }
}
