import { describe, test, expect } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBaseline, applyBaseline, parseBaseline, BASELINE_FILENAME } from "./baseline";
import { audit } from "./audit";
import type { PatternMatch } from "./patterns";

const concern = (over: Partial<PatternMatch>): PatternMatch => ({
  ruleId: "swift/hardcoded-color",
  engine: "regex",
  category: "foundations",
  subcategory: "color",
  type: "concern",
  pattern: "hardcodedColor",
  line: 1,
  lineContent: ".foregroundColor(.red)",
  file: "A.swift",
  severity: "moderate",
  ...over,
});

describe("baseline", () => {
  test("createBaseline counts concern fingerprints, ignores positives", () => {
    const b = createBaseline(
      [concern({}), concern({ line: 9 }), concern({ type: "positive", severity: undefined })],
      "2026-07-21",
    );
    expect(Object.values(b.findings)).toEqual([2]);
  });

  test("applyBaseline absorbs up to the counted occurrences, content-keyed not line-keyed", () => {
    const baseline = createBaseline([concern({ line: 1 })], "2026-07-21");
    // Same content moved to another line: still absorbed.
    const moved = applyBaseline([concern({ line: 40 })], baseline);
    expect(moved.baselined).toBe(1);
    expect(moved.kept).toEqual([]);
    // A second occurrence beyond the count is NEW.
    const grown = applyBaseline([concern({ line: 1 }), concern({ line: 2 })], baseline);
    expect(grown.baselined).toBe(1);
    expect(grown.kept.length).toBe(1);
  });

  test("stale counts unmatched baseline entries", () => {
    const baseline = createBaseline([concern({}), concern({ ruleId: "swift/other", pattern: "other" })], "2026-07-21");
    const applied = applyBaseline([concern({})], baseline);
    expect(applied.stale).toBe(1);
  });

  test("whitespace changes don't break fingerprints", () => {
    const baseline = createBaseline([concern({ lineContent: ".foregroundColor(.red)" })], "2026-07-21");
    const applied = applyBaseline([concern({ lineContent: "  .foregroundColor(.red)  " })], baseline);
    expect(applied.baselined).toBe(1);
  });

  test("parseBaseline rejects malformed files", () => {
    expect(() => parseBaseline("{}", "b")).toThrow("not a hig-doctor baseline");
    expect(() => parseBaseline(JSON.stringify({ version: 1, findings: { k: "x" } }), "b")).toThrow("invalid count");
  });

  test("audit discovers and applies the baseline file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-baseline-"));
    try {
      await writeFile(join(dir, "View.swift"), ".foregroundColor(.red)\n");
      const before = await audit(dir);
      const concerns = before.allMatches.filter(m => m.type === "concern");
      expect(concerns.length).toBeGreaterThan(0);
      await writeFile(
        join(dir, BASELINE_FILENAME),
        JSON.stringify(createBaseline(before.allMatches, "2026-07-21")),
      );
      const after = await audit(dir);
      expect(after.baselinePath).toContain(BASELINE_FILENAME);
      expect(after.baselined).toBe(concerns.length);
      expect(after.allMatches.filter(m => m.type === "concern")).toEqual([]);
      const skipped = await audit(dir, undefined, { noBaseline: true });
      expect(skipped.baselined).toBe(0);
      expect(skipped.allMatches.filter(m => m.type === "concern").length).toBe(concerns.length);
    } finally {
      await rm(dir, { recursive: true });
    }
  });
});
