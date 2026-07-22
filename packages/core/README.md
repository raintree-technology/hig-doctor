<p align="center">
  <img src="https://raw.githubusercontent.com/raintree-technology/hig-doctor/main/brand/hig-doctor-mark.svg" alt="HIG Doctor" width="72" height="72" />
</p>

# @hig-doctor/core

The rule engine behind [HIG Doctor](https://github.com/raintree-technology/hig-doctor): framework detection, the Apple HIG rule catalog, tiered analysis (regex → Swift structural → TypeScript-compiler JSX), and the audit pipeline. The [`hig-doctor`](../cli) CLI and [`hig-mcp`](../mcp) server are thin wrappers over this package; embed it directly to run audits from your own tooling.

```ts
import { audit, analyzeFile, ruleCatalog, toSarif } from "@hig-doctor/core";

// Whole-directory audit (honors hig-doctor.config.json, baselines, suppressions)
const result = await audit("./my-app");
console.log(result.categories, result.configPath, result.baselined);

// Single-file analysis (regex + AST/structural refinement), engine-tagged
const findings = analyzeFile(source, "Header.tsx");

// Rule metadata for docs, dashboards, or an editor integration
for (const rule of ruleCatalog()) {
  console.log(rule.id, rule.severity, rule.engine, rule.hig, rule.fix);
}
```

## Exports

- `audit(dir, skillsDir?, options?)` — full scan → detect → categorize → report, with config, baseline, and cache support.
- `analyzeFile(content, file)` — tiered per-file analysis; every match is tagged `regex` / `swift-structural` / `ast-tsx`.
- `detectPatterns(content, file)` — the regex base tier alone (zero dependencies).
- `ruleCatalog()` / `getRuleById(id)` — stable rule IDs, severities, engines, HIG citations, and fix guidance.
- `toSarif(matches, options)` — SARIF 2.1.0 with optional suggested fixes.
- `createBaseline` / `applyBaseline`, `loadConfig` / `applyConfig`, `suggestFix` / `applyFixes`, `ScanCache`.

The `ast-tsx` tier uses the TypeScript compiler when the optional `typescript` dependency is present, and falls back to the regex tier otherwise.

## License

MIT. Apple HIG reference content the engine cites is © Apple Inc. — see the repository [LICENSE](../../LICENSE).
