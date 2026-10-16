# Apple HIG Skills Versions

Current versions of all skills. Agents can compare against local versions to check for updates.

| Skill | Version | Last Updated |
|-------|---------|--------------|
| hig-project-context | 1.0.0 | 2025-02-02 |
| hig-platforms | 2.2.1 | 2026-10-15 |
| hig-foundations | 2.2.1 | 2026-10-15 |
| hig-patterns | 2.1.3 | 2026-10-15 |
| hig-components-content | 2.1.1 | 2026-08-24 |
| hig-components-layout | 2.1.1 | 2026-08-24 |
| hig-components-menus | 2.1.1 | 2026-08-24 |
| hig-components-search | 2.1.1 | 2026-08-24 |
| hig-components-dialogs | 2.0.1 | 2026-08-24 |
| hig-components-controls | 2.0.1 | 2026-08-24 |
| hig-components-status | 2.1.1 | 2026-08-24 |
| hig-components-system | 2.2.0 | 2026-10-15 |
| hig-inputs | 2.1.1 | 2026-08-24 |
| hig-technologies | 2.3.0 | 2026-10-15 |
| hig-accessibility-audit | 1.0.0 | 2026-07-11 |

## HIG Source

Content sourced from [Apple's Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/), re-verified against the live site on October 15, 2026. Files updated 2026-10-15 carry that snapshot stamp; files whose content was verified unchanged retain their earlier (2026-09-10, 2026-08-24, 2026-07-08, or 2026-06-11) stamp.

## Recent Changes

### 2026-10-15
- **October 2026 refresh** - full re-crawl (173 topics, 166 leaf). Minor bump for `hig-components-system` (2.2.0) and `hig-technologies` (2.3.0); patch bump for `hig-foundations` (2.2.1), `hig-platforms` (2.2.1), and `hig-patterns` (2.1.3). All other skills are unchanged and keep their earlier stamps. Twelve reference files changed and take the 2026-10-15 stamp.
  - `widgets` and `carplay` - Apple HomeView now appears among the widget and CarPlay surfaces.
  - `live-activities` - up to three minimal presentations can appear in the Dynamic Island, and a new 28pt limited-width rule applies.
  - `designing-for-iphone-duo` - adds Device Hub, `ArrangementView` / `UIArrangementViewController`, and screenshot-spec pointers.
  - `privacy` - custom screens may add actions needed for legal consent.
  - **Renamed topic: `in-app-purchase` is now `apple-in-app-purchase`** ("Apple In-App Purchase", `hig-technologies`). Reference file renamed, index row and canonical URL updated, and mapped via `NEW_TOPIC_PLACEMENT` in `generate.py`. Apple rebranded the page (September 17, 2026) and refined guidance: the offer-code and retention/win-back guidance was reworded, and the custom subscription-management UI guidance was removed.
  - Minor link and wording updates in `icons`, `right-to-left`, `sf-symbols`, `managing-accounts`, `designing-for-games`, `apple-pay`, and `wallet`.
  - MCP server snapshot constant bumped to 2026-10-15.

### 2026-09-10
- **September 2026 event updates (iPhone Duo)** — full re-crawl (173 topics, 166 leaf) picked up Apple's September 9, 2026 change-log entries. Minor bump for `hig-platforms`, `hig-foundations`, and `hig-technologies` (2.2.0); patch bump for `hig-patterns` (2.1.2). All other skills are unchanged and keep their 2026-08-24 stamp.
  - **New topic: `designing-for-iphone-duo`** (`hig-platforms`) — Apple's dual-display, hinged iPhone. Covers device poses, inner/outer displays, *reserved regions* (outer camera, inner camera, folding region), the new *arrangement view* layout container (split and overlay), and the system's vertical placement of toolbars, tab bars, status bar, and Dynamic Island along the side edge. Links three new tech talks. Mapped via `NEW_TOPIC_PLACEMENT` in `generate.py`; new Key Principle and reference-index row in `hig-platforms`.
  - `layout` — substantial rewrite ("Updated guidance to reflect current best practices"). New **Size classes** subsection: determine layout by size class, not device type or orientation, and consider all size-class combinations. The iOS and iPadOS platform subsections and the **Specifications** section (device screen-dimension and size-class tables) were removed. visionOS guidance now prefers an adjacent window over an ornament for supplemental content.
  - `shareplay` — reorganized best practices, expanded visionOS guidance, and a new **Custom templates** section for spatial Persona seating (up to five seats, at least a meter apart, roles independent of seats).
  - `branding` — "Refined guidance for using brand color": apply accent color judiciously, move brand color into the content layer beneath Liquid Glass; new "Express your brand with familiar components" principle.
  - `collaboration-and-sharing` — SharePlay now described as cross-device rather than visionOS-specific (one sentence).
  - `wallet` — developer link retargeted to "Creating a poster generic pass".
  - MCP server snapshot constant bumped to 2026-09-10.
  - `hig-foundations` and `hig-platforms` gained a pointer note under their reference indexes: device dimensions, margins, and safe areas are no longer in the HIG; agents should design by size class and refer people to Apple Design Resources rather than invent numbers.
- **Audit CLI 1.2.0 → 1.3.0** (`website/lib/audit/patterns.ts` kept in sync): two Swift layout rules grounded in the Layout rewrite (RULE_COUNT 380 → 382). Concern `device-based layout` flags `UIScreen.main.bounds`, `UIDevice.current.userInterfaceIdiom`/`model`/`orientation`, and idiom comparisons; positive `size class adaptive layout` credits `horizontalSizeClass`/`verticalSizeClass`, the `UITrait*SizeClass` trait types, `UIUserInterfaceSizeClass`, and `ViewThatFits`. Layout checklist wording updated.

### 2026-08-24
- **Corpus re-verified against Apple's live HIG** — patch bump (2.1.1; 2.0.1 for `hig-components-controls` and `hig-components-dialogs`) for all 13 content skills:
  - Full re-crawl (172 topics) found the **topic tree unchanged** and no page with a change-log entry newer than June 8, 2026. Apple made a small number of silent edits since 2026-07-08:
    - `ornaments` — typo fix ("hover affect" → "hover effect").
    - `app-icons` — new sentence pointing to the Parallax Previewer and Parallax Exporter plug-in on Apple Design Resources for tvOS/visionOS layered icons.
    - `searching` — "toolbar" and "tab bars" now cross-link to the Toolbars and Tab bars HIG pages.
    - `generative-ai` — Resources "Videos" block reordered (no link changes).
  - Apple normalized developer-documentation links across the corpus: framework paths are now lowercase (`/documentation/UIKit/...` → `/documentation/uikit/...`) and in-page `#anchor` fragments were dropped from several "For developer guidance" links (`complications`, `live-activities`, `motion`, `game-center`, `tap-to-pay-on-iphone`, `voiceover`). 144 of 157 reference files changed; 13 were byte-identical and keep their earlier snapshot stamp.
  - No converter changes. MCP server snapshot constant bumped to 2026-08-24.

### 2026-07-11
- **New skill: `hig-accessibility-audit` (1.0.0)** — Accessibility Nutrition Label readiness guidance. Pairs with the audit CLI's new claim scanning (claim-tagged rules, `.hig-doctor/accessibility-claims.json`, readiness scoreboard, `--fail-on-claims`) and the `hig_audit` MCP claims summary.

### 2026-07-08
- **Corpus re-verified against Apple's live HIG; converter fidelity fixes** — minor version bump (2.1.0) for the 11 skills whose files changed:
  - Full re-crawl (172 topics) confirmed **zero Apple-side prose changes since 2026-06-11**: the topic tree is identical, and every page's newest change-log entry remains June 8, 2026 (WWDC 2026 / iOS 27 day-one updates, already captured by the June scan). Raw DocC JSON differences were limited to hashed image-asset URLs and `variantOverrides` ordering.
  - `convert.py` now renders three DocC block types it previously dropped, recovering ~7,900 words across 103 files:
    - `tabNavigator` — tabbed specs (screenshot-only tabs still render to nothing and are skipped). Recovers the full Dynamic Type size tables (xSmall–AX5) on `typography`, tvOS grid specs on `layout`, Game Center asset tables on `game-center`, and system haptic-pattern definitions on `playing-haptics`.
    - `small` — fine-print footnotes under spec tables (`typography`, `widgets`, `researchkit`).
    - `links` — "Videos" link grids in Resources sections, rendered as title + canonical-URL bullets (100 files gain WWDC session links, including WWDC 2026 sessions).
  - `video` blocks remain intentionally unrendered (bare asset identifiers; Apple-hosted media is never reproduced).
  - `hig-components-controls` and `hig-components-dialogs` had no content deltas (their tabs are all imagery) and stay at 2.0.0.
- **Audit-rule refresh against the post-WWDC-2026 corpus** (`website/lib/audit/patterns.ts` kept in sync; audit CLI 1.0.0 → 1.1.0, hig-mcp 0.1.0 → 0.2.0):
  - `ignoresSafeArea` concern re-labeled "backgrounds OK; keep controls/text in safe area" — under Liquid Glass, edge-to-edge content beneath bars is expected (see `layout.md`, `materials.md`); essential content must still respect safe areas.
  - `hardcodedColor` now also detects `.foregroundStyle(...)`/`.tint(...)` with hardcoded colors, not just the soft-deprecated `.foregroundColor(...)`.
  - `semanticColor` positive no longer credits the deprecated `.accentColor` *modifier*; credits `Color.accentColor` and `.tint(` instead.
  - `dynamicTypeStyle` positive now includes visionOS `extraLargeTitle`/`extraLargeTitle2`.
  - Layout checklist updated: "prefer tab bar; sidebar-adaptable tab bar or NavigationSplitView for complex hierarchies" replaces the outdated "tabs for flat, sidebar for deep".
  - Removed dead categorizer mappings and checklists for five component skills that don't exist (`selection`, `actions`, `presentation`, `textinput`, `media`).
  - MCP server snapshot constant bumped to 2026-07-08; `.claude-plugin/marketplace.json` description no longer claims "Snapshot Feb 2025" (now 1.2.0).
  - **11 new Liquid Glass-era rules** (RULE_COUNT 348 → 359), each grounded in the refreshed corpus: `glassEffect` adoption + a 5-per-file "use sparingly" concern (`materials.md`); scroll edge effects (`scroll-views.md`); `backgroundExtensionEffect` (`layout.md`, `sidebars.md`); tab bar minimize/bottom accessory (`tab-bars.md`); dedicated search tab positive + a TabView-with-searchable nudge (`search-fields.md` "Search as a tab"); `AppShortcutsProvider`, assistant schemas, `SnippetIntent`, and `FoundationModels` detection (`siri.md`, `app-shortcuts.md`, `snippets.md`, `generative-ai.md`). Rule-count references updated everywhere the old 348 appeared.

### 2026-06-11
- **Full HIG re-scan (first content refresh since the Feb 2025 snapshot)** — major version bump (2.0.0) for all HIG content skills:
  - Rebuilt the entire reference corpus from Apple's live DocC JSON via the new `scripts/hig-ingest/` pipeline (`crawl.py` → `diff.py` → `convert.py` → `generate.py`), which walks the static JSON API rather than scraping JS-rendered HTML.
  - Reference files now reproduce Apple's full prose (intro context, guideline statements with rationale, lists, links) instead of the prior bold-only "structured index" skeleton. Imagery is still omitted; attribution + canonical-footer retained.
  - Captures the WWDC 2025 "Liquid Glass" overhaul across components, materials, and platforms.
  - New topics: `design-principles` (foundations), `snippets` (components/system experiences).
  - Renamed/merged: `spatial-interactions` → `nearby-interactions` (old file removed).
  - Apple reorganized Components into sub-groups (Content, Layout and organization, Menus and actions, Navigation and search, Presentation, Selection and input, Status, System experiences) — these are navigation pages mapped to existing skills.

### 2026-04-24
- **Tooling rework** (no change to skill content versions):
  - Audit CLI replaces the 0-100 score with severity buckets (critical/serious/moderate) and a `--fail-on` CI gate.
  - New MCP stdio server at `packages/hig-doctor/src-mcp/` exposing `hig_list_skills`, `hig_lookup`, and `hig_audit`.
  - GitHub Action repositioned from the internal skill validator to the audit CLI.
  - Website ships `/llms.txt` and `/raw/<slug>` agent-consumable endpoints.
  - Annual post-WWDC re-scan workflow opens a tracking issue each June 20.
  - Legal hardening pass: stripped 1,442 Apple-hosted image references across all 156 reference files and inserted a uniform attribution block under each frontmatter.

### 2025-02-02
- Initial release with 14 skills covering the complete Apple HIG plus project context management
