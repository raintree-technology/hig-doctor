# Changelog

All notable changes to `hig-doctor` (the Apple HIG audit CLI) are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-07-21

Engine, distribution, and workflow overhaul.

### Added

- **Tiered analysis** — a regex base tier plus a TypeScript-compiler JSX tier
  (`ast-tsx`, optional `typescript` dependency) and a dependency-free Swift
  structural tier that cut false positives on multi-line JSX, spread props, and
  chained Swift accessibility modifiers. Every finding is tagged with the engine
  that produced it.
- **Stable rule IDs** (`framework/label-slug`) with per-rule HIG citation, engine
  tag, and fix guidance; the full catalog is documented in `docs/rules.md`.
- **Config** — `hig-doctor.config.json` (disable rules, remap severities, ignore
  globs, per-path overrides), inline `hig-disable-next-line` / `hig-disable-file`
  suppressions, and a `--config` / `--no-config` flag.
- **Baselines** — `--write-baseline` snapshots existing concerns so a gate only
  fails on new violations; content-keyed so code motion doesn't resurrect them.
- **SARIF 2.1.0** — `--format sarif` for GitHub code scanning, with rule
  metadata, HIG helpUris, and suggested fixes.
- **Autofixes** — `--fix` applies safe mechanical fixes (logical text-align,
  viewport `user-scalable`/`maximum-scale`); unsafe transforms surface as
  machine-readable suggestions in `--json` and SARIF.
- **Content-hash cache** — `--cache` re-analyzes only changed files.
- Dedicated **UIKit, AppKit, watchOS, and visionOS** rule sections; the ruleset
  grows to **431 rules** across 15 frameworks, now Apple-platform-weighted.

### Changed

- Now built on the extracted `@raintree-technology/hig-doctor-core` engine; the package moved to
  `packages/cli` in the restructured monorepo.
- `--json` schema bumped to 2: adds `toolVersion`, `higSnapshot`, `config`,
  `baseline`, and a per-concern `concerns` array with fix/suggestion/HIG fields.

## [1.0.0] - 2026-05-28

Initial public release on npm.

### Added

- HIG compliance auditor covering **348 rules** across 12 frameworks: SwiftUI,
  UIKit, AppKit, React, React Native, Flutter, Vue, Svelte, Angular, Jetpack
  Compose, Android XML, and plain HTML/CSS.
- Severity model — findings are graded **critical**, **serious**, or **moderate**,
  alongside detected positive patterns.
- Output modes: pretty terminal summary (default), `--export` (writes
  `hig-audit.md`), `--stdout` (full markdown to stdout), and `--json` (machine
  output to stdout, progress to stderr).
- `--fail-on <critical|serious|moderate>` CI gate that exits non-zero when a
  finding at or above the given severity is present.
- `--exclude <glob>` flag and `.higauditignore` file support for skipping paths,
  with `.gitignore`-style glob matching (`*`, `**`, `?`, directory pruning).
- Node 20+ distribution: the published package is an esbuild bundle
  (`dist/index.js`) with zero runtime dependencies. Also runs directly under Bun
  from source.

### Notes

- Detection is fully local — no source ever leaves the machine, no network calls.
- The published package does not redistribute Apple's Human Interface Guidelines
  reference content; it ships only the auditor.
