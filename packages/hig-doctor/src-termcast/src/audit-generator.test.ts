import { describe, test, expect } from "bun:test";
import { generateAuditMarkdown } from "./audit-generator";
import type { CategorySummary } from "./categorizer";
import type { ScanResult } from "./scanner";

function makeScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    directory: "/tmp/MyApp",
    frameworks: ["swiftui"],
    codeFiles: [],
    styleFiles: [],
    configFiles: [],
    markupFiles: [],
    swiftFiles: [],
    infoPlistPaths: [],
    assetCatalogs: [],
    storyboards: [],
    xcodeProjects: [],
    packageSwift: null,
    ...overrides,
  };
}

describe("generateAuditMarkdown", () => {
  test("generates markdown with header and categories", () => {
    const swiftFile = { relativePath: "App.swift", absolutePath: "/tmp/MyApp/App.swift", content: "import SwiftUI" };
    const scanResult = makeScanResult({
      codeFiles: [swiftFile],
      swiftFiles: [swiftFile],
      infoPlistPaths: ["Info.plist"],
      assetCatalogs: ["Assets.xcassets"],
    });

    const categories: CategorySummary[] = [{
      skillName: "hig-foundations",
      category: "foundations",
      label: "Foundations",
      matches: [{
        category: "foundations",
        subcategory: "color",
        type: "concern",
        pattern: "hardcodedColor",
        line: 5,
        lineContent: ".foregroundColor(.red)",
        file: "App.swift",
      }],
      concerns: 1,
      positives: 0,
      patterns: 0,
      fileCount: 1,
      files: ["App.swift"],
    }];

    const md = generateAuditMarkdown(scanResult, categories, null);
    expect(md).toContain("# HIG Audit: MyApp");
    expect(md).toContain("## Instructions for AI Evaluator");
    expect(md).toContain("## Category: Foundations");
    expect(md).toContain(".foregroundColor(.red)");
    expect(md).toContain("Scoring Summary");
    expect(md).toContain("swiftui");
  });

  test("includes skill content when provided", () => {
    const scanResult = makeScanResult();
    const categories: CategorySummary[] = [{
      skillName: "hig-foundations",
      category: "foundations",
      label: "Foundations",
      matches: [],
      concerns: 0,
      positives: 0,
      patterns: 0,
      fileCount: 0,
      files: [],
    }];

    const skillContents = new Map<string, string>();
    skillContents.set("hig-foundations", "Use system colors for automatic dark mode support.");

    const md = generateAuditMarkdown(scanResult, categories, null, skillContents);
    expect(md).toContain("Use system colors for automatic dark mode support.");
  });

  test("handles empty categories gracefully", () => {
    const scanResult = makeScanResult({ directory: "/tmp/EmptyApp" });
    const md = generateAuditMarkdown(scanResult, [], null);
    expect(md).toContain("# HIG Audit: EmptyApp");
    expect(md).toContain("0 potential concerns");
  });

  test("uses correct code language for TSX files", () => {
    const scanResult = makeScanResult({ frameworks: ["nextjs"] });
    const categories: CategorySummary[] = [{
      skillName: "hig-foundations",
      category: "foundations",
      label: "Foundations",
      matches: [{
        category: "foundations",
        subcategory: "accessibility",
        type: "positive",
        pattern: "aria-label",
        line: 3,
        lineContent: '<button aria-label="Close">',
        file: "Header.tsx",
      }],
      concerns: 0,
      positives: 1,
      patterns: 0,
      fileCount: 1,
      files: ["Header.tsx"],
    }];

    const md = generateAuditMarkdown(scanResult, categories, null);
    expect(md).toContain("```tsx");
    expect(md).toContain("nextjs");
  });
});
