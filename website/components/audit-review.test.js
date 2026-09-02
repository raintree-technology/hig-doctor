import { describe, expect, test } from "bun:test";
import {
  categoryLabel,
  compareReviewRuns,
  concernFindings,
  groupBySeverity,
} from "./audit-review";

function match(overrides = {}) {
  return {
    ruleId: "web/missing-alt",
    engine: "regex",
    category: "foundations",
    subcategory: "accessibility",
    type: "concern",
    pattern: "missing alt",
    line: 1,
    lineContent: "<img>",
    file: "Hero.tsx",
    severity: "critical",
    ...overrides,
  };
}

describe("audit review", () => {
  test("prioritizes concerns by severity and source order", () => {
    const findings = concernFindings([
      match({ ruleId: "moderate", severity: "moderate", line: 1 }),
      match({ ruleId: "serious", severity: "serious", line: 8 }),
      match({ ruleId: "critical-later", line: 7 }),
      match({ ruleId: "critical-first", line: 2 }),
    ]);

    expect(findings.map((finding) => finding.ruleId)).toEqual([
      "critical-first",
      "critical-later",
      "serious",
      "moderate",
    ]);
  });

  test("groups positive and concern findings separately", () => {
    const grouped = groupBySeverity([
      match(),
      match({ ruleId: "serious", severity: "serious" }),
      match({ ruleId: "moderate", severity: "moderate" }),
      match({ ruleId: "positive", type: "positive", severity: undefined }),
    ]);

    expect(grouped.critical).toHaveLength(1);
    expect(grouped.serious).toHaveLength(1);
    expect(grouped.moderate).toHaveLength(1);
    expect(grouped.positives).toHaveLength(1);
  });

  test("reports resolved, introduced, and unchanged concerns", () => {
    const previous = [
      match({ ruleId: "resolved" }),
      match({ ruleId: "unchanged", line: 2 }),
    ];
    const current = [
      match({ ruleId: "unchanged", line: 2 }),
      match({ ruleId: "introduced", line: 3 }),
    ];

    expect(compareReviewRuns(current, previous)).toEqual({
      resolved: 1,
      introduced: 1,
      unchanged: 1,
    });
    expect(compareReviewRuns(current, null)).toBeNull();
  });

  test("formats internal categories for readers", () => {
    expect(categoryLabel("components-layout")).toBe("Layout");
    expect(categoryLabel("foundations")).toBe("Foundations");
  });
});
