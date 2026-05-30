# hig-doctor

Universal **Apple Human Interface Guidelines** compliance auditor for app projects. Scans your source against **348 HIG rules** across 12 frameworks (SwiftUI, UIKit, React, Vue, Svelte, Angular, Jetpack Compose, Android XML, React Native, Flutter, CSS, and HTML) and reports concerns by severity — **critical / serious / moderate** — plus positive patterns you already follow.

Runs under Node 20+ (after install) or [Bun](https://bun.sh) (directly from source). Zero runtime dependencies.

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
| `--json` | Emit machine-readable JSON to stdout (progress goes to stderr). For CI. |
| `--fail-on <level>` | Exit non-zero when a finding at or above `critical`, `serious`, or `moderate` exists. For CI gates. |
| `--exclude <glob>` | Skip paths matching a glob (comma-separated, repeatable). See _Ignoring files_. |

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

Detection is regex-based and self-contained — no network calls, no source ever leaves your machine.

## From source (Bun)

```bash
git clone https://github.com/raintree-technology/hig-doctor.git
cd hig-doctor/packages/hig-doctor/src-termcast
bun install
bun run audit ../../..            # audit the repo itself
bun test                          # run the rule + scanner suite
```

## License

MIT for this package. The HIG rule set encodes guidance derived from Apple's Human Interface Guidelines (© Apple Inc.); see the repository root [LICENSE](../../../LICENSE) for attribution. The published npm package contains only the bundled auditor — it does not redistribute Apple's reference content.
