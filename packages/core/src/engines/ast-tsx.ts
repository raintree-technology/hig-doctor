// ast-tsx.ts — TypeScript-compiler-backed JSX analysis.
//
// The regex tier judges JSX attributes with document-scope regexes that break
// on nested `>` inside expressions, multi-line elements, and spread props. This
// engine parses the file with the real TypeScript compiler and inspects the JSX
// AST, so it both removes those false positives and honestly abstains when a
// spread attribute makes the answer unknowable.
//
// typescript is an OPTIONAL dependency: when it can't be resolved the engine
// reports itself unavailable and the regex tier stands as the fallback, exactly
// as the rule catalog's engine tags advertise.
import { createRequire } from "node:module";
import type { PatternMatch, Severity } from "../patterns";
import { getRuleById } from "../patterns";

// Rule IDs this engine authoritatively decides for .tsx/.jsx files. When the
// engine runs, regex findings for these IDs are discarded and replaced with the
// engine's verdict.
export const AST_TSX_RULES = new Set([
  "web/missing-alt",
  "web/image-without-alt",
  "web/div-with-on-click-no-role",
  "web/span-with-on-click-no-role",
  "web/positive-tabindex",
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TS = any;
let tsModule: TS | null | undefined;

function loadTs(): TS | null {
  if (tsModule !== undefined) return tsModule;
  try {
    // createRequire keeps this a runtime resolution (not bundled by esbuild,
    // which marks typescript external) so a missing optional dep is survivable.
    tsModule = createRequire(import.meta.url)("typescript");
  } catch {
    tsModule = null;
  }
  return tsModule;
}

export function astTsxAvailable(): boolean {
  return loadTs() != null;
}

function isTsxFile(file: string): boolean {
  return /\.(tsx|jsx)$/.test(file);
}

interface Finding {
  ruleId: string;
  line: number;
  lineContent: string;
}

function push(findings: Finding[], ruleId: string, ts: TS, node: TS, source: TS): void {
  const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
  const text = source.text.split("\n")[line] ?? "";
  findings.push({ ruleId, line: line + 1, lineContent: text.trim() });
}

/**
 * Analyze a JSX/TSX file. Returns null when typescript is unavailable or the
 * file isn't JSX — the caller then keeps the regex findings unchanged.
 */
export function analyzeTsx(code: string, file: string): PatternMatch[] | null {
  if (!isTsxFile(file)) return null;
  const ts = loadTs();
  if (!ts) return null;

  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings: Finding[] = [];

  const attrs = (opening: TS): { names: Set<string>; hasSpread: boolean; byName: Map<string, TS> } => {
    const names = new Set<string>();
    const byName = new Map<string, TS>();
    let hasSpread = false;
    for (const prop of opening.attributes.properties) {
      if (ts.isJsxSpreadAttribute(prop)) { hasSpread = true; continue; }
      if (ts.isJsxAttribute(prop) && prop.name) {
        const name = prop.name.getText(source);
        names.add(name);
        byName.set(name, prop);
      }
    }
    return { names, hasSpread, byName };
  };

  const tagNameOf = (opening: TS): string => opening.tagName.getText(source);

  const attrIsTruthy = (attr: TS): boolean => {
    // <x aria-hidden />, aria-hidden="true", aria-hidden={true}
    if (!attr.initializer) return true;
    if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text === "true";
    if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
      return attr.initializer.expression.kind === ts.SyntaxKind.TrueKeyword;
    }
    return false;
  };

  const positiveTabIndex = (attr: TS): boolean => {
    if (!attr.initializer) return false;
    let raw: string | null = null;
    if (ts.isStringLiteral(attr.initializer)) raw = attr.initializer.text;
    else if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
      const e = attr.initializer.expression;
      if (ts.isNumericLiteral(e)) raw = e.text;
      else if (ts.isPrefixUnaryExpression?.(e) && e.operator === ts.SyntaxKind.MinusToken) raw = "-1";
    }
    if (raw == null) return false;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0;
  };

  const visitOpening = (opening: TS) => {
    const tag = tagNameOf(opening);
    const { names, hasSpread, byName } = attrs(opening);

    // <img> / <Image> without alt. Spread props may carry alt → abstain.
    if ((tag === "img" || tag === "Image") && !hasSpread && !names.has("alt")) {
      push(findings, "web/missing-alt", ts, opening.parent ?? opening, source);
    }

    // Lowercase host <div>/<span> with onClick and no role/interactive semantics.
    if ((tag === "div" || tag === "span") && names.has("onClick") && !hasSpread) {
      const interactive = names.has("role") || names.has("tabIndex") ||
        names.has("onKeyDown") || names.has("onKeyPress") || names.has("onKeyUp");
      if (!interactive) {
        const ruleId = tag === "div" ? "web/div-with-on-click-no-role" : "web/span-with-on-click-no-role";
        push(findings, ruleId, ts, opening.parent ?? opening, source);
      }
    }

    // Positive tabIndex on any element.
    const tabIndexAttr = byName.get("tabIndex");
    if (tabIndexAttr && positiveTabIndex(tabIndexAttr)) {
      push(findings, "web/positive-tabindex", ts, opening.parent ?? opening, source);
    }

    void attrIsTruthy; // reserved for future aria-hidden-on-focusable AST rule
  };

  const walk = (node: TS) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      visitOpening(node);
    }
    ts.forEachChild(node, walk);
  };
  walk(source);

  return findings.map(f => {
    const meta = getRuleById(f.ruleId);
    return {
      ruleId: f.ruleId,
      engine: "ast-tsx" as const,
      category: meta?.category ?? "foundations",
      subcategory: meta?.subcategory ?? "accessibility",
      type: "concern" as const,
      pattern: meta?.label ?? f.ruleId,
      line: f.line,
      lineContent: f.lineContent,
      file,
      severity: (meta?.severity ?? "moderate") as Severity,
    };
  });
}
