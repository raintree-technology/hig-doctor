<p align="center">
  <img src="https://raw.githubusercontent.com/raintree-technology/hig-doctor/main/brand/hig-doctor-mark.svg" alt="HIG Doctor" width="72" height="72" />
</p>

# HIG Doctor audit CLI

**Apple Human Interface Guidelines** compliance auditor for app projects. Scans your source against **431 rules** across 15 frameworks (SwiftUI, UIKit, AppKit, watchOS, visionOS, React/Next.js, Vue, Svelte, Angular, Jetpack Compose, Android XML, React Native, Flutter, CSS, and HTML) and reports concerns by severity — **critical / serious / moderate** — plus positive patterns you already follow.

Apple-platform code is checked against the HIG directly; web and cross-platform code is checked against universal accessibility and UI-quality principles that align with the HIG.

Findings come from a regex base tier plus a TypeScript-compiler JSX tier and a Swift structural tier; each finding is tagged with the engine that produced it. Runs under Node 20+ (after install) or [Bun](https://bun.sh) (from source). The AST tier uses the optional `typescript` dependency and falls back to regex when it's absent.

## Usage

```bash
# Audit a project (one-off, no install)
npx hig-doctor ./path/to/project

# Or install globally
npm install -g hig-doctor
hig-doctor ./path/to/project
```

### Output modes

| Flag | Effect |
|------|--------|
| _(none)_ | Pretty terminal summary: per-category bars, severity counts, interpretation. |
| `--export` | Write a full markdown report to `hig-audit.md` in the audited directory. |
| `--stdout` | Print the full markdown report to stdout (pipe it to an AI agent). |
| `--json` | Emit machine-readable JSON (schema 2) to stdout, with per-concern fix suggestions. For CI. |
| `--format sarif` | Emit SARIF 2.1.0 for GitHub code scanning. |
| `--fix` | Apply safe mechanical fixes in place; unsafe transforms print as suggestions. |
| `--fail-on <level>` | Exit non-zero when a finding at or above `critical`, `serious`, or `moderate` exists. For CI gates. |
| `--config <path>` / `--no-config` | Use or skip `hig-doctor.config.json` (rule toggles, severity remaps, overrides). |
| `--write-baseline` / `--baseline <path>` / `--no-baseline` | Snapshot, use, or ignore a baseline so gates fail only on new violations. |
| `--exclude <glob>` | Skip paths matching a glob (comma-separated, repeatable). See _Ignoring files_. |
| `--cache` | Cache per-file results; re-scan only changed files. |

### CI gate example

```bash
# Fail the build on any accessibility-breaking (critical) violation
npx hig-doctor . --fail-on critical
```

```json
// JSON shape (abridged)
{
  "severities": { "critical": 0, "serious": 2, "moderate": 5 },
  "totals": { "concerns": 7, "positives": 41, "patterns": 88 },
  "categories": [ /* per-skill breakdown */ ]
}
```

## Ignoring files

Two mechanisms, combined:

1. **`.higauditignore`** at the audited directory root — one glob per line, `#` for comments. Same matching as `.gitignore`-style globs:
   - `*` matches within a path segment (does not cross `/`)
   - `**` matches any depth
   - a bare directory name prunes the whole subtree
2. **`--exclude <glob>`** on the command line — comma-separated, merged with the ignore file.

```
# .higauditignore — demo fixtures contain intentional violations
components/audit-demo-fixtures.ts
**/*.stories.tsx
examples
```

## What it detects

Each rule maps to a HIG topic (Accessibility, Color, Typography, Layout, Buttons, Navigation, Materials, …) and a severity:

- **Critical** — accessibility-breaking: images without alt text, `user-scalable=no`, removed focus outlines, click handlers on non-interactive elements.
- **Serious** — significant UX violations: hardcoded colors over semantic tokens, tap targets below minimum, deprecated navigation containers.
- **Moderate** — style-level: fixed font sizes, non-Dynamic-Type fonts, gesture-only affordances.

Every rule has a stable ID (`framework/label-slug`) with a HIG citation and fix guidance — see [`docs/rules.md`](../../docs/rules.md). Precision/recall on an annotated fixture corpus is published in [`docs/benchmark.md`](../../docs/benchmark.md). Detection is self-contained — no network calls, no source ever leaves your machine.

Suppress findings inline (`// hig-disable-next-line <rule-id> -- reason`, `// hig-disable-file <rule-id>`) or via a `hig-doctor.config.json`.

## From source (Bun)

```bash
git clone https://github.com/raintree-technology/hig-doctor.git
cd hig-doctor/packages/cli
bun install
bun run audit ../../..            # audit the repo itself
bun test                          # run the rule + scanner suite
```

## License

MIT for this package. The HIG rule set encodes guidance derived from Apple's Human Interface Guidelines (© Apple Inc.); see the repository root [LICENSE](../../../LICENSE) for attribution. The published npm package contains only the bundled auditor — it does not redistribute Apple's reference content.
