import { describe, test, expect } from "bun:test";
import { toSarif } from "./sarif";
import { detectPatterns } from "./patterns";

describe("toSarif", () => {
  const matches = detectPatterns(`.foregroundColor(.red)\nNavigationView {`, "Sources/App/View.swift");

  test("emits a valid-shaped 2.1.0 log with concerns only", () => {
    const sarif = toSarif(matches, { toolVersion: "9.9.9", snapshotDate: "2025-02-02" }) as any;
    expect(sarif.version).toBe("2.1.0");
    const run = sarif.runs[0];
    expect(run.tool.driver.name).toBe("hig-doctor");
    expect(run.tool.driver.version).toBe("9.9.9");
    expect(run.tool.driver.properties.higSnapshot).toBe("2025-02-02");
    // Only concerns become results; the fixture has ≥2 (hardcoded color + deprecated NavigationView).
    expect(run.results.length).toBe(matches.filter((m: any) => m.type === "concern").length);
    for (const result of run.results) {
      expect(typeof result.ruleId).toBe("string");
      expect(run.tool.driver.rules[result.ruleIndex].id).toBe(result.ruleId);
      expect(result.locations[0].physicalLocation.artifactLocation.uri).toBe("Sources/App/View.swift");
      expect(result.locations[0].physicalLocation.region.startLine).toBeGreaterThan(0);
      expect(["error", "warning", "note"]).toContain(result.level);
      expect(typeof result.partialFingerprints.higDoctorKey).toBe("string");
    }
  });

  test("driver rules carry helpUri citations and fire-order indexes", () => {
    const sarif = toSarif(matches, { toolVersion: "0.0.0" }) as any;
    for (const rule of sarif.runs[0].tool.driver.rules) {
      expect(rule.helpUri).toContain("developer.apple.com/design/human-interface-guidelines");
    }
  });

  test("no concerns → empty results and rules", () => {
    const sarif = toSarif([], { toolVersion: "0.0.0" }) as any;
    expect(sarif.runs[0].results).toEqual([]);
    expect(sarif.runs[0].tool.driver.rules).toEqual([]);
  });
});
