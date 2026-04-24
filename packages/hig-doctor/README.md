# hig-doctor

Three co-located tools used by the apple-hig-skills repository:

1. **HIG Audit CLI** (`src-termcast/`) — universal Apple HIG compliance scanner across 12 frameworks.
2. **MCP Server** (`src-mcp/`) — stdio Model Context Protocol server exposing the skills corpus and the audit function as tools.
3. **Skill Validator** (`src/`) — internal linter for this repository's `skills/` directory; not intended for external use.

## HIG Audit CLI

Scan any project for Apple Human Interface Guidelines compliance. Works with SwiftUI, UIKit, React, Next.js, Vue, Nuxt, Svelte, SvelteKit, Angular, React Native, Flutter, Jetpack Compose, Android XML, and plain HTML/CSS.

Requires [Bun](https://bun.sh).

```bash
cd packages/hig-doctor/src-termcast
bun run audit <directory>
```

### Options

| Flag | Description |
|------|-------------|
| `--export` | Write a full audit report to `<directory>/hig-audit.md` |
| `--stdout` | Print raw audit markdown to stdout (pipe to an AI for evaluation) |
| `--json` | Print structured results as JSON (for CI/scripts) |
| `--fail-on <severity>` | Exit 1 if any concern at/above `critical`, `serious`, or `moderate` is found |
| `--help` | Show help |

### Severity model

Concerns are classified as:

- **critical** — accessibility-breaking (missing alt, empty button, `user-scalable=no`, autoplay without track, `ImageView` without `contentDescription`, etc.)
- **serious** — significant UX degradation (`div` with `onClick` and no role, positive tabindex, `outline: none` outside progressive enhancement, `onTapGesture` without traits, hover-without-focus, `aria-hidden` on focusable, etc.)
- **moderate** — HIG style/best-practice violations (hardcoded colors, deprecated `NavigationView`, `!important`, physical `text-align`, etc.)

Positive detections (semantic colors, Dynamic Type, accessibility modifiers, focus-visible, reduced-motion support) are reported but don't affect the `--fail-on` gate.

Projects with low UI density (<4 detections per file and <500 total) are flagged with `lowDensity: true` — severity signal is less meaningful for non-UI-focused projects.

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

Context-aware rules skip false positives in `@media print`, `prefers-reduced-motion` resets, `:focus:not(:focus-visible)`, and pseudo-element selectors (e.g., `::-webkit-scrollbar-thumb`). Test/spec files are excluded.

### Node API

```typescript
import { audit } from "./src-termcast/src/audit";

const result = await audit("./my-app");

result.scanResult;   // { frameworks, codeFiles, styleFiles, configFiles, markupFiles }
result.allMatches;   // PatternMatch[] — every detection with file, line, type, severity
result.categories;   // CategorySummary[] — grouped by HIG category with critical/serious/moderate counts
result.markdown;     // Full audit report as markdown string
```

### JSON output schema

`bun run audit <dir> --json` returns:

| Field | Type | Description |
|-------|------|-------------|
| `severities` | `{ critical, serious, moderate }` | Concern counts per severity |
| `totals` | `{ concerns, positives, patterns }` | Aggregate detection counts |
| `lowDensity` | `boolean` | `true` if the project has few UI patterns |
| `frameworks` | `string[]` | Detected frameworks |
| `files` | `{ code, style, config }` | Scanned file counts |
| `failOn` | `string \| null` | The threshold passed via `--fail-on`, if any |
| `gateTripped` | `boolean` | `true` if concerns at/above `failOn` were found |
| `categories` | `array` | Per-category breakdown with name, skill, detections, concerns, positives, patterns, severities, files |

## MCP Server

stdio Model Context Protocol server (`src-mcp/`) that exposes the skills corpus and the audit CLI to any MCP-compatible client (Claude Desktop, Cursor, Windsurf, Claude Code).

```bash
cd packages/hig-doctor/src-mcp
bun install
bun src/index.ts   # starts the stdio server
```

Claude Desktop config:

```json
{
  "mcpServers": {
    "hig-doctor": {
      "command": "bun",
      "args": ["/absolute/path/to/apple-hig-skills/packages/hig-doctor/src-mcp/src/index.ts"]
    }
  }
}
```

Tools:

| Tool | Purpose |
|------|---------|
| `hig_list_skills` | Enumerate skills, descriptions, and reference topics. |
| `hig_lookup` | Fetch HIG reference markdown by skill (and optional topic). |
| `hig_audit` | Run the HIG compliance audit on a project directory. Supports `fail_on`. |

Set `HIG_SKILLS_DIR` to override skills directory resolution.

## Skill Validator (internal)

Used internally to lint this repository's skill files. Not intended for third-party use — the official Agent Skills reference validator is [skills-ref](https://github.com/agentskills/agentskills).

```bash
npm --prefix packages/hig-doctor install
node packages/hig-doctor/src/cli.js . --verbose --strict
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
| `--score` | Output 0-100 score only |
| `--strict` | Fail on warnings as well as errors |
| `--verbose` | Include warnings in text output |
| `--tui` | Open interactive Ink terminal UI |

## GitHub Action

Wraps the audit CLI as a composite action:

```yaml
- uses: actions/checkout@v4
- uses: raintree-technology/apple-hig-skills@main
  with:
    directory: .
    fail-on: critical
```

Outputs: `critical`, `serious`, `moderate`, `report` (path to `hig-audit.md`).

## Publishing (validator)

Repository workflow: `.github/workflows/publish-hig-doctor.yml`

- Trigger manually with Actions UI, or push a tag `hig-doctor-v*`.
- Uses npm trusted publishing via GitHub OIDC — no long-lived `NPM_TOKEN`.
