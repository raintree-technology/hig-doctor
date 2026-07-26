import { describe, test, expect } from "bun:test";
import { analyzeTsx, astTsxAvailable, isUsableTs, AST_TSX_RULES } from "./ast-tsx";
import { analyzeFile } from "../analyze";

// Under Bun a missing optional `typescript` resolves to a stub object rather
// than throwing, so a bare null check let the engine run and crash on the first
// property access instead of falling back to regex.
describe("typescript capability probe", () => {
  test("rejects stubs and non-modules, accepts the real compiler", () => {
    expect(isUsableTs(null)).toBe(false);
    expect(isUsableTs(undefined)).toBe(false);
    expect(isUsableTs({})).toBe(false);
    expect(isUsableTs({ default: {}, __esModule: true })).toBe(false);
    // Present but missing the JSX predicates the engine calls.
    expect(isUsableTs({ createSourceFile: () => {}, ScriptTarget: {}, ScriptKind: {} })).toBe(false);
    expect(isUsableTs(require("typescript"))).toBe(true);
  });
});

// These tests assume the optional `typescript` dependency is installed (it is in
// this repo's toolchain). They assert the AST tier's precision over regex.
describe.if(astTsxAvailable())("ast-tsx engine", () => {
  test("only runs on .tsx/.jsx files", () => {
    expect(analyzeTsx("<img src='x'/>", "a.ts")).toBeNull();
    expect(analyzeTsx("<img src='x'/>", "a.js")).toBeNull();
    expect(Array.isArray(analyzeTsx("const x = <img src='x'/>;", "a.tsx"))).toBe(true);
  });

  test("abstains on spread props (regex would false-positive)", () => {
    const out = analyzeFile("export const I = (p) => <img {...p} />;", "A.tsx");
    expect(out.filter(m => m.ruleId === "web/missing-alt")).toEqual([]);
  });

  test("flags a genuinely missing alt and tags it ast-tsx", () => {
    const out = analyzeFile('export const I = () => <img src="/x.png" />;', "B.tsx");
    const hit = out.find(m => m.ruleId === "web/missing-alt");
    expect(hit?.engine).toBe("ast-tsx");
  });

  test("does not flag img with alt or decorative empty alt", () => {
    const out = analyzeFile('const I = () => <img src="/x" alt="A cat" />;\nconst J = () => <img src="/y" alt="" />;', "C.tsx");
    expect(out.filter(m => m.ruleId === "web/missing-alt")).toEqual([]);
  });

  test("handles multi-line div onClick with nested > in the handler", () => {
    const code = "export const R = () => (\n  <div\n    onClick={() => setX(a > b)}\n  >\n    Open\n  </div>\n);";
    const out = analyzeFile(code, "D.tsx");
    const hit = out.find(m => m.ruleId === "web/div-with-on-click-no-role");
    expect(hit?.engine).toBe("ast-tsx");
  });

  test("does not flag a clickable div that already has role/tabIndex/keydown", () => {
    const out = analyzeFile('const R = () => <div role="button" tabIndex={0} onKeyDown={k} onClick={go}>Go</div>;', "E.tsx");
    expect(out.filter(m => m.ruleId === "web/div-with-on-click-no-role")).toEqual([]);
  });

  test("detects positive tabIndex but not 0 or -1", () => {
    expect(analyzeFile("const A = () => <div tabIndex={3} />;", "F.tsx").some(m => m.ruleId === "web/positive-tabindex")).toBe(true);
    expect(analyzeFile("const A = () => <div tabIndex={0} />;", "G.tsx").some(m => m.ruleId === "web/positive-tabindex")).toBe(false);
    expect(analyzeFile("const A = () => <div tabIndex={-1} />;", "H.tsx").some(m => m.ruleId === "web/positive-tabindex")).toBe(false);
  });

  // Self-closing elements have no JsxElement wrapper, so reporting the node's
  // parent pointed at the enclosing element instead — which also silently broke
  // line-keyed `hig-disable-next-line` suppression for these rules.
  test("reports the element's own line, not the enclosing element's", () => {
    const code = [
      "export const A = () => (",
      "  <section>",
      "    <p>one</p>",
      '    <img src="/x.png" />',
      "    <span tabIndex={4} />",
      "    <div onClick={go}>hi</div>",
      "  </section>",
      ");",
    ].join("\n");
    const out = analyzeTsx(code, "L.tsx") ?? [];
    const lineOf = (ruleId: string) => out.find(m => m.ruleId === ruleId)?.line;
    expect(lineOf("web/missing-alt")).toBe(4);
    expect(lineOf("web/positive-tabindex")).toBe(5);
    expect(lineOf("web/div-with-on-click-no-role")).toBe(6);
  });

  // The AST tier builds findings outside detectPatterns, so it has to apply
  // inline suppressions itself or `hig-disable-*` silently does nothing here.
  test("honours inline suppressions for AST-owned rules", () => {
    const nextLine = [
      "export const S = () => (",
      "  <section>",
      "    {/* hig-disable-next-line web/missing-alt -- decorative */}",
      '    <img src="/spacer.png" />',
      "  </section>",
      ");",
    ].join("\n");
    expect(analyzeFile(nextLine, "S.tsx").filter(m => m.ruleId === "web/missing-alt")).toEqual([]);

    const fileWide = [
      "// hig-disable-file web/missing-alt",
      'export const T = () => <img src="/a.png" />;',
    ].join("\n");
    expect(analyzeFile(fileWide, "T.tsx").filter(m => m.ruleId === "web/missing-alt")).toEqual([]);

    // A suppression for a different rule must not swallow the finding.
    const otherRule = [
      "export const U = () => (",
      "  <section>",
      "    {/* hig-disable-next-line web/positive-tabindex */}",
      '    <img src="/b.png" />',
      "  </section>",
      ");",
    ].join("\n");
    expect(analyzeFile(otherRule, "U.tsx").some(m => m.ruleId === "web/missing-alt")).toBe(true);
  });

  test("replaces regex verdicts for AST-owned rules (no duplicate findings)", () => {
    const out = analyzeFile('const I = () => <img src="/x.png" />;', "I.tsx");
    const alts = out.filter(m => m.ruleId === "web/missing-alt");
    expect(alts.length).toBe(1);
    expect([...AST_TSX_RULES]).toContain("web/missing-alt");
  });
});
