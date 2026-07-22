import { describe, test, expect } from "bun:test";
import { analyzeTsx, astTsxAvailable, AST_TSX_RULES } from "./ast-tsx";
import { analyzeFile } from "../analyze";

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

  test("replaces regex verdicts for AST-owned rules (no duplicate findings)", () => {
    const out = analyzeFile('const I = () => <img src="/x.png" />;', "I.tsx");
    const alts = out.filter(m => m.ruleId === "web/missing-alt");
    expect(alts.length).toBe(1);
    expect([...AST_TSX_RULES]).toContain("web/missing-alt");
  });
});
