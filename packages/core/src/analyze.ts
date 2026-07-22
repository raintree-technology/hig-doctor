// analyze.ts — the tiered analysis entry point.
//
// Base tier: detectPatterns (regex, always available, dependency-free).
// Refinement tiers run on top and are strictly precision-improving:
//   - swift-structural: drops handled Image/onTapGesture findings, re-tags survivors.
//   - ast-tsx: for JSX files, replaces the regex verdict on a set of a11y rules
//     with the TypeScript compiler's verdict (removing false positives from
//     multi-line elements and spread props). Falls back to regex when the
//     optional `typescript` dependency is absent.
//
// Every returned match's `engine` reflects the tier that actually produced it.
import { detectPatterns, type PatternMatch } from "./patterns";
import { refineSwift } from "./engines/swift-structural";
import { analyzeTsx, AST_TSX_RULES } from "./engines/ast-tsx";

export function analyzeFile(code: string, file: string): PatternMatch[] {
  let matches = detectPatterns(code, file);

  // Swift structural refinement.
  if (/\.swift$/.test(file)) {
    matches = refineSwift(matches, code);
  }

  // JSX/TSX AST refinement: authoritative for AST_TSX_RULES when TS is present.
  const ast = analyzeTsx(code, file);
  if (ast !== null) {
    // Drop regex findings for the rules the AST engine owns, keep the rest,
    // and splice in the AST verdicts in source order.
    matches = matches.filter(m => !AST_TSX_RULES.has(m.ruleId));
    matches.push(...ast);
    matches.sort((a, b) => a.line - b.line);
  }

  return matches;
}
