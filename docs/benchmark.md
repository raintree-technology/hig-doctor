# Rule engine benchmark

Generated from the fixture corpus in `packages/core/src/benchmark.ts` — do not edit by hand; run `bun scripts/generate-benchmark.ts`.

Each fixture is a small source file paired with the exact set of concern rule IDs it should produce. **Bad** fixtures measure recall (a missed rule is a false negative); **good** fixtures measure precision (any concern is a false positive). The suite is a CI regression guard (`packages/core/src/benchmark.test.ts`), not a marketing number — it reports measured false-positive and false-negative rates on known inputs.

## Corpus

- 27 fixtures (15 bad, 12 good)
- 6 frameworks: android-xml, compose, css, flutter, swift, web

## Results

| Metric | Value |
|--------|-------|
| True positives | 16 |
| False positives | 0 |
| False negatives | 0 |
| **Precision** | **1.000** |
| **Recall** | **1.000** |

## Per-rule

| Rule ID | TP | FP | FN | Precision | Recall |
|---------|----|----|----|-----------|--------|
| `android-xml/image-view-without-content-description` | 1 | 0 | 0 | 1.000 | 1.000 |
| `compose/clickable-without-role` | 1 | 0 | 0 | 1.000 | 1.000 |
| `css/important-usage` | 1 | 0 | 0 | 1.000 | 1.000 |
| `css/outline-none` | 1 | 0 | 0 | 1.000 | 1.000 |
| `flutter/hardcoded-color` | 1 | 0 | 0 | 1.000 | 1.000 |
| `swift/hardcoded-color` | 2 | 0 | 0 | 1.000 | 1.000 |
| `swift/hardcoded-font-size` | 1 | 0 | 0 | 1.000 | 1.000 |
| `swift/image-without-a11y` | 1 | 0 | 0 | 1.000 | 1.000 |
| `swift/navigation-view-deprecated` | 1 | 0 | 0 | 1.000 | 1.000 |
| `web/div-with-on-click-no-role` | 2 | 0 | 0 | 1.000 | 1.000 |
| `web/missing-alt` | 2 | 0 | 0 | 1.000 | 1.000 |
| `web/positive-tabindex` | 1 | 0 | 0 | 1.000 | 1.000 |
| `web/user-scalable-no` | 1 | 0 | 0 | 1.000 | 1.000 |

No false positives or false negatives on the current corpus.
