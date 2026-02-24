# hig-doctor v1.0 Redesign — HIG Audit Tool

**Date**: 2026-02-22
**Status**: Approved

## Problem

hig-doctor currently validates skill file structure (frontmatter, sections, references). That's useful for CI on the skills repo, but it's not what the tool should primarily do. The real value is scoring a target app project's HIG compliance.

## Solution

Redesign hig-doctor as an AI-powered HIG audit tool built with Termcast. It scans any Apple app project, categorizes code findings against 14 HIG skill areas, and generates a structured markdown audit prompt the user feeds to any AI for evaluation.

## Decisions

- **AI engine**: No AI calls in the tool itself. Generates a markdown audit prompt the user feeds to any LLM. Zero dependencies, works with any AI tool.
- **Output format**: Single markdown file with structured sections per HIG category.
- **TUI framework**: Termcast (React components, compiles to single binary, Raycast-compatible API).
- **Legacy mode**: Current skill-file validation stays as `hig-doctor lint`.

## Architecture

```
hig-doctor audit ./my-swiftui-app
       |
       v
+---------------------+
|  Project Scanner     |  Walks the project tree, identifies:
|                      |  - SwiftUI views, UIKit controllers
|                      |  - Navigation patterns
|                      |  - Color/font usage (system vs hardcoded)
|                      |  - Accessibility modifiers
|                      |  - Asset catalogs, Info.plist config
+----------+----------+
           v
+---------------------+
|  HIG Categorizer     |  Maps findings to 14 skill categories:
|                      |  foundations, platforms, patterns,
|                      |  components-layout, inputs, etc.
+----------+----------+
           v
+---------------------+
|  Audit Generator     |  Builds markdown prompt:
|                      |  - Project summary
|                      |  - Code excerpts per category
|                      |  - HIG skill references (from skills/)
|                      |  - Scoring rubric + instructions
+----------+----------+
           v
+---------------------+
|  Termcast TUI        |  Interactive exploration:
|                      |  - List of categories with finding counts
|                      |  - Detail view per category
|                      |  - Action: export audit .md
|                      |  - Action: copy to clipboard
+---------------------+
```

## Commands

| Command | What it does |
|---------|-------------|
| `hig-doctor audit <dir>` | Scan project, open TUI with findings |
| `hig-doctor audit <dir> --export` | Scan and write audit markdown to file |
| `hig-doctor audit <dir> --stdout` | Scan and print audit markdown to stdout |
| `hig-doctor lint [dir]` | Legacy: validate skill files (current behavior) |

## Project Scanner — What It Detects

### File discovery

- `.swift` files — SwiftUI views, UIKit controllers
- `.xib` / `.storyboard` — Interface Builder files
- `Assets.xcassets` — colors, images, app icons
- `Info.plist` — privacy descriptions, capabilities
- `Package.swift` / `.xcodeproj` — project metadata

### Pattern detection (regex-based)

- **Navigation**: `TabView`, `NavigationSplitView`, `NavigationStack`, `UITabBarController`, `UISplitViewController`
- **Layout**: `List`, `LazyVGrid`, `ScrollView`, `GeometryReader`
- **Colors**: `.foregroundColor(.red)` vs `.foregroundStyle(.primary)` (hardcoded vs system)
- **Typography**: `.font(.system(size:))` vs `.font(.title)` (hardcoded vs dynamic)
- **Accessibility**: `.accessibilityLabel`, `.accessibilityHint`, `.accessibilityHidden`
- **Privacy**: `NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription` in Info.plist
- **Dark mode**: `@Environment(\.colorScheme)`, `Color(.systemBackground)`
- **Controls**: `Button`, `Toggle`, `Picker`, `Slider`, `Menu`, `ContextMenu`
- **Dialogs**: `.alert`, `.sheet`, `.confirmationDialog`, `.popover`

## Audit Markdown Output Structure

```markdown
# HIG Audit: MyApp

**Generated**: 2026-02-22
**Project**: ./my-swiftui-app
**Files scanned**: 47 Swift files, 1 asset catalog, 1 Info.plist

## Instructions for AI Evaluator

Score each category 1-10 based on Apple HIG compliance.
Provide specific, actionable findings with file:line references.
Use the HIG reference material below as your rubric.

## Category: Foundations
### Code Excerpts
[relevant code snippets with file paths]
### HIG Reference
[content from hig-foundations skill + key reference files]
### Evaluate
- Color usage (system vs hardcoded)
- Typography (Dynamic Type support)
- Accessibility attributes
- Dark mode support

## Category: Layout & Navigation
...

## Scoring Summary Template
| Category | Score (1-10) | Key Findings |
|----------|-------------|-------------|
| Foundations | | |
| Layout & Navigation | | |
| **Overall** | **/10** | |
```

## Termcast TUI

### Main List View

- Each row = one HIG category
- Accessories show file count and pattern count
- Categories with no findings are dimmed
- Built-in search/filter

### Category Detail View

- Code excerpts found for that category
- Which HIG reference files are relevant
- Markdown rendered

### Action Panel

- `Enter` — View category detail
- `E` — Export full audit markdown
- `C` — Copy audit to clipboard
- `O` — Open audit in default editor

## Tech Stack

- **Termcast** — TUI framework (React, compiles to binary)
- **TypeScript** — type safety
- **Bun** — runtime (required by Termcast)

## Distribution

```bash
# Binary install via Termcast
curl -sf https://termcast.app/r/hig-doctor/install | bash

# Or npm (for lint mode)
npx hig-doctor lint .

# Or from source
bun install && termcast dev
```
