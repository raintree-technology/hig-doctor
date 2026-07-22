import { describe, test, expect } from "bun:test";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ScanCache, CACHE_FILENAME } from "./cache";
import { audit } from "./audit";
import { detectPatterns } from "./patterns";

describe("ScanCache", () => {
  test("hits on identical (path, content), misses when content changes", async () => {
    const cache = await ScanCache.load(join(tmpdir(), "nonexistent-cache.json"));
    const matches = detectPatterns(".a { text-align: left; }", "a.css");
    expect(cache.get("a.css", ".a { text-align: left; }")).toBeNull();
    cache.set("a.css", ".a { text-align: left; }", matches);
    expect(cache.get("a.css", ".a { text-align: left; }")).toEqual(matches);
    // Changed content → miss.
    expect(cache.get("a.css", ".a { text-align: right; }")).toBeNull();
    // Same content, different path → miss (findings carry the path).
    expect(cache.get("b.css", ".a { text-align: left; }")).toBeNull();
    expect(cache.stats.hits).toBe(1);
    expect(cache.stats.misses).toBe(3);
  });

  test("persists and reloads only touched entries; namespace invalidates", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-cache-"));
    const path = join(dir, CACHE_FILENAME);
    try {
      const cache = await ScanCache.load(path);
      cache.set("a.css", "x", detectPatterns("x", "a.css"));
      cache.set("stale.css", "y", []);
      await cache.save(path, new Set([cache.keyOf("a.css", "x")]));

      const reloaded = await ScanCache.load(path);
      expect(reloaded.get("a.css", "x")).not.toBeNull();
      // stale.css was not in the touched set, so it wasn't persisted.
      expect(reloaded.get("stale.css", "y")).toBeNull();

      // A namespace change (simulated) drops all entries.
      const raw = JSON.parse(await readFile(path, "utf-8"));
      raw.namespace = "v0.rules1";
      await writeFile(path, JSON.stringify(raw));
      const invalid = await ScanCache.load(path);
      expect(invalid.get("a.css", "x")).toBeNull();
    } finally {
      await rm(dir, { recursive: true });
    }
  });

  test("audit --cache produces identical findings and reports hits on re-run", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-cache-audit-"));
    try {
      await writeFile(join(dir, "V.swift"), ".foregroundColor(.red)\n");
      const first = await audit(dir, undefined, { cache: true });
      expect(first.cacheStats).toEqual({ hits: 0, misses: 1 });
      const second = await audit(dir, undefined, { cache: true });
      expect(second.cacheStats).toEqual({ hits: 1, misses: 0 });
      // Cached results match a fresh (uncached) analysis.
      const fresh = await audit(dir, undefined, { cache: false });
      expect(second.allMatches.map(m => m.ruleId).sort()).toEqual(fresh.allMatches.map(m => m.ruleId).sort());
    } finally {
      await rm(dir, { recursive: true });
    }
  });
});
