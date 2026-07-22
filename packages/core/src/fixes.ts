// fixes.ts — mechanical autofixes and machine-readable suggestions.
//
// A fixer maps a source line that triggered a rule to a corrected line. Fixers
// are marked `safe` when the transform is unambiguous and behavior-preserving
// (applied by `--fix`); `unsafe` fixers only ever surface as suggestions for a
// human or agent to review (in JSON output and SARIF `fixes`), never written to
// disk automatically. Fixers operate on a single line, so they compose with the
// line-oriented scanner and never need the whole AST.
import type { PatternMatch } from "./patterns";

export interface SuggestedFix {
  ruleId: string;
  line: number;
  before: string;
  after: string;
  safe: boolean;
  description: string;
}

interface Fixer {
  safe: boolean;
  description: string;
  apply: (line: string) => string | null;
}

// Remove a comma-separated token (and a dangling separator) from a viewport
// content string, e.g. "width=device-width, user-scalable=no" → "width=device-width".
function stripViewportToken(line: string, token: RegExp): string | null {
  if (!token.test(line)) return null;
  let out = line
    .replace(new RegExp(`\\s*,\\s*${token.source}`, "i"), "")
    .replace(new RegExp(`${token.source}\\s*,\\s*`, "i"), "")
    .replace(new RegExp(`\\s*${token.source}`, "i"), "");
  // Tidy any doubled or trailing commas the removal left behind.
  out = out.replace(/,\s*,/g, ", ").replace(/,\s*(["'])/g, "$1").replace(/=\s*,/g, "=");
  return out === line ? null : out;
}

const FIXERS: Record<string, Fixer> = {
  "css/physical-text-align": {
    safe: true,
    description: "Use logical text-align (start/end) so text follows writing direction.",
    apply: (line) => {
      const fixed = line
        .replace(/text-align:\s*left\b/g, "text-align: start")
        .replace(/text-align:\s*right\b/g, "text-align: end");
      return fixed === line ? null : fixed;
    },
  },
  "web/user-scalable-no": {
    safe: true,
    description: "Remove user-scalable=no so pinch-zoom keeps working.",
    apply: (line) => stripViewportToken(line, /user-scalable\s*=\s*no/),
  },
  "web/maximum-scale-1": {
    safe: true,
    description: "Remove maximum-scale=1 so users can zoom.",
    apply: (line) => stripViewportToken(line, /maximum-scale\s*=\s*1(?:\.0)?/),
  },
  "swift/navigation-view-deprecated": {
    // Unsafe: a NavigationView with a sidebar should become NavigationSplitView,
    // which a line-level transform can't tell apart. Suggest the common case.
    safe: false,
    description: "Replace NavigationView with NavigationStack (or NavigationSplitView for sidebar layouts).",
    apply: (line) => {
      const fixed = line.replace(/\bNavigationView\b/g, "NavigationStack");
      return fixed === line ? null : fixed;
    },
  },
  "web/positive-tabindex": {
    // Unsafe: dropping to 0 changes focus order; the author must confirm intent.
    safe: false,
    description: "Use tabIndex 0 (or -1); positive values override the natural focus order.",
    apply: (line) => {
      const fixed = line
        .replace(/tabIndex=\{\s*[1-9]\d*\s*\}/g, "tabIndex={0}")
        .replace(/tabindex=(["'])[1-9]\d*\1/g, "tabindex=$10$1");
      return fixed === line ? null : fixed;
    },
  },
};

export function isFixable(ruleId: string): boolean {
  return ruleId in FIXERS;
}

/** Compute the suggested fix for a match given the raw (untrimmed) source line. */
export function suggestFix(match: Pick<PatternMatch, "ruleId" | "line">, rawLine: string): SuggestedFix | null {
  const fixer = FIXERS[match.ruleId];
  if (!fixer) return null;
  const after = fixer.apply(rawLine);
  if (after === null || after === rawLine) return null;
  return { ruleId: match.ruleId, line: match.line, before: rawLine, after, safe: fixer.safe, description: fixer.description };
}

export interface FixApplication {
  content: string;
  applied: SuggestedFix[];
  /** Unsafe fixes that were surfaced but not written. */
  suggestions: SuggestedFix[];
}

/**
 * Apply every SAFE fix for the given matches to a file's content and collect
 * the unsafe ones as suggestions. Matches must belong to this file. At most one
 * fixer runs per (line, rule); multiple rules on one line apply in sequence.
 */
export function applyFixes(content: string, matches: PatternMatch[]): FixApplication {
  const lines = content.split("\n");
  const applied: SuggestedFix[] = [];
  const suggestions: SuggestedFix[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    const fixer = FIXERS[match.ruleId];
    if (!fixer) continue;
    const idx = match.line - 1;
    if (idx < 0 || idx >= lines.length) continue;
    const key = `${match.line}:${match.ruleId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const rawLine = lines[idx];
    const after = fixer.apply(rawLine);
    if (after === null || after === rawLine) continue;
    const fix: SuggestedFix = { ruleId: match.ruleId, line: match.line, before: rawLine, after, safe: fixer.safe, description: fixer.description };
    if (fixer.safe) {
      lines[idx] = after;
      applied.push(fix);
    } else {
      suggestions.push(fix);
    }
  }

  return { content: lines.join("\n"), applied, suggestions };
}
