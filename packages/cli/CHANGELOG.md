# Changelog

All notable changes to `hig-doctor` (the Apple HIG audit CLI) are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
