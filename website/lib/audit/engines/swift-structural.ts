// swift-structural.ts — dependency-free structural refinement for Swift.
//
// The regex tier flags every `Image(systemName:)` and every `.onTapGesture {`
// as a possible accessibility concern. Most are fine: the image carries an
// accessibility modifier, or the tap target is already a Button. This analyzer
// walks the chained-modifier expression around each such match (comments and
// string literals stripped, newlines folded) and drops the finding when the
// structure proves it is handled. Survivors are re-tagged engine
// "swift-structural" so the engine that judged them is visible.
import type { PatternMatch } from "../patterns";

// Accessibility modifiers whose presence in an Image's modifier chain means the
// image is labeled or intentionally hidden — not a concern.
const A11Y_MODIFIERS = [
  "accessibilityLabel",
  "accessibilityHidden",
  "accessibilityHint",
  "accessibilityValue",
  "accessibilityElement",
  "accessibilityRepresentation",
  "accessibilityAddTraits",
  "accessibilityLabeledPair",
];

// Strip // line comments, /* */ block comments, and "..." string contents so
// the structural scan never trips on commented code or string payloads. String
// delimiters are preserved as empty "" so token adjacency is unchanged.
function stripSwift(code: string): string {
  let out = "";
  let i = 0;
  const n = code.length;
  let inBlock = false;
  let inString = false;
  while (i < n) {
    const c = code[i];
    const c2 = i + 1 < n ? code[i + 1] : "";
    if (inBlock) {
      if (c === "*" && c2 === "/") { inBlock = false; i += 2; } else { i++; }
      continue;
    }
    if (inString) {
      if (c === "\\") { i += 2; continue; }
      if (c === '"') { inString = false; out += '"'; i++; continue; }
      i++;
      continue;
    }
    if (c === "/" && c2 === "*") { inBlock = true; i += 2; continue; }
    if (c === "/" && c2 === "/") {
      while (i < n && code[i] !== "\n") i++;
      continue;
    }
    if (c === '"') { inString = true; out += '"'; i++; continue; }
    out += c;
    i++;
  }
  return out;
}

// From an index just after a token, capture the run of chained modifiers:
// a sequence of `.identifier` / `.identifier(...)` / `.identifier { ... }`
// possibly spanning newlines and whitespace, stopping when the chain ends
// (a token that is not part of a member-access continuation). Returns the
// concatenated modifier identifiers seen in the chain.
function chainedModifiers(stripped: string, from: number): string[] {
  const mods: string[] = [];
  let i = from;
  const n = stripped.length;
  const skipWs = () => { while (i < n && /\s/.test(stripped[i])) i++; };

  // Consume a balanced (...) or {...} group starting at i (which must be the open char).
  const skipGroup = (open: string, close: string) => {
    let depth = 0;
    for (; i < n; i++) {
      const ch = stripped[i];
      if (ch === open) depth++;
      else if (ch === close) { depth--; if (depth === 0) { i++; return; } }
    }
  };

  // First, if the token itself is a call, skip its argument group.
  skipWs();
  if (stripped[i] === "(") skipGroup("(", ")");

  while (true) {
    skipWs();
    if (stripped[i] !== ".") break;
    i++; // consume the dot
    skipWs();
    let id = "";
    while (i < n && /[A-Za-z0-9_]/.test(stripped[i])) { id += stripped[i]; i++; }
    if (id === "") break;
    mods.push(id);
    skipWs();
    if (stripped[i] === "(") skipGroup("(", ")");
    skipWs();
    if (stripped[i] === "{") skipGroup("{", "}");
  }
  return mods;
}

// Map a character index in the stripped source to a 1-based line number using
// the ORIGINAL source's newline positions. stripSwift preserves newlines, so
// indices align between stripped and original.
function lineAt(stripped: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < stripped.length; i++) {
    if (stripped[i] === "\n") line++;
  }
  return line;
}

/**
 * Refine Swift matches: drop `Image without a11y` and `onTapGesture without
 * traits` findings that structural analysis proves are handled, and re-tag the
 * survivors engine "swift-structural". Other matches pass through untouched.
 */
export function refineSwift(matches: PatternMatch[], code: string): PatternMatch[] {
  const swiftRefined = new Set(["Image without a11y", "onTapGesture without traits"]);
  if (!matches.some(m => swiftRefined.has(m.pattern))) return matches;

  const stripped = stripSwift(code);

  // Precompute, per refined pattern, the set of lines where the structure shows
  // the finding is handled (so it should be dropped).
  const handledImageLines = new Set<number>();
  const handledTapLines = new Set<number>();

  // Images: for each Image(systemName: ...) occurrence, inspect its modifier chain.
  for (const m of stripped.matchAll(/\bImage\s*\(\s*systemName:/g)) {
    const idx = m.index ?? 0;
    // Move to the "(" so chainedModifiers skips the Image(...) argument group.
    const parenIdx = stripped.indexOf("(", idx);
    const mods = chainedModifiers(stripped, parenIdx);
    if (mods.some(mod => A11Y_MODIFIERS.includes(mod))) {
      handledImageLines.add(lineAt(stripped, idx));
    }
  }

  // onTapGesture: handled when the same chain carries an accessibility trait/
  // label, i.e. the tappable view is exposed to assistive tech.
  for (const m of stripped.matchAll(/\.onTapGesture\s*\{/g)) {
    const idx = m.index ?? 0;
    // Look at the modifier chain that continues AFTER the onTapGesture closure.
    const braceIdx = stripped.indexOf("{", idx);
    // Skip the closure body, then read subsequent modifiers.
    let j = braceIdx;
    let depth = 0;
    for (; j < stripped.length; j++) {
      if (stripped[j] === "{") depth++;
      else if (stripped[j] === "}") { depth--; if (depth === 0) { j++; break; } }
    }
    const after = chainedModifiers(stripped, j);
    if (after.some(mod => A11Y_MODIFIERS.includes(mod))) {
      handledTapLines.add(lineAt(stripped, idx));
    }
  }

  const out: PatternMatch[] = [];
  for (const match of matches) {
    if (match.pattern === "Image without a11y") {
      if (handledImageLines.has(match.line)) continue; // structurally handled
      out.push({ ...match, engine: "swift-structural" });
    } else if (match.pattern === "onTapGesture without traits") {
      if (handledTapLines.has(match.line)) continue;
      out.push({ ...match, engine: "swift-structural" });
    } else {
      out.push(match);
    }
  }
  return out;
}
