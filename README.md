<p align="center">
  <img src="brand/hig-doctor-mark.svg" alt="HIG Doctor" width="96" height="96" />
</p>

# HIG Doctor

Agent-native Apple Human Interface Guidelines: a structured skills corpus, MCP server, and universal compliance auditor for AI coding agents and developers.

[![GitHub stars](https://img.shields.io/github/stars/raintree-technology/hig-doctor?style=social)](https://github.com/raintree-technology/hig-doctor/stargazers)

- **Skills corpus** — 14 skills and 156 reference topics covering the complete HIG (foundations, components, patterns, inputs, platforms, technologies). Snapshot dated 2025-02-02; canonical content remains at [developer.apple.com/design/human-interface-guidelines](https://developer.apple.com/design/human-interface-guidelines/).
- **MCP server** ([`hig-mcp`](https://www.npmjs.com/package/hig-mcp)) — six tools for Claude Desktop, Cursor, Windsurf, and Claude Code: `hig_list_skills`, `hig_lookup`, `hig_search` (BM25 over every topic), `hig_audit`, `hig_audit_file`, and `hig_explain_finding`. Runs over stdio or streamable HTTP.
- **Audit CLI** ([`hig-doctor`](https://www.npmjs.com/package/hig-doctor)) — a **431-rule** compliance scanner across 15 frameworks. A regex base tier plus a TypeScript-compiler JSX tier and a Swift structural tier; every finding is tagged with the engine that produced it. Config files, inline suppressions, baselines, SARIF output, and `--fix` autofixes.
- **Engine** ([`@raintree-technology/hig-doctor-core`](https://www.npmjs.com/package/@raintree-technology/hig-doctor-core)) — the rule engine, embeddable in your own tooling.

Content is © Apple Inc.; this repository provides organization, cross-referencing, and detection rules for AI agent use. MIT-licensed for structure and tooling.

Production logo files and usage guidance are available in [`brand/`](brand/).

## Star History

<a href="https://star-history.com/#raintree-technology/hig-doctor&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=raintree-technology/hig-doctor&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=raintree-technology/hig-doctor&type=Date" />
    <img alt="Star history chart for raintree-technology/hig-doctor" src="https://api.star-history.com/svg?repos=raintree-technology/hig-doctor&type=Date" />
  </picture>
</a>

## Install as a Claude Code plugin

```bash
/plugin marketplace add raintree-technology/hig-doctor
```

Or add as a git submodule into any project's `.claude/` directory.

## MCP server

The published package bundles the skills corpus, so it runs with no clone:

```json
{
  "mcpServers": {
    "hig-doctor": {
      "command": "npx",
      "args": ["-y", "hig-mcp"]
    }
  }
}
```

Tools:

| Tool | Purpose |
|------|---------|
| `hig_list_skills` | Enumerate skills, descriptions, and reference topics. |
| `hig_lookup` | Fetch HIG reference markdown by skill (and optional topic). |
| `hig_search` | BM25 full-text search across every reference topic — ask in natural language. |
| `hig_audit` | Run the HIG compliance audit on a project directory. |
| `hig_audit_file` | Audit a single file the agent just wrote; returns per-finding fixes. |
| `hig_explain_finding` | Rule metadata plus an excerpt of the cited HIG reference, by rule ID. |

Every tool returns structured JSON alongside text. For a local checkout, point `command`/`args` at `bun /abs/path/packages/mcp/src/index.ts`. `hig-mcp --http [port]` serves the same tools over streamable HTTP. `HIG_SKILLS_DIR` overrides the bundled corpus.

## HIG Audit CLI

Scan any project for Apple HIG compliance across SwiftUI, UIKit, AppKit, watchOS, visionOS, React/Next.js, Vue/Nuxt, Svelte/SvelteKit, Angular, React Native, Flutter, Jetpack Compose, Android XML, and plain HTML/CSS — **431 rules** across accessibility, color, typography, layout, dark mode, motion, and i18n.

```bash
npx hig-doctor audit <directory>
# or, from a git clone (requires Bun): bun run --cwd packages/cli audit <directory>
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
| `--json` | Print structured results as JSON, including per-concern fix suggestions |
| `--format sarif` | Emit SARIF 2.1.0 for GitHub code scanning |
| `--fix` | Apply safe mechanical fixes in place; print unsafe ones as suggestions |
| `--fail-on <severity>` | Exit 1 if any concern at/above `critical`, `serious`, or `moderate` is found |
| `--config <path>` / `--no-config` | Use or skip `hig-doctor.config.json` |
| `--write-baseline` / `--baseline <path>` / `--no-baseline` | Snapshot, use, or ignore a baseline |
| `--exclude <glob>` | Skip paths (repeatable; also reads `.higauditignore`) |
| `--cache` | Cache per-file results; re-scan only changed files |
| `--help` | Show help |

### Configuration, suppressions, and baselines

A `hig-doctor.config.json` in the audited project disables rules, remaps severities, ignores globs, and adds per-path overrides (rule IDs are documented in [`docs/rules.md`](docs/rules.md)):

```json
{
  "rules": { "swift/hardcoded-color": "off", "css/*": "moderate" },
  "ignore": ["legacy/**"],
  "overrides": [{ "files": ["marketing/**"], "rules": { "css/outline-none": "off" } }]
}
```

Inline comments suppress at the source: `// hig-disable-next-line swift/hardcoded-color -- brand splash` and `// hig-disable-file <rule-id>` (any comment syntax). `hig-doctor --write-baseline` snapshots existing concerns into `.hig-baseline.json`, keyed by content rather than line number, so a CI gate only fails on **new** violations.

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

Rule counts are derived from the catalog; the authoritative per-rule breakdown is [`docs/rules.md`](docs/rules.md).

**Apple platforms** — checked against Apple's HIG directly:

| Framework | Rules | Detection depth |
|-----------|-------|----------------|
| SwiftUI (`swift`) | 70 | Navigation, controls, color, typography, accessibility, dark mode, technologies |
| UIKit | 35 | Deprecated APIs, Dynamic Type, semantic color, Auto Layout, SF Symbols, haptics |
| AppKit | 25 | Windows, toolbars, NSColor/NSFont semantics, materials/vibrancy, accessibility |
| watchOS | 13 | Digital Crown, complications, Always-On luminance, workouts, haptics |
| visionOS | 10 | Volumetric windows, immersive spaces, ornaments, glass materials, spatial gestures |

**Web and cross-platform** — checked against **universal accessibility and UI-quality principles that align with the HIG** (semantic colors, scalable type, focus visibility, keyboard operability, motion/RTL), not Apple-specific HIG conformance:

| Framework | Rules | Detection depth |
|-----------|-------|----------------|
| React / Next.js (`web`) | 122 | a11y (AST-verified for JSX), color tokens, typography, dark mode, responsive, forms |
| CSS / SCSS | 40 | Custom properties, contrast, focus styles, outline, z-index, logical properties, RTL |
| Vue / Nuxt | 25 | Accessibility, navigation, forms, i18n, transitions |
| Angular | 25 | Accessibility (CDK a11y), Material components, forms, i18n |
| Svelte / SvelteKit | 20 | Accessibility, forms, dark mode, motion |
| Flutter | 20 | Semantics, Theme colors/typography, dark mode, i18n |
| Jetpack Compose | 30 | Semantics, color, typography, dark mode, navigation, controls |
| Android XML | 20 | contentDescription, color resources, sp/dp units, touch targets |
| React Native | 15 | accessibilityLabel/Role, color scheme, navigation, gestures |

### How it works: tiered analysis

Findings come from three tiers, and each finding carries the tier that produced it:

- **regex** — the zero-dependency base scanner (comment- and string-aware), always available.
- **swift-structural** — walks the chained-modifier expression around each `Image(systemName:)` / `.onTapGesture` to drop findings that are already handled, cutting the two highest false-positive Swift heuristics.
- **ast-tsx** — parses `.tsx`/`.jsx` with the TypeScript compiler to judge a set of a11y rules (missing `alt`, clickable `div`/`span` without role, positive `tabIndex`), removing false positives from multi-line elements and spread props. Uses the optional `typescript` dependency; falls back to regex when it's absent.

Precision and recall are measured on an annotated fixture corpus and published in [`docs/benchmark.md`](docs/benchmark.md), guarded by CI so regressions surface.

### JSON output

`--json` emits schema 2, with the tool/snapshot versions, config and baseline status, and a per-concern array carrying the rule ID, fix guidance, HIG citation, and a machine-readable suggested edit:

```json
{
  "schemaVersion": 2,
  "toolVersion": "2.0.0",
  "higSnapshot": "2025-02-02",
  "frameworks": ["nextjs"],
  "severities": { "critical": 0, "serious": 2, "moderate": 4 },
  "config": { "path": null, "warnings": [] },
  "baseline": { "path": null, "absorbed": 0, "stale": 0 },
  "concerns": [
    {
      "ruleId": "css/physical-text-align",
      "severity": "moderate",
      "file": "app/hero.css",
      "line": 12,
      "fix": "Use logical text-align (start/end) so text follows writing direction.",
      "hig": "https://developer.apple.com/design/human-interface-guidelines/right-to-left",
      "suggestion": { "before": "  text-align: left;", "after": "  text-align: start;", "safe": true }
    }
  ]
}
```

### GitHub Action

Audit on every pull request, fail on critical violations, and upload SARIF so findings appear as native code-scanning annotations on the exact lines:

```yaml
permissions:
  contents: read
  security-events: write
steps:
  - uses: actions/checkout@v4
  - id: hig
    uses: raintree-technology/hig-doctor@main
    with:
      directory: .
      fail-on: critical
  - uses: github/codeql-action/upload-sarif@v3
    if: always()
    with:
      sarif_file: ${{ steps.hig.outputs.sarif }}
```

Outputs: `critical`, `serious`, `moderate`, `report` (markdown), and `sarif`. The Action also emits inline `::error`/`::warning` annotations for the top concerns.

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
hig-doctor/
├── .claude-plugin/marketplace.json       # Claude Code plugin manifest
├── brand/                                # Canonical logo, app icon, and usage guidance
├── skills/                                # 14 Agent Skills (SKILL.md + references/)
├── packages/
│   ├── core/                              # @raintree-technology/hig-doctor-core rule engine (scan → detect → categorize → report)
│   ├── cli/                               # hig-doctor audit CLI
│   ├── mcp/                               # hig-mcp MCP server
│   └── skill-validator/                   # Internal skill-structure validator (dev-only)
├── website/                               # Next.js site + llms.txt + /raw endpoints
├── demos/remotion-hig-doctor/             # Animated audit demo
├── docs/                                  # rules.md, benchmark.md (generated), audit notes
├── hig-snapshot.json                      # HIG drift-detection manifest (per-topic content hashes)
├── scripts/
│   ├── hig-drift.ts                       # DocC-JSON drift detection (--seed / --check)
│   ├── generate-rule-docs.ts              # docs/rules.md from the rule catalog
│   ├── generate-benchmark.ts              # docs/benchmark.md from the fixture corpus
│   └── legal-hardening*.ts                # Strip Apple CDN images, insert attribution
└── .github/                              # CI workflows + GitHub social preview
```

## Content maintenance

Skills content is a frozen snapshot dated 2025-02-02. Drift **detection** is automated: the `hig-drift.yml` workflow runs nightly, fetches each reference topic as Apple's DocC JSON (`developer.apple.com/tutorials/data/...`), hashes its text, and diffs against [`hig-snapshot.json`](hig-snapshot.json), opening a per-topic issue when Apple's live content changes. The content **rewrite** stays human-in-the-loop: refresh the flagged `skills/*/references/*.md`, then re-seed the manifest with `bun scripts/hig-drift.ts --seed`. The `annual-hig-rescan.yml` workflow still opens a broad tracking issue each year after WWDC.

Each reference file carries an attribution block and canonical source URL in its frontmatter. Apple-hosted screenshots have been stripped to reduce IP transfer; retain the source link and open Apple's page when visual context is needed.

## Website deployment

Vercel Git integration deploys `website` from `main`. A push is the routine
production deployment; do not follow it with a CLI or agent-triggered deployment
for the same SHA. Use a direct CLI deployment only after confirming that Git
integration failed and no deployment for that SHA is `BUILDING` or `READY`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add skills, update reference content after a re-scan, or propose new audit rules.

## License

MIT for repository structure, detection rules, tooling (audit CLI, MCP server, validator, scripts), and the Next.js website. Apple HIG text in `skills/*/references/` is © Apple Inc.; this repository provides organization and cross-referencing for AI agent guidance only — the canonical source is [developer.apple.com](https://developer.apple.com/design/human-interface-guidelines/).
