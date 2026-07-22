# Changelog

All notable changes to `@hig-doctor/core` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-21

Initial release of the extracted rule engine.

### Added

- `audit` pipeline (scan → detect → categorize → report) with config, baseline,
  inline suppression, and content-hash cache support.
- Tiered analysis: `detectPatterns` (regex base tier), `analyzeFile` (regex +
  Swift structural + TypeScript-compiler JSX refinement, each finding tagged
  with its engine).
- Rule catalog with stable IDs, severities, engines, HIG citations, and fix
  guidance (`ruleCatalog`, `getRuleById`); 431 rules across 15 frameworks.
- SARIF 2.1.0 output (`toSarif`) with suggested fixes.
- Baseline (`createBaseline` / `applyBaseline`), config (`loadConfig` /
  `applyConfig`), fixes (`suggestFix` / `applyFixes`), and cache (`ScanCache`) APIs.
