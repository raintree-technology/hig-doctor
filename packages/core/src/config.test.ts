import { describe, test, expect } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseConfig, loadConfig, applyConfig } from "./config";
import type { PatternMatch } from "./patterns";
import { audit } from "./audit";

const match = (over: Partial<PatternMatch>): PatternMatch => ({
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

describe("parseConfig", () => {
  test("accepts rules, ignore, and overrides", () => {
    const { config, warnings } = parseConfig(
      JSON.stringify({
        rules: { "swift/hardcoded-color": "off", "web/*": "serious" },
        ignore: ["legacy/**"],
        overrides: [{ files: ["marketing/**"], rules: { "css/outline-none": "off" } }],
      }),
      "cfg",
    );
    expect(config.rules?.["swift/hardcoded-color"]).toBe("off");
    expect(config.ignore).toEqual(["legacy/**"]);
    expect(config.overrides?.length).toBe(1);
    expect(warnings).toEqual([]);
  });

  test("warns on unknown exact rule IDs but not on globs", () => {
    const { warnings } = parseConfig(
      JSON.stringify({ rules: { "swift/does-not-exist": "off", "nope/*": "off" } }),
      "cfg",
    );
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain("swift/does-not-exist");
  });

  test("rejects invalid settings, shapes, and JSON", () => {
    expect(() => parseConfig(JSON.stringify({ rules: { "swift/hardcoded-color": "loud" } }), "cfg")).toThrow("invalid setting");
    expect(() => parseConfig(JSON.stringify({ ignore: "legacy/**" }), "cfg")).toThrow('"ignore" must be an array');
    expect(() => parseConfig(JSON.stringify({ overrides: [{ rules: {} }] }), "cfg")).toThrow('"files" must be a non-empty array');
    expect(() => parseConfig("{nope", "cfg")).toThrow("not valid JSON");
  });
});

describe("applyConfig", () => {
  test("off drops matches; severities remap concerns only", () => {
    const matches = [
      match({}),
      match({ ruleId: "swift/navigation-view-deprecated", pattern: "NavigationView (deprecated)" }),
      match({ ruleId: "swift/semantic-color", type: "positive", severity: undefined }),
    ];
    const out = applyConfig(matches, {
      rules: {
        "swift/hardcoded-color": "off",
        "swift/navigation-view-deprecated": "critical",
        "swift/semantic-color": "serious",
      },
    });
    expect(out.length).toBe(2);
    expect(out[0].severity).toBe("critical");
    expect(out[1].severity).toBeUndefined(); // positives never gain a severity
  });

  test("prefix globs apply with longest-prefix precedence", () => {
    const out = applyConfig([match({})], {
      rules: { "swift/*": "off", "swift/hardcoded-*": "critical" },
    });
    expect(out.length).toBe(1);
    expect(out[0].severity).toBe("critical");
  });

  test("per-path overrides beat global rules, last override wins", () => {
    const matches = [match({ file: "marketing/Hero.swift" }), match({ file: "app/Main.swift" })];
    const out = applyConfig(matches, {
      rules: { "swift/hardcoded-color": "critical" },
      overrides: [
        { files: ["marketing/**"], rules: { "swift/hardcoded-color": "off" } },
      ],
    });
    expect(out.length).toBe(1);
    expect(out[0].file).toBe("app/Main.swift");
    expect(out[0].severity).toBe("critical");
  });
});

describe("audit config integration", () => {
  test("discovers hig-doctor.config.json: ignore globs and rule offs apply", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-config-"));
    try {
      await writeFile(join(dir, "View.swift"), ".foregroundColor(.red)\n");
      await writeFile(join(dir, "Legacy.swift"), ".foregroundColor(.blue)\n");
      await writeFile(
        join(dir, "hig-doctor.config.json"),
        JSON.stringify({ ignore: ["Legacy.swift"], rules: { "swift/hardcoded-color": "off" } }),
      );
      const result = await audit(dir);
      expect(result.configPath).toContain("hig-doctor.config.json");
      expect(result.scanResult.codeFiles.map(f => f.relativePath)).toEqual(["View.swift"]);
      expect(result.allMatches.filter(m => m.ruleId === "swift/hardcoded-color")).toEqual([]);
    } finally {
      await rm(dir, { recursive: true });
    }
  });

  test("noConfig skips discovery", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-config-"));
    try {
      await writeFile(join(dir, "View.swift"), ".foregroundColor(.red)\n");
      await writeFile(
        join(dir, "hig-doctor.config.json"),
        JSON.stringify({ rules: { "swift/hardcoded-color": "off" } }),
      );
      const result = await audit(dir, undefined, { noConfig: true });
      expect(result.configPath).toBeNull();
      expect(result.allMatches.some(m => m.ruleId === "swift/hardcoded-color")).toBe(true);
    } finally {
      await rm(dir, { recursive: true });
    }
  });
});
