# hig-doctor Phase 0 Audit

Generated: 2026-06-02

## Scope

Read-only audit of the repo on `main`, focused on the audit CLI, MCP server, skills corpus, validator, website routes, composite GitHub Action, and publish workflows. Guardrails preserved: no corpus refresh, no version bump, no publish, no runtime dependency additions, no public contract changes.

## Executive Summary

The repo is already substantially hardened. Scanner traversal is static-only, skips symlinks, bounds recursion depth and per-file size, and preserves the recent multi-line/accessibility rule fixes. Workflow security is strong: third-party actions are SHA-pinned, publish uses OIDC provenance, and root guard tests enforce those invariants.

No critical findings were identified. The highest-risk remaining issue is output injection in generated Markdown reports: untrusted source lines are emitted into Markdown code fences without escaping, which matters because the report is explicitly designed to be piped back to AI agents.

## Findings

### Critical

None found.

### High

#### H1. Untrusted scan content can break out of Markdown code fences

- Area: security / agent-output safety
- Evidence:
  - `packages/hig-doctor/src-termcast/src/audit-generator.ts:44-49` writes `m.file` and `m.lineContent` directly into Markdown.
  - `packages/hig-doctor/src-termcast/src/audit-generator.ts:45` opens a normal triple-backtick fence; `lineContent` containing ``` can close it.
  - `packages/hig-doctor/src-mcp/src/index.ts:259-263` returns the same Markdown report from `hig_audit`.
  - `packages/hig-doctor/src-termcast/README.md:23-25` explicitly positions `--stdout` as pipe-friendly output for AI agents.
- Impact: A malicious audited repository can include a matching source line that closes the code fence and injects Markdown instructions into the audit report consumed by an agent or CI summary. This is not code execution, but it is prompt/output injection in the product's primary agent workflow.
- Fix: Escape or neutralize fence delimiters and Markdown-sensitive file labels in report excerpts. Prefer a helper such as `sanitizeExcerptLine()` that replaces backtick fence runs with a visually clear but inert sequence, and render file names as escaped inline code or plain text. Add a regression test with a source line containing a closing fence plus injected text.
- Risk: Low implementation risk if limited to report rendering; public JSON schema and detection behavior remain unchanged.

### Medium

#### M1. `hig-mcp` violates the zero-runtime-deps posture in its package manifest

- Area: supply chain / distribution
- Evidence:
  - `packages/hig-doctor/src-mcp/package.json:24-26` declares `@modelcontextprotocol/sdk` in `dependencies`.
  - `packages/hig-doctor/src-mcp/package.json:18-22` builds a single bundled `dist/index.js`.
  - `npm pack --dry-run --json` for `hig-mcp` contains only `CHANGELOG.md`, `README.md`, `dist/index.js`, and `package.json`; the bundle is self-contained for shipped code.
  - The mission guardrail says CLI and MCP should keep zero runtime deps.
- Impact: Global installs of `hig-mcp` pull an external runtime dependency tree even though the shipped bundle has already inlined the SDK. That expands install-time attack surface and contradicts the documented security posture.
- Fix: Move `@modelcontextprotocol/sdk` to `devDependencies`, keep the bundle build, and add a package-manifest guard test that published CLI/MCP packages have no production `dependencies`.
- Risk: Medium. Must confirm the bundled Node artifact still starts after the move and that `bun src/index.ts` dev mode still has the SDK available via dev deps.

#### M2. Website lint is currently failing

- Area: tooling / CI
- Evidence:
  - `npm run lint` in `website/` exits 1.
  - `website/biome.json:2` references schema `2.3.14`, while the installed Biome CLI reports expected schema `2.4.3`.
  - `website/components/Hero.tsx:63-65` has a formatter-only extra blank line.
  - `.github/workflows/build-website.yml:40-50` runs lint before tests, typecheck, and build, so this would fail website CI.
- Impact: Any PR touching `website/**` currently fails the website workflow despite typecheck and build passing.
- Fix: Update the Biome schema URL to the installed CLI schema version or pin the CLI consistently, then apply the formatter change.
- Risk: Low.

#### M3. MCP lacks a real local test target despite a `test` script

- Area: tooling / CI
- Evidence:
  - `packages/hig-doctor/src-mcp/package.json:22` defines `"test": "bun test"`.
  - Running `bun test` in `packages/hig-doctor/src-mcp` exits 1 with "No tests found!".
  - `.github/workflows/hig-doctor-ci.yml:83-100` installs MCP dependencies and smoke-tests `tools/list`, but does not run the package test script.
- Impact: Protocol-level basics are smoke-tested, but error behavior, slug validation, malformed requests, and `hig_audit` handling are not covered by package tests. The declared test command is misleading for local and release verification.
- Fix: Add MCP tests or replace the package script with an explicit smoke-test script. Recommended: add Bun tests for `hig_list_skills`, `hig_lookup` invalid slugs, `hig_audit` invalid `fail_on`, and `isError` wrapping, then run them in CI and publish workflow.
- Risk: Low to medium, depending on how much server startup logic needs to be factored for testability.

### Low

#### L1. Android platform folders are globally ignored during scans

- Area: correctness / scanner coverage
- Evidence:
  - `packages/hig-doctor/src-termcast/src/scanner.ts:30-35` includes `android`, `ios`, `macos`, `linux`, and `windows` in `IGNORED_DIRS`.
  - The rule set supports Kotlin/Compose and Android XML (`packages/hig-doctor/src-termcast/src/patterns.ts:514-582`), and the README advertises Android XML / Compose support.
- Impact: Auditing a repo root that contains native platform subprojects under conventional folder names can skip those folders entirely. That is reasonable for generated React Native/Flutter platform folders, but it also creates false negatives for multi-platform repos where `android/` contains real UI code.
- Fix: Make platform-folder skipping conditional on detected project type or configurable via `--exclude`. Add a regression test documenting expected behavior.
- Risk: Medium behavior risk because scanning generated platform folders may increase noise; this needs a deliberate product decision.

#### L2. CLI/MCP TypeScript builds rely on esbuild transpilation, not typechecking

- Area: tooling / CI
- Evidence:
  - `packages/hig-doctor/src-termcast/tsconfig.json:1-12` exists with `strict: true`.
  - `packages/hig-doctor/src-termcast/package.json:18-21` has test/build scripts but no `tsc --noEmit` script.
  - `packages/hig-doctor/src-mcp` has no `tsconfig.json`; its build is also esbuild-only.
  - `.github/workflows/hig-doctor-ci.yml:64-69` runs CLI tests and a JSON smoke audit, but no typecheck.
- Impact: Some type errors can pass CI because esbuild transpiles without full TypeScript checking.
- Fix: Add `typecheck` scripts for CLI and MCP and run them in CI/publish workflows. For MCP, add a package-local `tsconfig.json` that includes the imported CLI source or references shared compiler settings.
- Risk: Low, but initial typecheck may expose real issues that need small cleanup.

## Positive Security Notes

- Scanner does not follow symlinks and has explicit `MAX_FILE_BYTES` and `MAX_DEPTH` guards (`scanner.ts:37-43`, `scanner.ts:153-155`).
- `hig_lookup` validates skill/topic slugs before path construction (`src-mcp/src/index.ts:55-62`, `src-mcp/src/index.ts:200-206`).
- `hig_audit` validates absolute directory paths and `fail_on` values (`src-mcp/src/index.ts:213-229`).
- `/raw/[slug]` resolves only through the precomputed topic lookup, not direct filesystem path joins (`website/app/raw/[slug]/route.ts:16-20`, `website/lib/topics.ts:183-190`).
- Website topic source URLs are allowlisted to `https://developer.apple.com/design/human-interface-guidelines/` (`website/lib/topics.ts:24-41`).
- Publish workflows use OIDC/provenance and SHA-pinned third-party actions (`.github/workflows/publish-hig-doctor.yml:13-15`, `.github/workflows/publish-hig-doctor.yml:20-27`, `.github/workflows/publish-hig-doctor.yml:60-61`; same pattern for `publish-hig-mcp.yml`).
- Root guard tests enforce pinned actions, least-privilege permissions, trusted publishing, and pattern sync (`test/workflow-security.test.mjs`, `test/audit-patterns-sync.test.mjs`).
- Corpus attribution and the frozen 2025-02-02 snapshot are preserved across README, skills references, MCP, and website raw output.

## Verification Performed

| Check | Result |
|---|---|
| `bun test` in `packages/hig-doctor/src-termcast` | Pass: 135 tests |
| `bun test` in `packages/hig-doctor/src-mcp` | Fail: no test files found |
| `npm test` at repo root | Pass: validator and root guard tests |
| `npm run validate -- --score` at repo root | Pass: score `100` |
| `npm run build` in `packages/hig-doctor/src-termcast` | Pass |
| `npm run build` in `packages/hig-doctor/src-mcp` | Pass |
| MCP Node smoke test against `dist/index.js` | Pass: `hig_list_skills`, `hig_lookup`, `hig_audit` listed |
| `npm run typecheck` in `website` | Pass |
| `npm run lint` in `website` | Fail: Biome schema drift and formatter diff |
| `npm run build` in `website` | Pass |
| `npm pack --dry-run --json` for CLI/MCP | Pass for package creation; confirms MCP package still declares runtime dependency and ships only four files |

## Recommended Remediation Order

1. H1: sanitize Markdown report excerpts and add injection regression tests.
2. M2: fix the website lint break so CI is green again.
3. M1: move MCP SDK to dev dependency and add a zero-runtime-deps manifest guard.
4. M3: add MCP tests and run them in CI/publish.
5. L2: add TypeScript typecheck scripts for CLI/MCP.
6. L1: decide whether platform folders should remain ignored by default or move that behavior behind explicit excludes.

