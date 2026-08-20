<p align="center">
  <img src="brand/hig-doctor-mark.svg" alt="HIG Doctor" width="96" height="96" />
</p>

# HIG Doctor

<!-- project-record: hig-doctor -->

**Active open-source project · MIT tooling with attributed Apple reference content**

HIG Doctor helps developers and coding agents find interface issues before release.
It checks Apple-platform source against Apple’s Human Interface Guidelines and checks
web and cross-platform source against aligned accessibility and interface-quality
rules.

## Run an audit

```bash
npx hig-doctor .
```

The CLI detects the project frameworks, reports concerns by severity, and points to a
specific fix and source reference. This result is generated from the committed
`test/fixtures/readme-audit` project and checked in the test suite:

```text
2 moderate concerns · swiftui · 1 file
View.swift:5 · swift/navigation-view-deprecated
View.swift:7 · swift/hardcoded-color
```

The audit catalog currently contains **431 rules** across 14 frameworks. Counts are
generated from the rule catalog and checked in CI; they are coverage inventory, not a
claim of complete HIG conformance.

## Why use HIG Doctor

- **Catch reviewable source issues.** Findings include severity, location, rule ID,
  fix guidance, and the reference that supports the concern.
- **Gate only new debt.** Configuration, inline suppressions, content-based baselines,
  SARIF, and `--fail-on` support gradual adoption.
- **Give agents bounded guidance.** MCP tools search the frozen reference corpus and
  explain individual findings without presenting generated advice as canonical HIG.
- **Use one engine across workflows.** The CLI, MCP server, and embeddable core package
  share the same catalog and analysis tiers.

## Choose a surface

| Surface | Use it for | Start |
| --- | --- | --- |
| Audit CLI | Source scans and CI gates | `npx hig-doctor .` |
| MCP server | Search, lookup, file audits, and explanations | `npx -y hig-mcp` |
| Agent skills | Design and implementation guidance | `/plugin marketplace add raintree-technology/hig-doctor` |
| Core package | Embed the rule engine | `npm install @raintree-technology/hig-doctor-core` |

The MCP server works over stdio or streamable HTTP. Its six tools list skills, look up
topics, search the corpus, audit projects or files, and explain findings. See the
[MCP package README](packages/mcp/README.md) for client configuration.

## How analysis works

```text
framework detection → regex scan → structural refinement → categorized findings → report or SARIF
```

- The zero-dependency regex tier is comment- and string-aware.
- Swift structural analysis follows chained modifiers to remove handled findings.
- The TypeScript compiler refines selected JSX accessibility checks when available.
- Every finding records the engine that produced it.

Precision and recall are measured on an annotated fixture corpus in
[`docs/benchmark.md`](docs/benchmark.md). CI enforces the published floors.

## Framework coverage

Apple-platform rows are checked against the HIG directly. Web and cross-platform rows
use universal accessibility and interface-quality principles that align with the HIG.

| Framework | Rules | Basis |
| --- | ---: | --- |
| SwiftUI (`swift`) | 70 | Apple HIG |
| UIKit | 35 | Apple HIG |
| AppKit | 25 | Apple HIG |
| watchOS | 13 | Apple HIG |
| visionOS | 10 | Apple HIG |
| React / Next.js (`web`) | 122 | HIG-aligned universal checks |
| CSS / SCSS | 25 | HIG-aligned universal checks |
| Vue / Nuxt | 19 | HIG-aligned universal checks |
| Angular | 17 | HIG-aligned universal checks |
| Svelte / SvelteKit | 14 | HIG-aligned universal checks |
| Flutter | 21 | HIG-aligned universal checks |
| Jetpack Compose | 28 | HIG-aligned universal checks |
| Android XML | 18 | HIG-aligned universal checks |
| React Native | 14 | HIG-aligned universal checks |

The authoritative per-rule inventory is [`docs/rules.md`](docs/rules.md).

## Skills corpus

The frozen 2025-02-02 snapshot contains 14 skills and 156 reference topics. Apple’s
[live Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
remain canonical.

| Skill | Description |
| --- | --- |
| `hig-foundations` | Color, typography, symbols, accessibility, layout, motion, privacy, and branding |
| `hig-platforms` | iOS, iPadOS, macOS, tvOS, watchOS, and visionOS |
| `hig-patterns` | Onboarding, navigation, search, feedback, modality, and settings |
| `hig-inputs` | Touch, Pencil, keyboard, controller, pointer, Crown, and eye input |
| `hig-technologies` | Siri, Apple Pay, HealthKit, ARKit, ML, Sign in with Apple, and SharePlay |
| `hig-project-context` | Shared project context for tailored guidance |
| `hig-components-content` | Charts, collections, images, web views, and lockups |
| `hig-components-controls` | Pickers, toggles, sliders, buttons, and fields |
| `hig-components-dialogs` | Alerts, action sheets, popovers, and sheets |
| `hig-components-layout` | Sidebars, split views, tabs, lists, tables, and windows |
| `hig-components-menus` | Menus, toolbars, buttons, and menu bars |
| `hig-components-search` | Search fields, page controls, and path controls |
| `hig-components-status` | Progress indicators, status bars, and activity rings |
| `hig-components-system` | Widgets, live activities, notifications, complications, and App Clips |

Nightly drift detection compares the snapshot with Apple’s DocC JSON. Content changes
remain human-reviewed; a hash change does not automatically rewrite guidance.

## Limits and evidence boundary

Automated findings support review. They do not prove accessibility, HIG conformance,
or design quality. Regex fallback can produce different precision than structural
analysis, and project-specific context can justify a documented suppression.

Apple owns the HIG content. This repository provides organization, cross-referencing,
and detection rules. Each reference retains attribution and a canonical source URL.

## Documentation

- [CLI package](packages/cli/README.md) — Flags, configuration, baselines, and CI.
- [MCP package](packages/mcp/README.md) — Tools, transports, and client setup.
- [Core package](packages/core/README.md) — Embedding API.
- [Rule catalog](docs/rules.md) — Current generated inventory.
- [Detection benchmark](docs/benchmark.md) — Fixture method, results, and limits.
- [Brand system](docs/brand-system.md) and [Remotion showcase](docs/remotion-showcase.md).
- [Project website](https://apple.raintree.technology) — Human and agent-readable topics.

## Raintree open-source system

HIG Doctor owns interface guidance and source audits. It can be used independently.
[DocPull](https://github.com/raintree-technology/docpull) acquires evidence,
[PolicyStrata](https://github.com/raintree-technology/policystrata) tests policy behavior,
[Trellis](https://github.com/raintree-technology/trellis) enforces shared code policy,
and [Raintree Standards](https://github.com/raintree-technology/raintree.standards)
defines governed requirements. See the
[Raintree open-source portfolio](https://raintree.technology/portfolio#open-source).

## Project policies

[Contributing](CONTRIBUTING.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [Security](SECURITY.md) ·
[Changelog](CHANGELOG.md) ·
[Source repository](https://github.com/raintree-technology/hig-doctor) · [MIT License](LICENSE) ·
[Third-party notices](THIRD_PARTY_NOTICES.md)

Apple HIG reference text in `skills/*/references/` is © Apple Inc. and remains subject
to Apple’s terms.
