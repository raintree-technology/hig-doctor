# hig-doctor Remediation Changelog

Generated: 2026-06-02

## Summary

Executed the Phase 0 remediation plan from `AUDIT-remediation.md` through the high and medium findings plus the low-risk typecheck hardening. No corpus content was refreshed, no package versions were bumped, no public CLI JSON/MCP tool contracts were changed, and no runtime dependencies were added.

## Changes

### 1. Sanitized audit Markdown excerpts

- Commit: `b76994a fix: sanitize audit markdown excerpts`
- Files:
  - `packages/hig-doctor/src-termcast/src/audit-generator.ts`
  - `packages/hig-doctor/src-termcast/src/audit-generator.test.ts`
- Rationale: Scanned repositories are untrusted, and audit Markdown is explicitly intended for agent consumption. Excerpt rendering now escapes Markdown-sensitive file labels, normalizes control characters, and uses dynamic tilde fences that are longer than any tilde run in scanned lines.
- Risk: Low. Detection logic and JSON output are unchanged; only full Markdown report rendering changed.
- Rollback: Revert `b76994a` if a downstream consumer requires triple-backtick report fences, then replace with a compatible sanitizer before release.

### 2. Restored website lint

- Commit: `aadc504 fix: restore website lint`
- Files:
  - `website/biome.json`
  - `website/components/Hero.tsx`
- Rationale: Website CI runs lint before tests/typecheck/build. The local lint failure was caused by Biome schema drift and one formatter-only blank line.
- Risk: Low. Formatting/configuration only.
- Rollback: Revert `aadc504`; website CI will fail again until Biome config and formatting are reconciled another way.

### 3. Kept `hig-mcp` runtime-dependency free

- Commit: `a85c287 fix: keep mcp package runtime-dependency free`
- Files:
  - `packages/hig-doctor/src-mcp/package.json`
  - `packages/hig-doctor/src-mcp/bun.lock`
  - `test/workflow-security.test.mjs`
- Rationale: The MCP package ships a bundled `dist/index.js`, so `@modelcontextprotocol/sdk` is a build/test dependency, not a production runtime dependency. A root guard now fails if either published package reintroduces production `dependencies`.
- Risk: Medium-low. Dev mode and build still have the SDK through `devDependencies`; packaged output remains four files.
- Rollback: Revert `a85c287` only if publishing proves that a runtime dependency is truly required; update the zero-runtime-deps posture at the same time.

### 4. Added MCP stdio tests

- Commit: `28730c5 test: cover mcp stdio behavior`
- Files:
  - `packages/hig-doctor/src-mcp/src/index.test.ts`
  - `.github/workflows/hig-doctor-ci.yml`
  - `.github/workflows/publish-hig-mcp.yml`
- Rationale: `hig-mcp` had a `test` script but no tests. New tests spawn the real stdio server and cover `tools/list`, invalid lookup slugs as `isError`, and invalid `fail_on` as `isError`. CI and publish now run the package test script.
- Risk: Low. Tests exercise process-level behavior and do not change runtime code.
- Rollback: Revert `28730c5` if the process-spawn tests prove flaky in CI; keep at least an explicit smoke-test script as a replacement.

### 5. Added CLI/MCP typecheck coverage

- Commit: `cbac26e test: typecheck cli and mcp packages`
- Files:
  - CLI and MCP package manifests/lockfiles
  - `packages/hig-doctor/src-termcast/tsconfig.json`
  - `packages/hig-doctor/src-mcp/tsconfig.json`
  - package CI/publish workflows
  - typed audit-generator test fixtures
- Rationale: esbuild transpiles without full TypeScript checking. Both packages now have `npm run typecheck`, dev-only TypeScript/Bun/Node types, and workflow enforcement.
- Risk: Low. Adds dev-only tooling and `skipLibCheck` for third-party declaration compatibility while still checking project source.
- Rollback: Revert `cbac26e` if CI install time becomes unacceptable; keep a replacement typecheck gate before release.

## Open Decision

### Platform folder scanning

`AUDIT-remediation.md` identified that `android`, `ios`, `macos`, `linux`, and `windows` are globally ignored by the scanner even though Android XML and Compose rules exist. This was not changed because it can increase false positives/noise for generated React Native and Flutter platform folders. Recommended follow-up: decide whether to make platform-folder scanning conditional on detected project type or keep the current default and document `--exclude` guidance.

## Verification

All verification below passed after remediation:

| Check | Result |
|---|---|
| `bun test && npm run typecheck && npm run build` in `packages/hig-doctor/src-termcast` | Pass: 136 tests, typecheck, bundle |
| `bun test && npm run typecheck && npm run build` in `packages/hig-doctor/src-mcp` | Pass: 3 tests, typecheck, bundle |
| Built MCP server Node smoke test | Pass: `hig_list_skills`, `hig_lookup`, `hig_audit` listed |
| `npm test && npm run validate -- --score` at repo root | Pass: validator/root guards, score `100` |
| `npm run lint && npm run test && npm run typecheck && npm run build` in `website` | Pass: 4 website tests, typecheck, static build |
| `npm pack --dry-run --json` for `hig-doctor` | Pass: four-file tarball, no bundled deps |
| `npm pack --dry-run --json` for `hig-mcp` | Pass: four-file tarball, no bundled deps |

## Release Notes

- No version bumps were made.
- No npm publish was performed.
- No Apple HIG corpus files were updated.
- Public CLI JSON schema and MCP tool names/shapes are unchanged.
- The website `/llms.txt` and `/raw/<slug>` contracts are unchanged.

