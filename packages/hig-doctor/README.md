# hig-doctor

Two tools in one package:

1. **HIG Audit** — Scan any project for Apple HIG compliance (349 rules, 12 frameworks)
2. **Skill Validator** — Validate HIG skill file structure and repository consistency

## HIG Audit

Audit any project for Apple Human Interface Guidelines compliance. Works with SwiftUI, UIKit, React, Next.js, Vue, Nuxt, Svelte, SvelteKit, Angular, React Native, Flutter, Jetpack Compose, Android XML, and plain HTML/CSS.

Requires [Bun](https://bun.sh).

```bash
cd packages/hig-doctor/src-termcast
bun install
bun run audit <directory>
```

### Options

| Flag | Description |
|------|-------------|
| `--export` | Write a full audit report to `<directory>/hig-audit.md` |
| `--stdout` | Print raw audit markdown to stdout (pipe to an AI for evaluation) |
| `--json` | Print structured results as JSON (for CI/scripts) |
| `--help` | Show help |

### What it detects

349 rules across accessibility, color systems, typography, responsive layout, dark mode, motion, i18n, forms, navigation, controls, and more. Each detection is classified as a **positive** (good HIG practice), **concern** (potential violation), or **pattern** (neutral usage detected).

Context-aware rules skip false positives in `@media print` blocks, `prefers-reduced-motion` resets, `:focus:not(:focus-visible)` progressive enhancement, and pseudo-element selectors. Test/spec files are excluded from scanning.

Projects with low UI density (fewer than 4 detections per file and under 500 total) are flagged with a `lowDensity` warning — scores are less meaningful for non-UI-focused projects.

### Supported frameworks

| Framework | Rules | Detection depth |
|-----------|-------|----------------|
| SwiftUI | 55+ | Navigation, controls, color, typography, accessibility, dark mode, technologies |
| UIKit | 10+ | Accessibility, layout, color |
| React / Next.js | 100+ | Full a11y, color tokens, typography, dark mode, responsive, forms, structure |
| Vue / Nuxt | 25+ | Accessibility, navigation, forms, i18n, transitions |
| Svelte / SvelteKit | 20+ | Accessibility, forms, dark mode, motion |
| Angular | 25+ | Accessibility (CDK a11y), Material components, forms, i18n |
| Jetpack Compose | 30+ | Semantics, color, typography, dark mode, navigation, controls |
| Android XML | 20+ | contentDescription, color resources, sp/dp units, touch targets |
| React Native | 15+ | accessibilityLabel/Role, color scheme, navigation, gestures |
| Flutter | 20+ | Semantics, Theme colors/typography, dark mode, i18n |
| CSS / SCSS | 40+ | Custom properties, contrast, focus styles, outline, !important, z-index, logical properties, RTL |
| HTML | 15+ | Landmarks, lang attribute, heading structure, viewport meta |

### Scoring

The score (0-100) is based on the ratio of positive patterns to concerns, with a small bonus for category breadth:

- **90-100**: Excellent HIG compliance
- **70-89**: Good, with room for improvement
- **50-69**: Needs work
- **Below 50**: Significant violations

## Skill Validator

Diagnose Apple HIG skill repositories for schema, structure, and repository consistency issues.

```bash
npm --prefix packages/hig-doctor install
node packages/hig-doctor/src/cli.js . --verbose
```

### What it checks

- `SKILL.md` existence and max line count
- YAML frontmatter fields (`name`, `version`, `description`)
- Naming and semver constraints
- Required section profiles for standard skills vs `hig-project-context`
- `.claude/apple-design-context.md` context-check guidance hint
- `references/` integrity (missing links and unreferenced files)
- `VERSIONS.md` consistency and duplicate rows
- `.claude-plugin/marketplace.json` skill path validity and set matching
- `README.md` skill table drift vs actual `skills/*`

### Options

| Flag | Description |
|------|-------------|
| `--json` | Output full JSON report |
| `--score` | Output score only |
| `--strict` | Fail on warnings as well as errors |
| `--verbose` | Include warnings in text output |
| `--tui` | Open interactive Ink terminal UI |

### TUI controls

- `j` / `k` or arrow keys: move selection
- `f`: cycle filter (`all`, `errors`, `warnings`)
- `g`: toggle grouping (`scope` vs severity-first)
- `q`: quit

## GitHub Action

```yaml
- uses: actions/checkout@v4
- uses: raintree-technology/apple-hig-skills@main
  with:
    directory: .
    verbose: "true"
    strict: "true"
```

## Publishing

Repository workflow: `.github/workflows/publish-hig-doctor.yml`

- Trigger manually with Actions UI, or
- Push a tag like `hig-doctor-v0.2.0`

Configure npm trusted publishing for this repository before publishing. The workflow
uses GitHub OIDC and `npm publish --provenance`, so no long-lived `NPM_TOKEN` is
required.

## Node API

### Skill Validator

```js
import { diagnose } from "hig-doctor";

const result = await diagnose(".", { strict: false });
console.log(result.summary);
```

### HIG Audit

```typescript
import { audit } from "./src-termcast/src/audit";

const result = await audit("./my-app");

result.scanResult;   // { frameworks, codeFiles, styleFiles, configFiles, markupFiles }
result.allMatches;   // PatternMatch[] — every detection with file, line, type
result.categories;   // CategorySummary[] — grouped by HIG category
result.markdown;     // Full audit report as markdown string
```

### JSON output schema

`bun run audit <dir> --json` returns:

| Field | Type | Description |
|-------|------|-------------|
| `score` | `number` | 0-100 HIG compliance score |
| `lowDensity` | `boolean` | `true` if the project has few UI patterns |
| `frameworks` | `string[]` | Detected frameworks |
| `files` | `object` | `{ code, style, config }` file counts |
| `totals` | `object` | `{ concerns, positives, patterns }` aggregate counts |
| `categories` | `array` | Per-category breakdown with name, skill, detections, concerns, positives, patterns, files |
