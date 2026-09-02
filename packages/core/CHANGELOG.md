# Changelog

All notable changes to `@raintree-technology/hig-doctor-core` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2026-09-02

### Fixed

- Match `onMouseOver` and `onMouseOut` accessibility concerns within one JSX
  element so handlers on separate elements cannot satisfy each other.
- Preserve valid `onFocus` and `onBlur` counterparts regardless of their
  attribute order or line position inside the element.

## [0.1.1] - 2026-07-26

### Fixed

- Report the opening element's line for JSX findings and honor inline
  suppressions in the AST tier.
- Fall back to regex analysis when Bun resolves a missing TypeScript compiler
  to an unusable stub module.
- Include analysis-tier availability in cache identity so caches cannot replay
  AST findings in environments without the AST tier.
- Scan native platform directories unless the project is Flutter or React
  Native, and normalize Windows paths before applying config overrides.
- Keep safe CSS fixes out of comments and strings, including multi-line forms.

### Added

- `suggestFixInContent`, which uses surrounding file context when producing
  machine-readable edits.

## [0.1.0] - 2026-07-21

Initial release of the extracted rule engine.

### Added

- `audit` pipeline (scan → detect → categorize → report) with config, baseline,
  inline suppression, and content-hash cache support.
- Tiered analysis: `detectPatterns` (regex base tier), `analyzeFile` (regex +
  Swift structural + TypeScript-compiler JSX refinement, each finding tagged
  with its engine).
- Rule catalog with stable IDs, severities, engines, HIG citations, and fix
  guidance (`ruleCatalog`, `getRuleById`); 431 rules across 14 frameworks.
- SARIF 2.1.0 output (`toSarif`) with suggested fixes.
- Baseline (`createBaseline` / `applyBaseline`), config (`loadConfig` /
  `applyConfig`), fixes (`suggestFix` / `applyFixes`), and cache (`ScanCache`) APIs.
