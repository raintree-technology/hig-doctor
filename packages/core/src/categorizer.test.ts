import { describe, test, expect } from "bun:test";
import { categorizeMatches } from "./categorizer";
import type { PatternMatch } from "./patterns";

describe("categorizeMatches", () => {
  test("groups matches by HIG skill name", () => {
    const matches: PatternMatch[] = [
      { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcodedColor", line: 1, lineContent: ".foregroundColor(.red)", file: "A.swift" },
      { category: "foundations", subcategory: "typography", type: "positive", pattern: "dynamicTypeStyle", line: 2, lineContent: ".font(.body)", file: "A.swift" },
      { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "TabView", line: 3, lineContent: "TabView {", file: "B.swift" },
    ];
    const categories = categorizeMatches(matches);
    expect(categories.length).toBe(2);
    const foundations = categories.find(c => c.skillName === "hig-foundations");
    expect(foundations).toBeDefined();
    expect(foundations!.concerns).toBe(1);
    expect(foundations!.positives).toBe(1);
    expect(foundations!.label).toBe("Foundations");
    expect(foundations!.files).toContain("A.swift");
    const layout = categories.find(c => c.skillName === "hig-components-layout");
    expect(layout).toBeDefined();
    expect(layout!.patterns).toBe(1);
    expect(layout!.label).toBe("Layout & Navigation");
  });

  test("sorts categories by match count descending", () => {
    const matches: PatternMatch[] = [
      { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcodedColor", line: 1, lineContent: ".foregroundColor(.red)", file: "A.swift" },
      { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "TabView", line: 3, lineContent: "TabView {", file: "B.swift" },
      { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NavigationStack", line: 4, lineContent: "NavigationStack {", file: "B.swift" },
      { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "List", line: 5, lineContent: "List {", file: "C.swift" },
    ];
    const categories = categorizeMatches(matches);
    expect(categories[0].skillName).toBe("hig-components-layout");
    expect(categories[1].skillName).toBe("hig-foundations");
  });

  test("counts files per category", () => {
    const matches: PatternMatch[] = [
      { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcodedColor", line: 1, lineContent: ".foregroundColor(.red)", file: "A.swift" },
      { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcodedColor", line: 2, lineContent: ".foregroundColor(.blue)", file: "B.swift" },
    ];
    const categories = categorizeMatches(matches);
    expect(categories[0].fileCount).toBe(2);
  });

  test("returns empty array for no matches", () => {
    const categories = categorizeMatches([]);
    expect(categories.length).toBe(0);
  });
});
