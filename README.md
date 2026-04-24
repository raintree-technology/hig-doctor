# Apple HIG Skills

Agent-native Apple Human Interface Guidelines: a structured index of Apple's HIG delivered as Claude Skills, with an MCP server and a universal compliance auditor as the verification loop. Built for AI coding agents; usable by humans.

- **Skills corpus** — 14 skills and 156 reference topics covering the complete HIG (foundations, components, patterns, inputs, platforms, technologies). Snapshot dated 2025-02-02; canonical content remains at [developer.apple.com/design/human-interface-guidelines](https://developer.apple.com/design/human-interface-guidelines/).
- **MCP server** — stdio Model Context Protocol server exposing `hig_list_skills`, `hig_lookup`, and `hig_audit` for Claude Desktop, Cursor, Windsurf, and Claude Code.
- **Audit CLI** — universal HIG compliance scanner across 12 frameworks (SwiftUI, UIKit, React, Vue, Svelte, Angular, Compose, Android XML, React Native, Flutter, CSS, HTML). Emits severity-bucketed markdown/JSON with a pass/fail CI gate.

Content is © Apple Inc.; this repository provides organization, cross-referencing, and detection rules for AI agent use. MIT-licensed for structure and tooling.

## Install as a Claude Code plugin

```bash
/plugin marketplace add raintree-technology/apple-hig-skills
```

Or add as a git submodule into any project's `.claude/` directory.

## MCP server

Expose the skills and audit tool to any MCP-compatible client.

```bash
# From a git clone of this repo
bun packages/hig-doctor/src-mcp/src/index.ts
```

Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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
| `hig_audit` | Run the HIG compliance audit on a project directory. |

Set `HIG_SKILLS_DIR` if you relocate the `skills/` folder.

## HIG Audit CLI

Scan any project for Apple HIG compliance. Works with SwiftUI, UIKit, React, Next.js, Vue, Nuxt, Svelte, SvelteKit, Angular, React Native, Flutter, Jetpack Compose, Android XML, and plain HTML/CSS. Detects 349 patterns across accessibility, color systems, typography, responsive layout, dark mode, motion, i18n, and more.

Requires [Bun](https://bun.sh).

```bash
cd packages/hig-doctor/src-termcast
bun run audit <directory>
```

Example output:

```
  HIG Audit: my-app   2 serious

  nextjs · 412 detections · 48 files
  ────────────────────────────────────────────────────────────────────
  Foundations                312  ██████████████░░░░░░  286 good  2 serious
  Layout & Navigation         41  ████░░░░░░░░░░░░░░░░  9 good
  Controls                    24  ░░░░░░░░░░░░░░░░░░░░
  Input Methods               15  ██████████████░░░░░░  11 good
  ────────────────────────────────────────────────────────────────────
  Totals                     412  306 good  2 serious  4 moderate

  Serious issues found — Significant HIG violations degrade UX.
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

- **critical** — accessibility-breaking (missing alt, empty button, `user-scalable=no`, `<video>` without captions, etc.)
- **serious** — significant UX degradation (`div` with `onClick` and no role, positive tabindex, `outline: none` outside progressive enhancement, `onTapGesture` without traits, hover-without-focus, autoplay, etc.)
- **moderate** — HIG style/best-practice violations (hardcoded colors, deprecated components, `!important` usage, physical text-align, etc.)

Positive detections (semantic colors, Dynamic Type, accessibility modifiers, focus-visible, reduced-motion support) are tracked and reported but don't affect the gate.

### What it detects

The audit scans code, stylesheets, and config files, then categorizes findings across HIG areas:

- **Foundations** — semantic vs hardcoded colors, Dynamic Type vs fixed font sizes, dark mode, motion preferences, accessibility labels, focus management, heading hierarchy, landmark regions, touch targets, i18n/RTL support
- **Layout & Navigation** — navigation patterns, responsive breakpoints, semantic HTML, adaptive layout, sidebar/tab patterns
- **Controls** — buttons, toggles, form elements, interactive controls, labels
- **Content Display** — images, collections, tables, cards, accordions, lists
- **Input Methods** — keyboard support, gesture handling, form validation, input types, fieldset/legend, autocomplete
- **Interaction Patterns** — drag and drop, pull-to-refresh, undo, animations, haptics, error handling
- **Dialogs & Presentations** — modals, sheets, alerts, popovers, toasts, tooltips
- **Menus & Actions** — dropdown menus, context menus, toolbars, menu roles
- **Search & Navigation** — search fields, search roles, page controls
- **Status & Progress** — progress indicators, loading states, aria-busy
- **Apple Technologies** — WidgetKit, ActivityKit, HealthKit, ARKit, Apple Pay, Sign in with Apple

**Context-aware rules**: `!important` inside `@media print` and `prefers-reduced-motion` blocks is not flagged. `outline: none` inside `:focus:not(:focus-visible)` progressive enhancement is not flagged. Hover rules skip pseudo-element selectors like `::-webkit-scrollbar-thumb`. Test/spec files are excluded from scanning.

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

### JSON output

```json
{
  "lowDensity": false,
  "frameworks": ["nextjs"],
  "files": { "code": 48, "style": 3, "config": 10 },
  "severities": { "critical": 0, "serious": 2, "moderate": 4 },
  "totals": { "concerns": 6, "positives": 306, "patterns": 100 },
  "failOn": "critical",
  "gateTripped": false,
  "categories": [
    {
      "name": "Foundations",
      "skill": "hig-foundations",
      "detections": 312,
      "concerns": 2,
      "positives": 286,
      "patterns": 24,
      "severities": { "critical": 0, "serious": 2, "moderate": 0 },
      "files": ["app/layout.tsx", "..."]
    }
  ]
}
```

### GitHub Action

Audit on every pull request and fail the build on critical violations.

```yaml
- uses: actions/checkout@v4
- uses: raintree-technology/apple-hig-skills@main
  with:
    directory: .
    fail-on: critical
```

Outputs: `critical`, `serious`, `moderate`, `report` (path to generated `hig-audit.md`).

## Agent-readable surface

The [project website](https://apple.raintree.technology) serves:

- `/llms.txt` — structured index per the [llms.txt](https://llmstxt.org) convention, linking every HIG topic with excerpts.
- `/raw/<slug>` — plain-text markdown for each reference topic (scriptable retrieval).
- `/topics/<slug>` — HTML pages for humans.

## Remotion demo

An animated [Remotion](https://www.remotion.dev/) video that visualizes audit output with glass-card UI.

```bash
cd demos/remotion-hig-doctor
npm install
npm run preview   # preview in browser
npm run render    # out/hig-doctor-showcase.mp4 (1920x1080, 30fps, 21s)
```

## Skills

| Skill | Description |
|-------|-------------|
| `hig-foundations` | Color, typography, SF Symbols, dark mode, accessibility, layout, motion, privacy, branding, icons |
| `hig-platforms` | Platform-specific design for iOS, iPadOS, macOS, tvOS, watchOS, visionOS |
| `hig-patterns` | UX patterns: onboarding, navigation, search, feedback, drag and drop, modality, settings |
| `hig-inputs` | Gestures, Apple Pencil, keyboards, game controllers, pointers, Digital Crown, eye tracking |
| `hig-technologies` | Siri, Apple Pay, HealthKit, ARKit, machine learning, Sign in with Apple, SharePlay |
| `hig-project-context` | Shared design context document for tailored guidance across skills |
| `hig-components-content` | Charts, collections, image views, web views, color wells, lockups |
| `hig-components-controls` | Pickers, toggles, sliders, steppers, segmented controls, text fields |
| `hig-components-dialogs` | Alerts, action sheets, popovers, sheets, digit entry views |
| `hig-components-layout` | Sidebars, split views, tab bars, scroll views, windows, lists, tables |
| `hig-components-menus` | Menus, context menus, toolbars, buttons, menu bar, pop-up buttons |
| `hig-components-search` | Search fields, page controls, path controls |
| `hig-components-status` | Progress indicators, status bars, activity rings |
| `hig-components-system` | Widgets, live activities, notifications, complications, app clips, app shortcuts |

Skills use progressive disclosure — agents load only the reference files they need.

## Repository structure

```
apple-hig-skills/
├── .claude-plugin/marketplace.json       # Claude Code plugin manifest
├── skills/                                # 14 Agent Skills (SKILL.md + references/)
├── packages/hig-doctor/
│   ├── src/                               # Internal skill-structure validator (dev-only)
│   ├── src-termcast/                      # Audit CLI (Bun, zero deps)
│   └── src-mcp/                           # MCP server
├── website/                               # Next.js site + llms.txt + /raw endpoints
├── demos/remotion-hig-doctor/             # Animated audit demo
├── scripts/legal-hardening.ts             # Idempotent content attribution pass
└── .github/workflows/annual-hig-rescan.yml
```

## Content maintenance

Skills content is a frozen snapshot dated 2025-02-02. The `annual-hig-rescan.yml` workflow opens a tracking issue each June after WWDC to prompt diffing Apple's live HIG against this snapshot, updating changed topics, and tagging a new release. The re-scan is a human-in-the-loop process — Apple's HIG pages are JS-rendered and not safely automatable.

Each reference file carries an attribution block and canonical source URL in its frontmatter. Apple-hosted screenshots have been stripped to reduce IP transfer; retain the source link and open Apple's page when visual context is needed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add skills, update reference content after a re-scan, or propose new audit rules.

## License

MIT for repository structure, detection rules, tooling (audit CLI, MCP server, validator, scripts), and the Next.js website. Apple HIG text in `skills/*/references/` is © Apple Inc.; this repository provides organization and cross-referencing for AI agent guidance only — the canonical source is [developer.apple.com](https://developer.apple.com/design/human-interface-guidelines/).
