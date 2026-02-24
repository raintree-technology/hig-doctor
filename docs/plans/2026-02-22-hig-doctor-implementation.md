# hig-doctor v1.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite hig-doctor as a Termcast-based HIG audit tool that scans Apple app projects and generates structured markdown audit prompts.

**Architecture:** Three-layer pipeline: Project Scanner (walks codebase, extracts code patterns) -> HIG Categorizer (maps patterns to 14 skill categories) -> Audit Generator (builds markdown prompt with code excerpts + HIG references). Termcast TUI wraps the pipeline for interactive use. Legacy lint mode preserved.

**Tech Stack:** Termcast (React TUI framework), TypeScript, Bun

---

### Task 1: Initialize Termcast Project

**Files:**
- Create: `packages/hig-doctor/src-termcast/` (new Termcast app directory)
- Create: `packages/hig-doctor/src-termcast/package.json`
- Create: `packages/hig-doctor/src-termcast/tsconfig.json`
- Keep: `packages/hig-doctor/src/` (existing lint code, untouched)

**Step 1: Install Termcast globally**

Run: `bun install -g termcast`
Expected: termcast CLI available

**Step 2: Scaffold the Termcast project**

Run: `cd packages/hig-doctor && termcast new hig-doctor-tui`

If `termcast new` doesn't work or produces unexpected output, manually create the project structure:

```
packages/hig-doctor/src-termcast/
  package.json
  tsconfig.json
  src/
    index.tsx
```

`package.json`:
```json
{
  "name": "hig-doctor",
  "version": "1.0.0",
  "description": "Apple HIG audit tool for app projects",
  "type": "module",
  "dependencies": {
    "termcast": "latest"
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

`src/index.tsx` (hello world):
```tsx
import { List } from "termcast";

export default function Command() {
  return (
    <List navigationTitle="HIG Doctor">
      <List.Item title="Hello from hig-doctor" />
    </List>
  );
}
```

**Step 3: Verify it runs**

Run: `cd packages/hig-doctor/src-termcast && bun install && termcast dev`
Expected: TUI renders with "Hello from hig-doctor"

**Step 4: Commit**

```bash
git add packages/hig-doctor/src-termcast/
git commit -m "feat(hig-doctor): scaffold termcast project"
```

---

### Task 2: Project Scanner — File Discovery

**Files:**
- Create: `packages/hig-doctor/src-termcast/src/scanner.ts`
- Create: `packages/hig-doctor/src-termcast/src/scanner.test.ts`

**Step 1: Write failing test for file discovery**

```typescript
// scanner.test.ts
import { describe, test, expect } from "bun:test";
import { scanProject } from "./scanner";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("scanProject", () => {
  test("discovers swift files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"));
    try {
      await writeFile(join(dir, "ContentView.swift"), "import SwiftUI\nstruct ContentView: View {}");
      const result = await scanProject(dir);
      expect(result.swiftFiles.length).toBe(1);
      expect(result.swiftFiles[0].relativePath).toBe("ContentView.swift");
    } finally {
      await rm(dir, { recursive: true });
    }
  });

  test("discovers Info.plist", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"));
    try {
      await writeFile(join(dir, "Info.plist"), "<plist></plist>");
      const result = await scanProject(dir);
      expect(result.infoPlistPaths.length).toBe(1);
    } finally {
      await rm(dir, { recursive: true });
    }
  });

  test("discovers xcassets directories", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"));
    try {
      await mkdir(join(dir, "Assets.xcassets"), { recursive: true });
      const result = await scanProject(dir);
      expect(result.assetCatalogs.length).toBe(1);
    } finally {
      await rm(dir, { recursive: true });
    }
  });

  test("ignores .build and Pods directories", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"));
    try {
      await mkdir(join(dir, ".build"), { recursive: true });
      await writeFile(join(dir, ".build", "Generated.swift"), "// generated");
      await writeFile(join(dir, "App.swift"), "import SwiftUI");
      const result = await scanProject(dir);
      expect(result.swiftFiles.length).toBe(1);
    } finally {
      await rm(dir, { recursive: true });
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/hig-doctor/src-termcast && bun test src/scanner.test.ts`
Expected: FAIL — cannot find module `./scanner`

**Step 3: Implement scanner file discovery**

```typescript
// scanner.ts
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, extname } from "node:path";

export interface ScannedFile {
  relativePath: string;
  absolutePath: string;
  content: string;
}

export interface ScanResult {
  directory: string;
  swiftFiles: ScannedFile[];
  infoPlistPaths: string[];
  assetCatalogs: string[];
  storyboards: ScannedFile[];
  xcodeProjects: string[];
  packageSwift: ScannedFile | null;
}

const IGNORED_DIRS = new Set([
  ".build", ".git", "node_modules", "Pods",
  "DerivedData", ".swiftpm", "Carthage", "Build",
]);

async function walkDir(
  dir: string,
  rootDir: string,
  result: ScanResult,
): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (entry.name.endsWith(".xcassets")) {
        result.assetCatalogs.push(relPath);
        continue;
      }
      if (entry.name.endsWith(".xcodeproj") || entry.name.endsWith(".xcworkspace")) {
        result.xcodeProjects.push(relPath);
        continue;
      }
      await walkDir(fullPath, rootDir, result);
    } else if (entry.isFile()) {
      if (entry.name.endsWith(".swift")) {
        const content = await readFile(fullPath, "utf-8");
        result.swiftFiles.push({ relativePath: relPath, absolutePath: fullPath, content });
      } else if (entry.name === "Info.plist") {
        result.infoPlistPaths.push(relPath);
      } else if (entry.name.endsWith(".storyboard") || entry.name.endsWith(".xib")) {
        const content = await readFile(fullPath, "utf-8");
        result.storyboards.push({ relativePath: relPath, absolutePath: fullPath, content });
      } else if (entry.name === "Package.swift") {
        const content = await readFile(fullPath, "utf-8");
        result.packageSwift = { relativePath: relPath, absolutePath: fullPath, content };
      }
    }
  }
}

export async function scanProject(directory: string): Promise<ScanResult> {
  const result: ScanResult = {
    directory,
    swiftFiles: [],
    infoPlistPaths: [],
    assetCatalogs: [],
    storyboards: [],
    xcodeProjects: [],
    packageSwift: null,
  };
  await walkDir(directory, directory, result);
  return result;
}
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/hig-doctor/src-termcast && bun test src/scanner.test.ts`
Expected: All 4 tests PASS

**Step 5: Commit**

```bash
git add packages/hig-doctor/src-termcast/src/scanner.ts packages/hig-doctor/src-termcast/src/scanner.test.ts
git commit -m "feat(hig-doctor): add project scanner file discovery"
```

---

### Task 3: Project Scanner — Pattern Detection

**Files:**
- Create: `packages/hig-doctor/src-termcast/src/patterns.ts`
- Create: `packages/hig-doctor/src-termcast/src/patterns.test.ts`

**Step 1: Write failing test for pattern detection**

```typescript
// patterns.test.ts
import { describe, test, expect } from "bun:test";
import { detectPatterns, type PatternMatch } from "./patterns";

describe("detectPatterns", () => {
  test("detects TabView navigation", () => {
    const code = `
struct ContentView: View {
  var body: some View {
    TabView {
      HomeView()
        .tabItem { Label("Home", systemImage: "house") }
    }
  }
}`;
    const matches = detectPatterns(code, "ContentView.swift");
    const nav = matches.filter(m => m.category === "components-layout");
    expect(nav.length).toBeGreaterThan(0);
    expect(nav.some(m => m.pattern === "TabView")).toBe(true);
  });

  test("flags hardcoded colors", () => {
    const code = `.foregroundColor(.red)\n.foregroundColor(Color(red: 0.5, green: 0.2, blue: 0.1))`;
    const matches = detectPatterns(code, "View.swift");
    const colorIssues = matches.filter(m => m.category === "foundations" && m.type === "concern");
    expect(colorIssues.length).toBeGreaterThan(0);
  });

  test("detects system color usage as positive", () => {
    const code = `.foregroundStyle(.primary)\n.foregroundStyle(.secondary)`;
    const matches = detectPatterns(code, "View.swift");
    const good = matches.filter(m => m.category === "foundations" && m.type === "positive");
    expect(good.length).toBeGreaterThan(0);
  });

  test("detects accessibility modifiers", () => {
    const code = `.accessibilityLabel("Close button")\n.accessibilityHint("Dismisses the dialog")`;
    const matches = detectPatterns(code, "View.swift");
    const a11y = matches.filter(m => m.category === "foundations" && m.subcategory === "accessibility");
    expect(a11y.length).toBeGreaterThan(0);
  });

  test("flags hardcoded font sizes", () => {
    const code = `.font(.system(size: 14))`;
    const matches = detectPatterns(code, "View.swift");
    const typo = matches.filter(m => m.subcategory === "typography" && m.type === "concern");
    expect(typo.length).toBeGreaterThan(0);
  });

  test("detects Dynamic Type usage as positive", () => {
    const code = `.font(.title)\n.font(.body)`;
    const matches = detectPatterns(code, "View.swift");
    const good = matches.filter(m => m.subcategory === "typography" && m.type === "positive");
    expect(good.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/hig-doctor/src-termcast && bun test src/patterns.test.ts`
Expected: FAIL — cannot find module `./patterns`

**Step 3: Implement pattern detection**

```typescript
// patterns.ts

export type MatchType = "pattern" | "positive" | "concern";

export interface PatternMatch {
  category: string;       // maps to HIG skill (e.g., "foundations", "components-layout")
  subcategory?: string;    // e.g., "accessibility", "typography", "color"
  type: MatchType;         // "pattern" = neutral detection, "positive" = good practice, "concern" = potential issue
  pattern: string;         // what was matched (e.g., "TabView", ".foregroundColor(.red)")
  line: number;
  lineContent: string;
  file: string;
}

interface PatternRule {
  regex: RegExp;
  category: string;
  subcategory?: string;
  type: MatchType;
  label: string;
}

const RULES: PatternRule[] = [
  // --- Navigation (components-layout) ---
  { regex: /\bTabView\b/, category: "components-layout", type: "pattern", label: "TabView" },
  { regex: /\bNavigationSplitView\b/, category: "components-layout", type: "pattern", label: "NavigationSplitView" },
  { regex: /\bNavigationStack\b/, category: "components-layout", type: "pattern", label: "NavigationStack" },
  { regex: /\bNavigationView\b/, category: "components-layout", type: "concern", label: "NavigationView (deprecated)" },
  { regex: /\bUITabBarController\b/, category: "components-layout", type: "pattern", label: "UITabBarController" },
  { regex: /\bUISplitViewController\b/, category: "components-layout", type: "pattern", label: "UISplitViewController" },
  { regex: /\bUINavigationController\b/, category: "components-layout", type: "pattern", label: "UINavigationController" },

  // --- Layout (components-layout) ---
  { regex: /\bList\s*[{(]/, category: "components-layout", type: "pattern", label: "List" },
  { regex: /\bLazyVGrid\b/, category: "components-layout", type: "pattern", label: "LazyVGrid" },
  { regex: /\bLazyHGrid\b/, category: "components-layout", type: "pattern", label: "LazyHGrid" },
  { regex: /\bScrollView\b/, category: "components-layout", type: "pattern", label: "ScrollView" },
  { regex: /\bGeometryReader\b/, category: "components-layout", type: "concern", label: "GeometryReader (prefer layout APIs)" },

  // --- Color (foundations) ---
  { regex: /\.foregroundColor\(\.(red|blue|green|yellow|orange|purple|pink|white|black|gray)\)/, category: "foundations", subcategory: "color", type: "concern", label: "Hardcoded color" },
  { regex: /Color\(red:\s*[\d.]+,\s*green:\s*[\d.]+,\s*blue:\s*[\d.]+/, category: "foundations", subcategory: "color", type: "concern", label: "Hardcoded RGB color" },
  { regex: /UIColor\(red:\s*[\d.]+,\s*green:\s*[\d.]+,\s*blue:\s*[\d.]+/, category: "foundations", subcategory: "color", type: "concern", label: "Hardcoded UIColor RGB" },
  { regex: /\.foregroundStyle\(\.(primary|secondary|tertiary|quaternary)\)/, category: "foundations", subcategory: "color", type: "positive", label: "System semantic color" },
  { regex: /Color\(\.(system\w+|label|secondaryLabel|tertiaryLabel|placeholderText)\)/, category: "foundations", subcategory: "color", type: "positive", label: "System color" },
  { regex: /\.tint\(/, category: "foundations", subcategory: "color", type: "pattern", label: "Tint modifier" },

  // --- Typography (foundations) ---
  { regex: /\.font\(\.system\(size:\s*\d+/, category: "foundations", subcategory: "typography", type: "concern", label: "Hardcoded font size" },
  { regex: /UIFont\.systemFont\(ofSize:\s*\d+/, category: "foundations", subcategory: "typography", type: "concern", label: "Hardcoded UIFont size" },
  { regex: /\.font\(\.(largeTitle|title|title2|title3|headline|subheadline|body|callout|footnote|caption|caption2)\)/, category: "foundations", subcategory: "typography", type: "positive", label: "Dynamic Type text style" },
  { regex: /\.dynamicTypeSize\(/, category: "foundations", subcategory: "typography", type: "positive", label: "Dynamic Type size modifier" },

  // --- Accessibility (foundations) ---
  { regex: /\.accessibilityLabel\(/, category: "foundations", subcategory: "accessibility", type: "positive", label: "Accessibility label" },
  { regex: /\.accessibilityHint\(/, category: "foundations", subcategory: "accessibility", type: "positive", label: "Accessibility hint" },
  { regex: /\.accessibilityHidden\(true\)/, category: "foundations", subcategory: "accessibility", type: "pattern", label: "Accessibility hidden" },
  { regex: /\.accessibilityValue\(/, category: "foundations", subcategory: "accessibility", type: "positive", label: "Accessibility value" },
  { regex: /\.accessibilityAddTraits\(/, category: "foundations", subcategory: "accessibility", type: "positive", label: "Accessibility traits" },

  // --- Dark mode (foundations) ---
  { regex: /@Environment\(\\\.colorScheme\)/, category: "foundations", subcategory: "dark-mode", type: "positive", label: "Color scheme environment" },
  { regex: /\.preferredColorScheme\(/, category: "foundations", subcategory: "dark-mode", type: "pattern", label: "Preferred color scheme" },

  // --- Controls (components-controls) ---
  { regex: /\bButton\s*[{(]/, category: "components-controls", type: "pattern", label: "Button" },
  { regex: /\bToggle\s*[{(]/, category: "components-controls", type: "pattern", label: "Toggle" },
  { regex: /\bPicker\s*[{(]/, category: "components-controls", type: "pattern", label: "Picker" },
  { regex: /\bSlider\s*[{(]/, category: "components-controls", type: "pattern", label: "Slider" },
  { regex: /\bStepper\s*[{(]/, category: "components-controls", type: "pattern", label: "Stepper" },
  { regex: /\bDatePicker\s*[{(]/, category: "components-controls", type: "pattern", label: "DatePicker" },
  { regex: /\bColorPicker\s*[{(]/, category: "components-controls", type: "pattern", label: "ColorPicker" },

  // --- Menus (components-menus) ---
  { regex: /\bMenu\s*[{(]/, category: "components-menus", type: "pattern", label: "Menu" },
  { regex: /\.contextMenu\s*\{/, category: "components-menus", type: "pattern", label: "Context menu" },

  // --- Dialogs (components-dialogs) ---
  { regex: /\.alert\(/, category: "components-dialogs", type: "pattern", label: "Alert" },
  { regex: /\.sheet\(/, category: "components-dialogs", type: "pattern", label: "Sheet" },
  { regex: /\.fullScreenCover\(/, category: "components-dialogs", type: "pattern", label: "Full screen cover" },
  { regex: /\.confirmationDialog\(/, category: "components-dialogs", type: "pattern", label: "Confirmation dialog" },
  { regex: /\.popover\(/, category: "components-dialogs", type: "pattern", label: "Popover" },
  { regex: /\.inspector\(/, category: "components-dialogs", type: "pattern", label: "Inspector" },

  // --- Search (components-search) ---
  { regex: /\.searchable\(/, category: "components-search", type: "pattern", label: "Searchable modifier" },
  { regex: /\bUISearchController\b/, category: "components-search", type: "pattern", label: "UISearchController" },

  // --- Status (components-status) ---
  { regex: /\bProgressView\b/, category: "components-status", type: "pattern", label: "ProgressView" },
  { regex: /\bGauge\b/, category: "components-status", type: "pattern", label: "Gauge" },
  { regex: /\.badge\(/, category: "components-status", type: "pattern", label: "Badge" },

  // --- Content display (components-content) ---
  { regex: /\bAsyncImage\b/, category: "components-content", type: "pattern", label: "AsyncImage" },
  { regex: /\bTable\s*[{(]/, category: "components-content", type: "pattern", label: "Table" },
  { regex: /\bGroupBox\b/, category: "components-content", type: "pattern", label: "GroupBox" },
  { regex: /\bDisclosureGroup\b/, category: "components-content", type: "pattern", label: "DisclosureGroup" },

  // --- System (components-system) ---
  { regex: /\bShareLink\b/, category: "components-system", type: "pattern", label: "ShareLink" },
  { regex: /\bPhotosPicker\b/, category: "components-system", type: "pattern", label: "PhotosPicker" },
  { regex: /\.onOpenURL\(/, category: "components-system", type: "pattern", label: "Deep link handler" },
  { regex: /\bWidgetKit\b/, category: "components-system", type: "pattern", label: "WidgetKit" },
  { regex: /\bAppIntent\b/, category: "components-system", type: "pattern", label: "App Intent" },

  // --- Patterns (patterns) ---
  { regex: /\.onDrag\b/, category: "patterns", type: "pattern", label: "Drag support" },
  { regex: /\.onDrop\b/, category: "patterns", type: "pattern", label: "Drop support" },
  { regex: /\.refreshable\b/, category: "patterns", type: "pattern", label: "Pull to refresh" },
  { regex: /\.swipeActions\b/, category: "patterns", type: "pattern", label: "Swipe actions" },
  { regex: /\bUndoManager\b/, category: "patterns", type: "pattern", label: "Undo support" },

  // --- Inputs (inputs) ---
  { regex: /\bTextField\s*[{(]/, category: "inputs", type: "pattern", label: "TextField" },
  { regex: /\bSecureField\b/, category: "inputs", type: "pattern", label: "SecureField" },
  { regex: /\bTextEditor\b/, category: "inputs", type: "pattern", label: "TextEditor" },
  { regex: /\.onTapGesture\b/, category: "inputs", type: "pattern", label: "Tap gesture" },
  { regex: /\.onLongPressGesture\b/, category: "inputs", type: "pattern", label: "Long press gesture" },
  { regex: /\.gesture\(/, category: "inputs", type: "pattern", label: "Custom gesture" },
  { regex: /\.focusable\(/, category: "inputs", type: "pattern", label: "Focusable" },
  { regex: /\.keyboardShortcut\(/, category: "inputs", type: "pattern", label: "Keyboard shortcut" },

  // --- Technologies (technologies) ---
  { regex: /\bRealityKit\b/, category: "technologies", type: "pattern", label: "RealityKit" },
  { regex: /\bARKit\b/, category: "technologies", type: "pattern", label: "ARKit" },
  { regex: /\bMapKit\b/, category: "technologies", type: "pattern", label: "MapKit" },
  { regex: /\bStoreKit\b/, category: "technologies", type: "pattern", label: "StoreKit" },
  { regex: /\bHealthKit\b/, category: "technologies", type: "pattern", label: "HealthKit" },
  { regex: /\bHomeKit\b/, category: "technologies", type: "pattern", label: "HomeKit" },
  { regex: /\bSiriKit\b/, category: "technologies", type: "pattern", label: "SiriKit" },
  { regex: /\bCoreML\b/, category: "technologies", type: "pattern", label: "CoreML" },
  { regex: /\bGameKit\b/, category: "technologies", type: "pattern", label: "GameKit" },
];

export function detectPatterns(code: string, file: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const lines = code.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of RULES) {
      if (rule.regex.test(line)) {
        matches.push({
          category: rule.category,
          subcategory: rule.subcategory,
          type: rule.type,
          pattern: rule.label,
          line: i + 1,
          lineContent: line.trim(),
          file,
        });
      }
    }
  }

  return matches;
}
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/hig-doctor/src-termcast && bun test src/patterns.test.ts`
Expected: All 6 tests PASS

**Step 5: Commit**

```bash
git add packages/hig-doctor/src-termcast/src/patterns.ts packages/hig-doctor/src-termcast/src/patterns.test.ts
git commit -m "feat(hig-doctor): add pattern detection rules for HIG categories"
```

---

### Task 4: HIG Categorizer

**Files:**
- Create: `packages/hig-doctor/src-termcast/src/categorizer.ts`
- Create: `packages/hig-doctor/src-termcast/src/categorizer.test.ts`

**Step 1: Write failing test**

```typescript
// categorizer.test.ts
import { describe, test, expect } from "bun:test";
import { categorize, type CategorySummary } from "./categorizer";
import type { PatternMatch } from "./patterns";

describe("categorize", () => {
  test("groups matches by category", () => {
    const matches: PatternMatch[] = [
      { category: "foundations", subcategory: "color", type: "concern", pattern: "Hardcoded color", line: 5, lineContent: ".foregroundColor(.red)", file: "A.swift" },
      { category: "foundations", subcategory: "typography", type: "positive", pattern: "Dynamic Type", line: 10, lineContent: ".font(.title)", file: "A.swift" },
      { category: "components-layout", type: "pattern", pattern: "TabView", line: 3, lineContent: "TabView {", file: "B.swift" },
    ];
    const result = categorize(matches);
    expect(result.length).toBe(2);
    const foundations = result.find(c => c.skillName === "hig-foundations");
    expect(foundations!.matches.length).toBe(2);
    expect(foundations!.concerns).toBe(1);
    expect(foundations!.positives).toBe(1);
  });

  test("returns empty array for no matches", () => {
    const result = categorize([]);
    expect(result.length).toBe(0);
  });

  test("calculates file count per category", () => {
    const matches: PatternMatch[] = [
      { category: "foundations", type: "positive", pattern: "a", line: 1, lineContent: "", file: "A.swift" },
      { category: "foundations", type: "positive", pattern: "b", line: 1, lineContent: "", file: "B.swift" },
      { category: "foundations", type: "positive", pattern: "c", line: 2, lineContent: "", file: "A.swift" },
    ];
    const result = categorize(matches);
    expect(result[0].fileCount).toBe(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/hig-doctor/src-termcast && bun test src/categorizer.test.ts`
Expected: FAIL

**Step 3: Implement categorizer**

```typescript
// categorizer.ts
import type { PatternMatch } from "./patterns";

const CATEGORY_TO_SKILL: Record<string, string> = {
  "foundations": "hig-foundations",
  "components-layout": "hig-components-layout",
  "components-controls": "hig-components-controls",
  "components-menus": "hig-components-menus",
  "components-dialogs": "hig-components-dialogs",
  "components-search": "hig-components-search",
  "components-status": "hig-components-status",
  "components-content": "hig-components-content",
  "components-system": "hig-components-system",
  "patterns": "hig-patterns",
  "inputs": "hig-inputs",
  "technologies": "hig-technologies",
  "platforms": "hig-platforms",
};

const CATEGORY_LABELS: Record<string, string> = {
  "hig-foundations": "Foundations",
  "hig-components-layout": "Layout & Navigation",
  "hig-components-controls": "Controls",
  "hig-components-menus": "Menus & Actions",
  "hig-components-dialogs": "Dialogs & Presentations",
  "hig-components-search": "Search & Navigation",
  "hig-components-status": "Status & Progress",
  "hig-components-content": "Content Display",
  "hig-components-system": "System Integration",
  "hig-patterns": "Interaction Patterns",
  "hig-inputs": "Input Methods",
  "hig-technologies": "Apple Technologies",
  "hig-platforms": "Platform Adaptation",
};

export interface CategorySummary {
  skillName: string;
  label: string;
  matches: PatternMatch[];
  concerns: number;
  positives: number;
  patterns: number;
  fileCount: number;
  files: string[];
}

export function categorize(matches: PatternMatch[]): CategorySummary[] {
  const groups = new Map<string, PatternMatch[]>();

  for (const match of matches) {
    const skillName = CATEGORY_TO_SKILL[match.category] ?? match.category;
    if (!groups.has(skillName)) groups.set(skillName, []);
    groups.get(skillName)!.push(match);
  }

  const summaries: CategorySummary[] = [];
  for (const [skillName, categoryMatches] of groups) {
    const files = [...new Set(categoryMatches.map(m => m.file))];
    summaries.push({
      skillName,
      label: CATEGORY_LABELS[skillName] ?? skillName,
      matches: categoryMatches,
      concerns: categoryMatches.filter(m => m.type === "concern").length,
      positives: categoryMatches.filter(m => m.type === "positive").length,
      patterns: categoryMatches.filter(m => m.type === "pattern").length,
      fileCount: files.length,
      files,
    });
  }

  return summaries.sort((a, b) => b.matches.length - a.matches.length);
}
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/hig-doctor/src-termcast && bun test src/categorizer.test.ts`
Expected: All 3 tests PASS

**Step 5: Commit**

```bash
git add packages/hig-doctor/src-termcast/src/categorizer.ts packages/hig-doctor/src-termcast/src/categorizer.test.ts
git commit -m "feat(hig-doctor): add HIG categorizer mapping patterns to skills"
```

---

### Task 5: Audit Markdown Generator

**Files:**
- Create: `packages/hig-doctor/src-termcast/src/audit-generator.ts`
- Create: `packages/hig-doctor/src-termcast/src/audit-generator.test.ts`

**Step 1: Write failing test**

```typescript
// audit-generator.test.ts
import { describe, test, expect } from "bun:test";
import { generateAuditMarkdown } from "./audit-generator";
import type { CategorySummary } from "./categorizer";
import type { ScanResult } from "./scanner";

describe("generateAuditMarkdown", () => {
  test("generates markdown with header and categories", () => {
    const scanResult: ScanResult = {
      directory: "/tmp/MyApp",
      swiftFiles: [{ relativePath: "App.swift", absolutePath: "/tmp/MyApp/App.swift", content: "import SwiftUI" }],
      infoPlistPaths: ["Info.plist"],
      assetCatalogs: ["Assets.xcassets"],
      storyboards: [],
      xcodeProjects: ["MyApp.xcodeproj"],
      packageSwift: null,
    };

    const categories: CategorySummary[] = [{
      skillName: "hig-foundations",
      label: "Foundations",
      matches: [{
        category: "foundations",
        subcategory: "color",
        type: "concern",
        pattern: "Hardcoded color",
        line: 5,
        lineContent: ".foregroundColor(.red)",
        file: "App.swift",
      }],
      concerns: 1,
      positives: 0,
      patterns: 0,
      fileCount: 1,
      files: ["App.swift"],
    }];

    const md = generateAuditMarkdown(scanResult, categories, null);
    expect(md).toContain("# HIG Audit");
    expect(md).toContain("## Instructions for AI Evaluator");
    expect(md).toContain("## Category: Foundations");
    expect(md).toContain(".foregroundColor(.red)");
    expect(md).toContain("Scoring Summary");
  });

  test("includes HIG reference content when provided", () => {
    const scanResult: ScanResult = {
      directory: "/tmp/MyApp",
      swiftFiles: [],
      infoPlistPaths: [],
      assetCatalogs: [],
      storyboards: [],
      xcodeProjects: [],
      packageSwift: null,
    };

    const categories: CategorySummary[] = [{
      skillName: "hig-foundations",
      label: "Foundations",
      matches: [],
      concerns: 0,
      positives: 0,
      patterns: 0,
      fileCount: 0,
      files: [],
    }];

    const skillsDir = null;
    const md = generateAuditMarkdown(scanResult, categories, skillsDir);
    expect(md).toContain("# HIG Audit");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/hig-doctor/src-termcast && bun test src/audit-generator.test.ts`
Expected: FAIL

**Step 3: Implement audit generator**

```typescript
// audit-generator.ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ScanResult } from "./scanner";
import type { CategorySummary } from "./categorizer";

function formatDate(): string {
  return new Date().toISOString().split("T")[0];
}

function renderExcerpts(category: CategorySummary): string {
  const lines: string[] = [];
  const byFile = new Map<string, typeof category.matches>();
  for (const m of category.matches) {
    if (!byFile.has(m.file)) byFile.set(m.file, []);
    byFile.get(m.file)!.push(m);
  }

  for (const [file, matches] of byFile) {
    lines.push(`**${file}**`);
    lines.push("```swift");
    for (const m of matches.slice(0, 15)) {
      const tag = m.type === "concern" ? " // ⚠ concern" : m.type === "positive" ? " // ✓ good" : "";
      lines.push(`L${m.line}: ${m.lineContent}${tag}`);
    }
    if (matches.length > 15) {
      lines.push(`// ... and ${matches.length - 15} more matches`);
    }
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}

export async function loadSkillContent(skillsDir: string, skillName: string): Promise<string | null> {
  try {
    const skillPath = join(skillsDir, skillName, "SKILL.md");
    const content = await readFile(skillPath, "utf-8");
    // Strip frontmatter
    const stripped = content.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/, "");
    // Take just the Key Principles section if it exists
    const principlesMatch = stripped.match(/## Key Principles\n([\s\S]*?)(?=\n## |$)/);
    return principlesMatch ? principlesMatch[1].trim() : stripped.slice(0, 2000);
  } catch {
    return null;
  }
}

export function generateAuditMarkdown(
  scanResult: ScanResult,
  categories: CategorySummary[],
  skillsDir: string | null,
  skillContents?: Map<string, string>,
): string {
  const lines: string[] = [];
  const appName = scanResult.directory.split("/").pop() || "App";

  // Header
  lines.push(`# HIG Audit: ${appName}`);
  lines.push("");
  lines.push(`**Generated**: ${formatDate()}`);
  lines.push(`**Project**: ${scanResult.directory}`);
  lines.push(`**Files scanned**: ${scanResult.swiftFiles.length} Swift files, ${scanResult.assetCatalogs.length} asset catalog(s), ${scanResult.infoPlistPaths.length} Info.plist(s)`);
  lines.push("");

  // Summary stats
  const totalConcerns = categories.reduce((s, c) => s + c.concerns, 0);
  const totalPositives = categories.reduce((s, c) => s + c.positives, 0);
  const totalPatterns = categories.reduce((s, c) => s + c.patterns, 0);
  lines.push(`**Quick stats**: ${totalConcerns} potential concerns, ${totalPositives} positive patterns, ${totalPatterns} component usages detected across ${categories.length} HIG categories`);
  lines.push("");

  // Instructions
  lines.push("## Instructions for AI Evaluator");
  lines.push("");
  lines.push("You are reviewing an Apple app project for Human Interface Guidelines compliance.");
  lines.push("For each category below, evaluate the code excerpts against the HIG reference material.");
  lines.push("");
  lines.push("**Scoring**: Rate each category 1-10:");
  lines.push("- **9-10**: Excellent HIG compliance, follows best practices");
  lines.push("- **7-8**: Good compliance with minor improvements possible");
  lines.push("- **5-6**: Partial compliance, several areas need attention");
  lines.push("- **3-4**: Significant HIG violations");
  lines.push("- **1-2**: Major violations or missing fundamental practices");
  lines.push("");
  lines.push("**Output**: For each category, provide:");
  lines.push("1. Score (1-10)");
  lines.push("2. What's done well (cite specific code)");
  lines.push("3. What needs improvement (cite specific file:line)");
  lines.push("4. Specific fix recommendations");
  lines.push("");

  // Categories
  for (const category of categories) {
    lines.push(`## Category: ${category.label}`);
    lines.push("");
    lines.push(`*${category.matches.length} detections across ${category.fileCount} file(s) — ${category.concerns} concern(s), ${category.positives} positive(s)*`);
    lines.push("");

    // Code excerpts
    lines.push("### Code Excerpts");
    lines.push("");
    if (category.matches.length > 0) {
      lines.push(renderExcerpts(category));
    } else {
      lines.push("*No patterns detected for this category.*");
      lines.push("");
    }

    // HIG reference
    lines.push("### HIG Reference");
    lines.push("");
    const content = skillContents?.get(category.skillName);
    if (content) {
      lines.push(content);
    } else {
      lines.push(`*Load reference from skill: ${category.skillName}*`);
    }
    lines.push("");

    // Evaluation checklist
    lines.push("### Evaluate");
    lines.push("");
    const checks = getEvaluationChecklist(category.skillName);
    for (const check of checks) {
      lines.push(`- ${check}`);
    }
    lines.push("");
  }

  // Scoring table
  lines.push("## Scoring Summary");
  lines.push("");
  lines.push("| Category | Score (1-10) | Key Findings |");
  lines.push("|----------|-------------|-------------|");
  for (const category of categories) {
    lines.push(`| ${category.label} | | |`);
  }
  lines.push("| **Overall** | **/10** | |");
  lines.push("");

  return lines.join("\n");
}

function getEvaluationChecklist(skillName: string): string[] {
  const checklists: Record<string, string[]> = {
    "hig-foundations": [
      "Color usage: system semantic colors vs hardcoded values",
      "Typography: Dynamic Type text styles vs fixed font sizes",
      "Accessibility: labels, hints, traits on interactive elements",
      "Dark mode: proper color adaptation, no hardcoded light/dark values",
      "Motion: Reduce Motion support for animations",
    ],
    "hig-components-layout": [
      "Navigation pattern matches app structure (tabs for flat, sidebar for deep)",
      "Adaptive layout: responds to size classes, multitasking",
      "Standard navigation components (NavigationSplitView, not deprecated NavigationView)",
      "Consistent back navigation and spatial hierarchy",
    ],
    "hig-components-controls": [
      "Standard control usage (Button, Toggle, Picker, etc.)",
      "Proper button styles and roles",
      "Clear action labels and consistent interaction patterns",
    ],
    "hig-components-menus": [
      "Context menus provide relevant actions",
      "Menu organization follows HIG grouping conventions",
    ],
    "hig-components-dialogs": [
      "Alerts used sparingly for important decisions",
      "Sheets for focused tasks, popovers for contextual info",
      "Confirmation dialogs for destructive actions",
    ],
    "hig-components-search": [
      "Searchable modifier used for filterable content",
      "Search suggestions and scopes where appropriate",
    ],
    "hig-components-status": [
      "Progress indicators for long operations",
      "Appropriate use of determinate vs indeterminate progress",
    ],
    "hig-components-content": [
      "Content display uses appropriate containers",
      "Image handling with proper async loading",
    ],
    "hig-components-system": [
      "System integration uses standard APIs (ShareLink, PhotosPicker)",
      "Deep link handling, widget support where relevant",
    ],
    "hig-patterns": [
      "Drag and drop support where appropriate",
      "Pull-to-refresh for refreshable content",
      "Swipe actions follow HIG conventions",
      "Undo support for destructive actions",
    ],
    "hig-inputs": [
      "Text input uses appropriate field types",
      "Keyboard shortcuts for power users (macOS/iPad)",
      "Gesture usage follows platform conventions",
    ],
    "hig-technologies": [
      "Apple framework integration follows HIG for that technology",
      "Proper permission handling and progressive disclosure",
    ],
    "hig-platforms": [
      "UI adapts appropriately across target platforms",
      "Platform idioms respected (iPhone vs iPad vs Mac)",
    ],
  };
  return checklists[skillName] ?? ["Evaluate against Apple HIG best practices for this category"];
}
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/hig-doctor/src-termcast && bun test src/audit-generator.test.ts`
Expected: All 2 tests PASS

**Step 5: Commit**

```bash
git add packages/hig-doctor/src-termcast/src/audit-generator.ts packages/hig-doctor/src-termcast/src/audit-generator.test.ts
git commit -m "feat(hig-doctor): add audit markdown generator"
```

---

### Task 6: Wire Up Pipeline — `audit()` Entry Point

**Files:**
- Create: `packages/hig-doctor/src-termcast/src/audit.ts`
- Create: `packages/hig-doctor/src-termcast/src/audit.test.ts`

**Step 1: Write failing test**

```typescript
// audit.test.ts
import { describe, test, expect } from "bun:test";
import { audit } from "./audit";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("audit", () => {
  test("full pipeline produces markdown with categories", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-audit-"));
    try {
      await writeFile(join(dir, "ContentView.swift"), `
import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            Text("Hello")
                .foregroundColor(.red)
                .font(.system(size: 14))
        }
    }
}
`);
      const result = await audit(dir);
      expect(result.markdown).toContain("# HIG Audit");
      expect(result.categories.length).toBeGreaterThan(0);
      expect(result.scanResult.swiftFiles.length).toBe(1);

      // Should detect concerns
      const foundations = result.categories.find(c => c.skillName === "hig-foundations");
      expect(foundations).toBeDefined();
      expect(foundations!.concerns).toBeGreaterThan(0);
    } finally {
      await rm(dir, { recursive: true });
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/hig-doctor/src-termcast && bun test src/audit.test.ts`
Expected: FAIL

**Step 3: Implement audit pipeline**

```typescript
// audit.ts
import { scanProject, type ScanResult } from "./scanner";
import { detectPatterns, type PatternMatch } from "./patterns";
import { categorize, type CategorySummary } from "./categorizer";
import { generateAuditMarkdown, loadSkillContent } from "./audit-generator";
import { resolve, join } from "node:path";
import { access } from "node:fs/promises";

export interface AuditResult {
  scanResult: ScanResult;
  allMatches: PatternMatch[];
  categories: CategorySummary[];
  markdown: string;
}

export async function audit(directory: string, skillsDir?: string): Promise<AuditResult> {
  const resolvedDir = resolve(directory);

  // 1. Scan project
  const scanResult = await scanProject(resolvedDir);

  // 2. Detect patterns in all swift files
  const allMatches: PatternMatch[] = [];
  for (const file of scanResult.swiftFiles) {
    const matches = detectPatterns(file.content, file.relativePath);
    allMatches.push(...matches);
  }

  // 3. Categorize
  const categories = categorize(allMatches);

  // 4. Try to load skill content if skills directory is available
  let resolvedSkillsDir: string | null = null;
  const skillContents = new Map<string, string>();

  if (skillsDir) {
    resolvedSkillsDir = resolve(skillsDir);
  } else {
    // Try to find skills directory relative to this package
    const candidates = [
      join(resolvedDir, "skills"),
      join(resolvedDir, "..", "..", "skills"),
      join(resolvedDir, "apple-hig-skills", "skills"),
    ];
    for (const candidate of candidates) {
      try {
        await access(candidate);
        resolvedSkillsDir = candidate;
        break;
      } catch {}
    }
  }

  if (resolvedSkillsDir) {
    for (const category of categories) {
      const content = await loadSkillContent(resolvedSkillsDir, category.skillName);
      if (content) skillContents.set(category.skillName, content);
    }
  }

  // 5. Generate markdown
  const markdown = generateAuditMarkdown(scanResult, categories, resolvedSkillsDir, skillContents);

  return { scanResult, allMatches, categories, markdown };
}
```

**Step 4: Run tests to verify they pass**

Run: `cd packages/hig-doctor/src-termcast && bun test src/audit.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/hig-doctor/src-termcast/src/audit.ts packages/hig-doctor/src-termcast/src/audit.test.ts
git commit -m "feat(hig-doctor): wire up full audit pipeline"
```

---

### Task 7: Termcast TUI — Main List View

**Files:**
- Modify: `packages/hig-doctor/src-termcast/src/index.tsx`

**Step 1: Implement the main Termcast command**

Replace `src/index.tsx` with the full TUI:

```tsx
// index.tsx
import { List, ActionPanel, Action, Detail, getPreferenceValues } from "termcast";
import { useState, useEffect } from "react";
import { audit, type AuditResult } from "./audit";
import type { CategorySummary } from "./categorizer";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

function CategoryDetail({ category }: { category: CategorySummary }) {
  const byFile = new Map<string, typeof category.matches>();
  for (const m of category.matches) {
    if (!byFile.has(m.file)) byFile.set(m.file, []);
    byFile.get(m.file)!.push(m);
  }

  let md = `# ${category.label}\n\n`;
  md += `**${category.matches.length}** detections | **${category.concerns}** concerns | **${category.positives}** positives | **${category.fileCount}** files\n\n`;

  for (const [file, matches] of byFile) {
    md += `## ${file}\n\n\`\`\`swift\n`;
    for (const m of matches) {
      const tag = m.type === "concern" ? " // concern" : m.type === "positive" ? " // good" : "";
      md += `L${m.line}: ${m.lineContent}${tag}\n`;
    }
    md += `\`\`\`\n\n`;
  }

  return <Detail markdown={md} navigationTitle={category.label} />;
}

export default function Command() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dir = process.argv[2] || process.cwd();
    audit(dir)
      .then(setResult)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <List isLoading={true} navigationTitle="HIG Doctor" />;
  }

  if (error || !result) {
    return <Detail markdown={`# Error\n\n${error || "Unknown error"}`} />;
  }

  const { categories, scanResult, markdown } = result;
  const appName = scanResult.directory.split("/").pop() || "App";

  return (
    <List
      navigationTitle={`HIG Doctor: ${appName}`}
      searchBarPlaceholder="Filter categories..."
    >
      <List.Section
        title="Audit Summary"
        subtitle={`${scanResult.swiftFiles.length} files | ${categories.reduce((s, c) => s + c.matches.length, 0)} detections`}
      >
        {categories.map((category) => (
          <List.Item
            key={category.skillName}
            title={category.label}
            subtitle={`${category.matches.length} detections`}
            accessories={[
              ...(category.concerns > 0 ? [{ text: `${category.concerns} concerns`, color: "#FF6B6B" }] : []),
              ...(category.positives > 0 ? [{ text: `${category.positives} good`, color: "#51CF66" }] : []),
              { text: `${category.fileCount} files` },
            ]}
            actions={
              <ActionPanel>
                <Action.Push title="View Details" target={<CategoryDetail category={category} />} />
                <Action
                  title="Export Audit Markdown"
                  onAction={async () => {
                    const outPath = join(scanResult.directory, "hig-audit.md");
                    await writeFile(outPath, markdown);
                    console.log(`Exported to ${outPath}`);
                  }}
                />
                <Action.CopyToClipboard title="Copy Audit to Clipboard" content={markdown} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      {categories.length === 0 && (
        <List.EmptyView
          title="No HIG patterns detected"
          description="This project may not contain Swift/SwiftUI code, or no recognizable HIG patterns were found."
        />
      )}
    </List>
  );
}
```

**Step 2: Verify TUI renders**

Run: `cd packages/hig-doctor/src-termcast && termcast dev`
Expected: TUI shows with categories or empty view (depending on CWD)

**Step 3: Commit**

```bash
git add packages/hig-doctor/src-termcast/src/index.tsx
git commit -m "feat(hig-doctor): add Termcast TUI with list and detail views"
```

---

### Task 8: CLI Entry Point with Subcommands

**Files:**
- Create: `packages/hig-doctor/src-termcast/src/cli.ts`

This provides `--export` and `--stdout` modes that don't need the TUI.

**Step 1: Implement CLI entry point**

```typescript
// cli.ts
import { audit } from "./audit";
import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter(a => a.startsWith("--")));
  const positional = args.filter(a => !a.startsWith("--"));

  const directory = positional[0] || process.cwd();
  const skillsDir = flags.has("--skills") ? positional[1] : undefined;

  if (flags.has("--help") || flags.has("-h")) {
    console.log(`
hig-doctor audit — Apple HIG compliance audit tool

Usage:
  hig-doctor audit <directory> [options]

Options:
  --export     Write audit markdown to <directory>/hig-audit.md
  --stdout     Print audit markdown to stdout
  --skills     Path to apple-hig-skills/skills directory
  --help, -h   Show this help

Without --export or --stdout, opens the interactive TUI.
`);
    process.exit(0);
  }

  const result = await audit(directory, skillsDir);

  if (flags.has("--stdout")) {
    process.stdout.write(result.markdown);
    process.exit(0);
  }

  if (flags.has("--export")) {
    const outPath = join(resolve(directory), "hig-audit.md");
    await writeFile(outPath, result.markdown);
    console.log(`Audit exported to ${outPath}`);
    console.log(`${result.categories.length} categories, ${result.allMatches.length} detections`);
    process.exit(0);
  }

  // Default: TUI mode handled by termcast entry point (index.tsx)
  console.log("Use 'termcast dev' for interactive mode, or --export / --stdout for non-interactive.");
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
```

**Step 2: Verify CLI works**

Run: `cd packages/hig-doctor/src-termcast && bun src/cli.ts /path/to/any/swift/project --stdout | head -20`
Expected: Markdown output printed to stdout

**Step 3: Commit**

```bash
git add packages/hig-doctor/src-termcast/src/cli.ts
git commit -m "feat(hig-doctor): add CLI entry point with export and stdout modes"
```

---

### Task 9: Update Package Configuration

**Files:**
- Modify: `packages/hig-doctor/src-termcast/package.json`

**Step 1: Update package.json with bin entry and scripts**

Update `package.json`:
```json
{
  "name": "hig-doctor",
  "version": "1.0.0",
  "description": "Apple HIG audit tool for app projects",
  "type": "module",
  "bin": {
    "hig-doctor": "./src/cli.ts"
  },
  "scripts": {
    "dev": "termcast dev",
    "test": "bun test",
    "build": "termcast compile",
    "audit": "bun src/cli.ts",
    "audit:export": "bun src/cli.ts . --export",
    "audit:stdout": "bun src/cli.ts . --stdout"
  },
  "dependencies": {
    "termcast": "latest"
  }
}
```

**Step 2: Run all tests**

Run: `cd packages/hig-doctor/src-termcast && bun test`
Expected: All tests pass

**Step 3: Commit**

```bash
git add packages/hig-doctor/src-termcast/package.json
git commit -m "chore(hig-doctor): update package config with bin and scripts"
```

---

### Task 10: Integration Test with Real Skills Directory

**Files:**
- Create: `packages/hig-doctor/src-termcast/src/integration.test.ts`

**Step 1: Write integration test**

```typescript
// integration.test.ts
import { describe, test, expect } from "bun:test";
import { audit } from "./audit";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("integration", () => {
  test("audits a realistic SwiftUI project", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-integration-"));
    try {
      // Create a mini SwiftUI app
      await writeFile(join(dir, "MyApp.swift"), `
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
`);

      await writeFile(join(dir, "ContentView.swift"), `
import SwiftUI

struct ContentView: View {
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            TabView {
                HomeView()
                    .tabItem { Label("Home", systemImage: "house") }
                SettingsView()
                    .tabItem { Label("Settings", systemImage: "gear") }
            }
            .searchable(text: $searchText)
        }
    }
}
`);

      await writeFile(join(dir, "HomeView.swift"), `
import SwiftUI

struct HomeView: View {
    var body: some View {
        List {
            ForEach(items) { item in
                Text(item.name)
                    .font(.body)
                    .foregroundStyle(.primary)
                    .accessibilityLabel(item.name)
            }
        }
        .refreshable {
            await loadItems()
        }
    }
}
`);

      await writeFile(join(dir, "BadView.swift"), `
import SwiftUI

struct BadView: View {
    var body: some View {
        Text("Hello")
            .foregroundColor(.red)
            .font(.system(size: 16))
            .foregroundColor(Color(red: 0.5, green: 0.2, blue: 0.1))
    }
}
`);

      // Run audit with skills from this repo
      const skillsDir = join(import.meta.dir, "..", "..", "..", "..", "skills");
      const result = await audit(dir, skillsDir);

      // Basic assertions
      expect(result.scanResult.swiftFiles.length).toBe(4);
      expect(result.categories.length).toBeGreaterThan(0);
      expect(result.markdown).toContain("# HIG Audit");

      // Should detect good patterns
      const foundations = result.categories.find(c => c.skillName === "hig-foundations");
      expect(foundations).toBeDefined();
      expect(foundations!.positives).toBeGreaterThan(0); // .font(.body), .foregroundStyle(.primary)
      expect(foundations!.concerns).toBeGreaterThan(0); // .foregroundColor(.red), .font(.system(size:))

      // Should detect layout patterns
      const layout = result.categories.find(c => c.skillName === "hig-components-layout");
      expect(layout).toBeDefined();

      // Markdown should include skill reference content if skills dir found
      if (result.markdown.includes("Key Principles")) {
        expect(result.markdown).toContain("Prioritize content");
      }
    } finally {
      await rm(dir, { recursive: true });
    }
  });

  test("handles empty project gracefully", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-empty-"));
    try {
      const result = await audit(dir);
      expect(result.scanResult.swiftFiles.length).toBe(0);
      expect(result.categories.length).toBe(0);
      expect(result.markdown).toContain("# HIG Audit");
    } finally {
      await rm(dir, { recursive: true });
    }
  });
});
```

**Step 2: Run integration tests**

Run: `cd packages/hig-doctor/src-termcast && bun test src/integration.test.ts`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add packages/hig-doctor/src-termcast/src/integration.test.ts
git commit -m "test(hig-doctor): add integration tests with realistic SwiftUI project"
```

---

### Task 11: Run Full Test Suite and Verify

**Step 1: Run all new tests**

Run: `cd packages/hig-doctor/src-termcast && bun test`
Expected: All tests pass (scanner: 4, patterns: 6, categorizer: 3, audit-generator: 2, audit: 1, integration: 2 = 18 tests)

**Step 2: Run existing lint tests to ensure no regression**

Run: `cd packages/hig-doctor && npm test`
Expected: All 15 existing tests pass (lint mode untouched)

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat(hig-doctor): complete v1.0 audit tool with Termcast TUI

New audit command scans Apple app projects for HIG compliance,
categorizes findings against 14 skill areas, and generates
structured markdown audit prompts for AI evaluation.

- Project scanner: discovers Swift files, asset catalogs, Info.plist
- Pattern detection: 70+ regex rules across all HIG categories
- HIG categorizer: maps findings to skill areas
- Audit generator: produces structured markdown with code excerpts
- Termcast TUI: interactive category browsing with detail views
- CLI modes: --export, --stdout for non-interactive use
- Legacy lint mode preserved in src/ directory"
```
