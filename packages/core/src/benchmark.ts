// benchmark.ts — precision/recall corpus for the rule engine.
//
// Each case is a small source file plus the exact set of concern rule IDs it
// should produce. "bad" fixtures assert true positives (a missing one is a
// false negative); "good" fixtures assert the absence of concerns (any concern
// is a false positive). The harness scores per-rule and overall so regressions
// in either direction are visible. docs/benchmark.md is generated from this.
import { analyzeFile } from "./analyze";

export interface BenchmarkCase {
  id: string;
  framework: string;
  file: string;
  kind: "good" | "bad";
  code: string;
  /** Concern rule IDs this fixture must produce (empty for good fixtures). */
  expect: string[];
}

export const BENCHMARK_CASES: BenchmarkCase[] = [
  // ── Swift / SwiftUI ────────────────────────────────────────────
  {
    id: "swift-color-bad",
    framework: "swift",
    file: "BadColors.swift",
    kind: "bad",
    code: `struct V: View {
  var body: some View {
    Text("Hi").foregroundColor(.red)
    Rectangle().foregroundColor(.blue)
  }
}`,
    expect: ["swift/hardcoded-color", "swift/hardcoded-color"],
  },
  {
    id: "swift-color-good",
    framework: "swift",
    file: "GoodColors.swift",
    kind: "good",
    code: `struct V: View {
  var body: some View {
    Text("Hi").foregroundStyle(.primary)
    Rectangle().foregroundColor(Color("BrandAccent"))
  }
}`,
    expect: [],
  },
  {
    id: "swift-nav-bad",
    framework: "swift",
    file: "BadNav.swift",
    kind: "bad",
    code: `struct Root: View {
  var body: some View {
    NavigationView {
      Text("Legacy")
    }
  }
}`,
    expect: ["swift/navigation-view-deprecated"],
  },
  {
    id: "swift-nav-good",
    framework: "swift",
    file: "GoodNav.swift",
    kind: "good",
    code: `struct Root: View {
  var body: some View {
    NavigationStack {
      Text("Modern")
    }
  }
}`,
    expect: [],
  },
  {
    id: "swift-typography-bad",
    framework: "swift",
    file: "BadType.swift",
    kind: "bad",
    code: `Text("Title").font(.system(size: 24))`,
    expect: ["swift/hardcoded-font-size"],
  },
  {
    id: "swift-typography-good",
    framework: "swift",
    file: "GoodType.swift",
    kind: "good",
    code: `Text("Title").font(.title)`,
    expect: [],
  },

  // ── Web / React ────────────────────────────────────────────────
  {
    id: "web-img-bad",
    framework: "web",
    file: "BadImg.tsx",
    kind: "bad",
    code: `export const Hero = () => <img src="/hero.png" />;`,
    expect: ["web/missing-alt"],
  },
  {
    id: "web-img-good",
    framework: "web",
    file: "GoodImg.tsx",
    kind: "good",
    code: `export const Hero = () => <img src="/hero.png" alt="Product hero shot" />;`,
    expect: [],
  },
  {
    id: "web-clickable-bad",
    framework: "web",
    file: "BadClick.tsx",
    kind: "bad",
    code: `export const Row = () => <div onClick={() => open()}>Open</div>;`,
    expect: ["web/div-with-on-click-no-role"],
  },
  {
    id: "web-clickable-good",
    framework: "web",
    file: "GoodClick.tsx",
    kind: "good",
    code: `export const Row = () => <button onClick={() => open()}>Open</button>;`,
    expect: [],
  },
  {
    id: "web-tabindex-bad",
    framework: "web",
    file: "BadTab.tsx",
    kind: "bad",
    code: `export const F = () => <input tabIndex={3} />;`,
    expect: ["web/positive-tabindex"],
  },
  {
    id: "web-link-good",
    framework: "web",
    file: "GoodLink.tsx",
    kind: "good",
    code: `export const L = () => <a href="/pricing">See pricing plans</a>;`,
    expect: [],
  },

  // ── CSS ────────────────────────────────────────────────────────
  {
    id: "css-outline-bad",
    framework: "css",
    file: "bad.css",
    kind: "bad",
    code: `button:focus { outline: none; }`,
    expect: ["css/outline-none"],
  },
  {
    id: "css-outline-good",
    framework: "css",
    file: "good.css",
    kind: "good",
    code: `button:focus-visible { outline: 2px solid Highlight; }`,
    expect: [],
  },
  {
    id: "css-important-bad",
    framework: "css",
    file: "important.css",
    kind: "bad",
    code: `.a { color: var(--fg) !important; }`,
    expect: ["css/important-usage"],
  },
  {
    id: "css-logical-good",
    framework: "css",
    file: "logical.css",
    kind: "good",
    code: `.a { text-align: start; margin-inline-start: 8px; }`,
    expect: [],
  },

  // ── HTML ───────────────────────────────────────────────────────
  {
    id: "html-viewport-bad",
    framework: "web",
    file: "bad.html",
    kind: "bad",
    code: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, user-scalable=no"></head><body><h1>Hi</h1></body></html>`,
    expect: ["web/user-scalable-no"],
  },
  {
    id: "html-good",
    framework: "web",
    file: "good.html",
    kind: "good",
    code: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><h1>Hi</h1></body></html>`,
    expect: [],
  },

  // ── AST-tier precision cases (regex would misjudge these) ──────
  {
    id: "web-img-spread-good",
    framework: "web",
    file: "SpreadImg.tsx",
    kind: "good",
    code: `export const Avatar = (props) => <img {...props} />;`,
    expect: [], // spread props may carry alt — the AST tier abstains
  },
  {
    id: "web-img-multiline-bad",
    framework: "web",
    file: "MultilineImg.tsx",
    kind: "bad",
    code: `export const Hero = () => (
  <img
    src="/hero.png"
    width={640}
  />
);`,
    expect: ["web/missing-alt"],
  },
  {
    id: "web-div-nested-gt-bad",
    framework: "web",
    file: "NestedGt.tsx",
    kind: "bad",
    code: `export const Row = () => (
  <div onClick={() => select(a > b ? a : b)}>
    Pick
  </div>
);`,
    expect: ["web/div-with-on-click-no-role"],
  },
  {
    id: "web-span-keyboard-good",
    framework: "web",
    file: "AccessibleSpan.tsx",
    kind: "good",
    code: `export const Row = () => (
  <span role="button" tabIndex={0} onKeyDown={onKey} onClick={onClick}>
    Pick
  </span>
);`,
    expect: [], // AST tier abstains: role + tabIndex + keydown make it operable
  },
  {
    id: "swift-image-labeled-good",
    framework: "swift",
    file: "LabeledImage.swift",
    kind: "good",
    code: `Image(systemName: "star")
  .resizable()
  .accessibilityLabel("Favorite")`,
    expect: [], // structural analysis sees the chained label
  },
  {
    id: "swift-image-bare-bad",
    framework: "swift",
    file: "BareImage.swift",
    kind: "bad",
    code: `Image(systemName: "star").frame(width: 20, height: 20)`,
    expect: ["swift/image-without-a11y"],
  },

  // ── Cross-platform ─────────────────────────────────────────────
  {
    id: "compose-clickable-bad",
    framework: "compose",
    file: "Bad.kt",
    kind: "bad",
    code: `Box(Modifier.clickable { open() }) { Text("Open") }`,
    expect: ["compose/clickable-without-role"],
  },
  {
    id: "android-image-bad",
    framework: "android-xml",
    file: "bad.xml",
    kind: "bad",
    code: `<ImageView android:src="@drawable/logo" android:layout_width="48dp" android:layout_height="48dp" />`,
    expect: ["android-xml/image-view-without-content-description"],
  },
  {
    id: "flutter-color-bad",
    framework: "flutter",
    file: "bad.dart",
    kind: "bad",
    code: `Container(color: Color(0xFFFF0000));`,
    expect: ["flutter/hardcoded-color"],
  },
];

export interface RuleScore {
  ruleId: string;
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
}

export interface BenchmarkReport {
  perRule: RuleScore[];
  overall: { tp: number; fp: number; fn: number; precision: number; recall: number };
  falsePositives: Array<{ case: string; ruleId: string; line: number }>;
  falseNegatives: Array<{ case: string; ruleId: string }>;
}

function ratio(n: number, d: number): number {
  return d === 0 ? 1 : Math.round((n / d) * 1000) / 1000;
}

export function runBenchmark(cases: BenchmarkCase[] = BENCHMARK_CASES): BenchmarkReport {
  const tp = new Map<string, number>();
  const fp = new Map<string, number>();
  const fn = new Map<string, number>();
  const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
  const falsePositives: BenchmarkReport["falsePositives"] = [];
  const falseNegatives: BenchmarkReport["falseNegatives"] = [];

  for (const c of cases) {
    const concerns = analyzeFile(c.code, c.file).filter(m => m.type === "concern");
    // Multiset comparison so a fixture that expects two of a rule and only
    // produces one is scored as one TP + one FN.
    const expected = [...c.expect];
    for (const match of concerns) {
      const idx = expected.indexOf(match.ruleId);
      if (idx !== -1) {
        expected.splice(idx, 1);
        bump(tp, match.ruleId);
      } else {
        bump(fp, match.ruleId);
        falsePositives.push({ case: c.id, ruleId: match.ruleId, line: match.line });
      }
    }
    for (const missed of expected) {
      bump(fn, missed);
      falseNegatives.push({ case: c.id, ruleId: missed });
    }
  }

  const ruleIds = new Set([...tp.keys(), ...fp.keys(), ...fn.keys()]);
  const perRule: RuleScore[] = [...ruleIds].sort().map(ruleId => {
    const t = tp.get(ruleId) ?? 0;
    const f = fp.get(ruleId) ?? 0;
    const n = fn.get(ruleId) ?? 0;
    return { ruleId, tp: t, fp: f, fn: n, precision: ratio(t, t + f), recall: ratio(t, t + n) };
  });

  const sum = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0);
  const T = sum(tp);
  const F = sum(fp);
  const N = sum(fn);
  return {
    perRule,
    overall: { tp: T, fp: F, fn: N, precision: ratio(T, T + F), recall: ratio(T, T + N) },
    falsePositives,
    falseNegatives,
  };
}
