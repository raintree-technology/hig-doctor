import { describe, test, expect } from "bun:test";
import { suggestFix, suggestFixInContent, applyFixes, isFixable } from "./fixes";
import type { PatternMatch } from "./patterns";

const m = (over: Partial<PatternMatch>): PatternMatch => ({
  ruleId: "css/physical-text-align",
  engine: "regex",
  category: "foundations",
  subcategory: "i18n",
  type: "concern",
  pattern: "physical text-align",
  line: 1,
  lineContent: "text-align: left;",
  file: "a.css",
  severity: "moderate",
  ...over,
});

// A "safe" fix must be behavior-preserving. Rewriting a quoted value changes
// what the page renders, and rewriting a comment silently rewords the author's
// note about the very declaration being changed.
describe("suggestFix — leaves strings and comments alone", () => {
  test("fixes the declaration but not an identical string value", () => {
    const line = '.a::before { content: "text-align: left"; text-align: left; }';
    const fix = suggestFix(m({}), line);
    expect(fix?.after).toBe('.a::before { content: "text-align: left"; text-align: start; }');
  });

  test("fixes the declaration but not a trailing comment", () => {
    const line = ".b { text-align: left; } /* keep text-align: left for legacy */";
    const fix = suggestFix(m({}), line);
    expect(fix?.after).toBe(".b { text-align: start; } /* keep text-align: left for legacy */");
  });

  test("handles single quotes and an interior comment", () => {
    expect(suggestFix(m({}), ".g::after { content: 'text-align: right'; }")).toBeNull();
    const line = ".f { text-align: left; /* was right */ text-align: right; }";
    expect(suggestFix(m({}), line)?.after).toBe(
      ".f { text-align: start; /* was right */ text-align: end; }",
    );
  });

  test("preserves a CRLF line ending", () => {
    expect(suggestFix(m({}), ".c { text-align: left; }\r")?.after).toBe(".c { text-align: start; }\r");
  });

  test("uses file context to preserve a multi-line comment before a declaration", () => {
    const content = `.d { /* Keep this note:
  text-align: left is required for the legacy view. */ text-align: left;
}`;
    const fix = suggestFixInContent(m({ line: 2 }), content);
    expect(fix?.after).toBe(
      "  text-align: left is required for the legacy view. */ text-align: start;",
    );
  });

  test("uses file context to preserve an escaped multi-line string", () => {
    const content = `.f::before { content: "Keep \\
text-align: left"; text-align: left; }`;
    const fix = suggestFixInContent(m({ line: 2 }), content);
    expect(fix?.after).toBe('text-align: left"; text-align: start; }');
  });
});

describe("suggestFix", () => {
  test("safe: physical → logical text-align", () => {
    const fix = suggestFix(m({}), "  text-align: left;");
    expect(fix?.safe).toBe(true);
    expect(fix?.after).toBe("  text-align: start;");
  });

  test("safe: strips user-scalable=no from a viewport meta, preserving the rest", () => {
    const fix = suggestFix(
      m({ ruleId: "web/user-scalable-no", file: "i.html" }),
      `<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">`,
    );
    expect(fix?.safe).toBe(true);
    expect(fix?.after).toBe(`<meta name="viewport" content="width=device-width, initial-scale=1">`);
  });

  test("safe: strips maximum-scale=1", () => {
    const fix = suggestFix(
      m({ ruleId: "web/maximum-scale-1", file: "i.html" }),
      `<meta name="viewport" content="width=device-width, maximum-scale=1.0">`,
    );
    expect(fix?.after).toContain("width=device-width");
    expect(fix?.after).not.toContain("maximum-scale");
  });

  test("unsafe: NavigationView → NavigationStack is a suggestion, not safe", () => {
    const fix = suggestFix(m({ ruleId: "swift/navigation-view-deprecated", file: "V.swift" }), "    NavigationView {");
    expect(fix?.safe).toBe(false);
    expect(fix?.after).toBe("    NavigationStack {");
  });

  test("unsafe: positive tabIndex → 0", () => {
    expect(suggestFix(m({ ruleId: "web/positive-tabindex", file: "F.tsx" }), "<div tabIndex={3} />")?.after).toBe("<div tabIndex={0} />");
    expect(suggestFix(m({ ruleId: "web/positive-tabindex", file: "F.tsx" }), `<div tabindex="5" />`)?.after).toBe(`<div tabindex="0" />`);
  });

  test("returns null for rules without a fixer or when nothing changes", () => {
    expect(suggestFix(m({ ruleId: "web/missing-alt" }), "<img>")).toBeNull();
    expect(suggestFix(m({}), "text-align: center;")).toBeNull();
    expect(isFixable("css/physical-text-align")).toBe(true);
    expect(isFixable("web/missing-alt")).toBe(false);
  });
});

describe("applyFixes", () => {
  test("applies safe fixes to content, collects unsafe as suggestions", () => {
    const content = `.a { text-align: left; }\n.b { text-align: right; }\nNavigationView {`;
    const matches = [
      m({ ruleId: "css/physical-text-align", line: 1 }),
      m({ ruleId: "css/physical-text-align", line: 2, lineContent: "text-align: right;" }),
      m({ ruleId: "swift/navigation-view-deprecated", line: 3, lineContent: "NavigationView {" }),
    ];
    const out = applyFixes(content, matches);
    expect(out.applied.length).toBe(2);
    expect(out.suggestions.length).toBe(1);
    expect(out.content).toContain("text-align: start;");
    expect(out.content).toContain("text-align: end;");
    // Unsafe fix is NOT written into content.
    expect(out.content).toContain("NavigationView {");
  });

  test("applies at most one fixer per (line, rule) and ignores out-of-range lines", () => {
    const content = `text-align: left;`;
    const matches = [m({ line: 1 }), m({ line: 1 }), m({ line: 99 })];
    const out = applyFixes(content, matches);
    expect(out.applied.length).toBe(1);
    expect(out.content).toBe("text-align: start;");
  });

  test("does not rewrite text inside a multi-line comment on a matched line", () => {
    const content = `.e { /* Keep this note:
  text-align: right is intentional. */ text-align: right;
}`;
    const out = applyFixes(content, [m({ line: 2 })]);
    expect(out.content).toBe(`.e { /* Keep this note:
  text-align: right is intentional. */ text-align: end;
}`);
    expect(out.applied).toHaveLength(1);
  });

  test("does not rewrite text inside an escaped multi-line string on a matched line", () => {
    const content = `.g::before { content: "Keep \\
text-align: right"; text-align: right; }`;
    const out = applyFixes(content, [m({ line: 2 })]);
    expect(out.content).toBe(`.g::before { content: "Keep \\
text-align: right"; text-align: end; }`);
  });
});
