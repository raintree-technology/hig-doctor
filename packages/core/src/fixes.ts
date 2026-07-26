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
  apply: (line: string, context?: FixContext) => string | null;
}

interface FixContext {
  startsInBlockComment: boolean;
  startsInQuote: string | null;
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

// Rewrite only the parts of a stylesheet line that are actual declarations,
// leaving quoted values and comments untouched. A blanket line-level replace
// would edit `content: "text-align: left"` — changing what the page renders,
// which a "safe" fix must never do — and would silently reword an author's
// comment about the very property being changed.
function replaceInCssCode(
  line: string,
  transform: (segment: string) => string,
  startsInBlockComment = false,
  startsInQuote: string | null = null,
): string {
  let out = "";
  let segment = "";
  let i = 0;
  let quote = startsInQuote;
  let inBlockComment = startsInBlockComment;
  while (i < line.length) {
    if (inBlockComment) {
      const end = line.indexOf("*/", i);
      if (end === -1) return out + line.slice(i);
      out += line.slice(i, end + 2);
      i = end + 2;
      inBlockComment = false;
      continue;
    }
    const ch = line[i];
    if (quote) {
      out += ch;
      if (ch === "\\" && i + 1 < line.length) { out += line[i + 1]; i += 2; continue; }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      out += transform(segment); segment = "";
      quote = ch; out += ch; i++;
      continue;
    }
    if (ch === "/" && line[i + 1] === "*") {
      out += transform(segment); segment = "";
      const end = line.indexOf("*/", i + 2);
      if (end === -1) { out += line.slice(i); return out; }
      out += line.slice(i, end + 2);
      i = end + 2;
      continue;
    }
    segment += ch;
    i++;
  }
  return out + transform(segment);
}

function lineStartContexts(content: string): FixContext[] {
  const lines = content.split("\n");
  const contexts: FixContext[] = [];
  let inBlockComment = false;
  let quote: string | null = null;

  for (const line of lines) {
    contexts.push({ startsInBlockComment: inBlockComment, startsInQuote: quote });
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inBlockComment) {
        if (ch === "*" && line[i + 1] === "/") {
          inBlockComment = false;
          i++;
        }
        continue;
      }
      if (quote) {
        if (ch === "\\") {
          i++;
        } else if (ch === quote) {
          quote = null;
        }
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === "/" && line[i + 1] === "*") {
        inBlockComment = true;
        i++;
      }
    }
    if (quote) {
      let trailingBackslashes = 0;
      for (let i = line.length - 1; i >= 0 && line[i] === "\\"; i--) {
        trailingBackslashes++;
      }
      // An escaped newline continues a CSS string. An unescaped newline ends
      // malformed string input so it cannot hide comments in every later line.
      if (trailingBackslashes % 2 === 0) quote = null;
    }
  }
  return contexts;
}

const FIXERS: Record<string, Fixer> = {
  "css/physical-text-align": {
    safe: true,
    description: "Use logical text-align (start/end) so text follows writing direction.",
    apply: (line, context) => {
      const fixed = replaceInCssCode(line, seg =>
        seg
          .replace(/text-align:\s*left\b/g, "text-align: start")
          .replace(/text-align:\s*right\b/g, "text-align: end"),
        context?.startsInBlockComment,
        context?.startsInQuote,
      );
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

/** Compute a suggested fix with the surrounding file context needed for safe CSS edits. */
export function suggestFixInContent(
  match: Pick<PatternMatch, "ruleId" | "line">,
  content: string,
): SuggestedFix | null {
  const idx = match.line - 1;
  const rawLine = content.split("\n")[idx];
  if (rawLine === undefined) return null;
  const fixer = FIXERS[match.ruleId];
  if (!fixer) return null;
  const after = fixer.apply(rawLine, lineStartContexts(content)[idx]);
  if (after === null || after === rawLine) return null;
  return {
    ruleId: match.ruleId,
    line: match.line,
    before: rawLine,
    after,
    safe: fixer.safe,
    description: fixer.description,
  };
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
  const contexts = lineStartContexts(content);
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
    const after = fixer.apply(rawLine, contexts[idx]);
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
