import { describe, test, expect } from "bun:test";
import { runBenchmark, BENCHMARK_CASES } from "./benchmark";

describe("rule engine benchmark", () => {
  const report = runBenchmark();

  test("good fixtures produce zero false positives", () => {
    // Every FP is a concern that fired on code that should be clean — list them
    // so a regression names the exact fixture and rule.
    expect(report.falsePositives).toEqual([]);
  });

  test("bad fixtures produce zero false negatives", () => {
    expect(report.falseNegatives).toEqual([]);
  });

  test("overall precision and recall stay at the published thresholds", () => {
    // Thresholds are the floor the README/benchmark doc quote. Tighten only.
    expect(report.overall.precision).toBeGreaterThanOrEqual(1);
    expect(report.overall.recall).toBeGreaterThanOrEqual(1);
  });

  test("corpus covers good and bad cases across multiple frameworks", () => {
    const frameworks = new Set(BENCHMARK_CASES.map(c => c.framework));
    expect(frameworks.size).toBeGreaterThanOrEqual(5);
    expect(BENCHMARK_CASES.some(c => c.kind === "good")).toBe(true);
    expect(BENCHMARK_CASES.some(c => c.kind === "bad")).toBe(true);
  });
});
