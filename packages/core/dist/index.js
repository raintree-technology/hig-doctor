// src/scanner.ts
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, extname, sep } from "node:path";
var IGNORED_DIRS = /* @__PURE__ */ new Set([
  ".build",
  ".git",
  "node_modules",
  "Pods",
  "DerivedData",
  ".swiftpm",
  "Carthage",
  "Build",
  ".next",
  ".nuxt",
  ".output",
  "dist",
  "build",
  ".cache",
  ".turbo",
  "coverage",
  "__pycache__",
  ".dart_tool",
  ".pub-cache",
  "android",
  "ios",
  "macos",
  "linux",
  "windows"
]);
var MAX_FILE_BYTES = 15e5;
var MAX_DEPTH = 25;
var GENERATED_FILE = /\.(min|bundle|chunk)\.(js|css|mjs|cjs)$/i;
var CODE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".swift",
  ".tsx",
  ".jsx",
  ".ts",
  ".js",
  ".vue",
  ".svelte",
  ".dart",
  ".kt",
  ".java"
]);
var STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".styl"
]);
var MARKUP_EXTENSIONS = /* @__PURE__ */ new Set([
  ".html",
  ".htm",
  ".xml",
  ".storyboard",
  ".xib"
]);
var CONFIG_FILES = /* @__PURE__ */ new Set([
  "tailwind.config.ts",
  "tailwind.config.js",
  "tailwind.config.mjs",
  "next.config.ts",
  "next.config.js",
  "next.config.mjs",
  "nuxt.config.ts",
  "nuxt.config.js",
  "svelte.config.js",
  "svelte.config.ts",
  "angular.json",
  "package.json",
  "tsconfig.json",
  "Info.plist",
  "Package.swift",
  "pubspec.yaml",
  "app.json",
  "expo.json",
  "eas.json",
  "components.json",
  "build.gradle",
  "build.gradle.kts",
  "AndroidManifest.xml"
]);
var IGNORE_FILE = ".higauditignore";
function globToRegExp(glob) {
  const g = glob.replace(/^\.\//, "").replace(/^\/+/, "").replace(/\/+$/, "");
  let re = "";
  for (let i = 0; i < g.length; i++) {
    const ch = g[i];
    if (ch === "*") {
      if (g[i + 1] === "*") {
        if (g[i + 2] === "/") {
          re += "(?:.*/)?";
          i += 2;
        } else {
          re += ".*";
          i += 1;
        }
      } else {
        re += "[^/]*";
      }
    } else if (ch === "?") {
      re += "[^/]";
    } else if ("\\^$.|+()[]{}".includes(ch)) {
      re += "\\" + ch;
    } else {
      re += ch;
    }
  }
  return new RegExp("^" + re + "$");
}
async function loadIgnorePatterns(directory) {
  try {
    const content = await readFile(join(directory, IGNORE_FILE), "utf-8");
    return content.split("\n").map((line) => line.trim()).filter((line) => line.length > 0 && !line.startsWith("#"));
  } catch {
    return [];
  }
}
function buildIgnoreMatcher(patterns) {
  const regexps = patterns.map(globToRegExp);
  if (regexps.length === 0) return () => false;
  return (relPath) => {
    const posix = relPath.split(sep).join("/");
    return regexps.some((re) => re.test(posix));
  };
}
async function readText(path) {
  try {
    const info = await stat(path);
    if (info.size > MAX_FILE_BYTES) return null;
    return await readFile(path, "utf-8");
  } catch {
    return null;
  }
}
async function walkDir(dir, rootDir, result, isIgnored, depth = 0) {
  if (depth > MAX_DEPTH) return;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = relative(rootDir, fullPath);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (isIgnored(relPath)) continue;
      if (entry.name.endsWith(".xcassets")) {
        result.assetCatalogs.push(relPath);
        continue;
      }
      if (entry.name.endsWith(".xcodeproj") || entry.name.endsWith(".xcworkspace")) {
        result.xcodeProjects.push(relPath);
        continue;
      }
      await walkDir(fullPath, rootDir, result, isIgnored, depth + 1);
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if (/\.(test|spec)\.[^.]+$/.test(entry.name)) continue;
      if (GENERATED_FILE.test(entry.name)) continue;
      if (isIgnored(relPath)) continue;
      const isConfig = CONFIG_FILES.has(entry.name);
      const wantCode = CODE_EXTENSIONS.has(ext);
      const wantStyle = STYLE_EXTENSIONS.has(ext);
      const wantMarkup = MARKUP_EXTENSIONS.has(ext);
      if (!isConfig && !wantCode && !wantStyle && !wantMarkup) continue;
      const content = await readText(fullPath);
      if (content === null) continue;
      const file = { relativePath: relPath, absolutePath: fullPath, content };
      if (isConfig) {
        result.configFiles.push(file);
        if (entry.name === "Info.plist") result.infoPlistPaths.push(relPath);
        if (entry.name === "Package.swift") result.packageSwift = file;
        if (wantCode) {
          result.codeFiles.push(file);
          if (ext === ".swift") result.swiftFiles.push(file);
        }
      } else if (wantCode) {
        result.codeFiles.push(file);
        if (ext === ".swift") result.swiftFiles.push(file);
      } else if (wantStyle) {
        result.styleFiles.push(file);
      } else if (wantMarkup) {
        result.markupFiles.push(file);
        if (ext === ".storyboard" || ext === ".xib") result.storyboards.push(file);
      }
    }
  }
}
function detectFrameworks(result) {
  const frameworks = [];
  const hasExt = (ext) => result.codeFiles.some((f) => f.relativePath.endsWith(ext));
  const hasConfig = (name) => result.configFiles.some((f) => f.relativePath.endsWith(name));
  const configContains = (name, text) => {
    const file = result.configFiles.find((f) => f.relativePath.endsWith(name));
    return file?.content.includes(text) ?? false;
  };
  if (hasExt(".swift")) {
    const hasSwiftUI = result.codeFiles.some((f) => f.content.includes("import SwiftUI"));
    const hasUIKit = result.codeFiles.some((f) => f.content.includes("import UIKit"));
    if (hasSwiftUI) frameworks.push("swiftui");
    if (hasUIKit) frameworks.push("uikit");
    if (!hasSwiftUI && !hasUIKit) frameworks.push("swiftui");
  }
  if (hasConfig("next.config.ts") || hasConfig("next.config.js") || hasConfig("next.config.mjs")) {
    frameworks.push("nextjs");
  } else if ((hasExt(".tsx") || hasExt(".jsx")) && configContains("package.json", '"react"')) {
    if (configContains("package.json", '"react-native"') || hasConfig("app.json")) {
      frameworks.push("react-native");
    } else {
      frameworks.push("react");
    }
  }
  if (hasExt(".vue")) {
    if (hasConfig("nuxt.config.ts") || hasConfig("nuxt.config.js")) {
      frameworks.push("nuxt");
    } else {
      frameworks.push("vue");
    }
  }
  if (hasExt(".svelte")) {
    if (hasConfig("svelte.config.js") || hasConfig("svelte.config.ts")) {
      frameworks.push("sveltekit");
    } else {
      frameworks.push("svelte");
    }
  }
  if (hasConfig("angular.json") || configContains("package.json", '"@angular/core"')) {
    frameworks.push("angular");
  }
  if (hasExt(".dart") || hasConfig("pubspec.yaml")) {
    frameworks.push("flutter");
  }
  if (hasExt(".kt")) {
    const hasCompose = result.codeFiles.some((f) => f.content.includes("androidx.compose"));
    if (hasCompose) {
      frameworks.push("compose");
    } else {
      frameworks.push("android");
    }
  } else if (result.markupFiles.some((f) => f.relativePath.endsWith(".xml") && f.content.includes("android:"))) {
    frameworks.push("android");
  }
  if (frameworks.length === 0 && result.markupFiles.some((f) => f.relativePath.endsWith(".html"))) {
    frameworks.push("html");
  }
  if (frameworks.length === 0) frameworks.push("unknown");
  return frameworks;
}
async function scanProject(directory, options = {}) {
  const result = {
    directory,
    frameworks: [],
    codeFiles: [],
    styleFiles: [],
    configFiles: [],
    markupFiles: [],
    swiftFiles: [],
    infoPlistPaths: [],
    assetCatalogs: [],
    storyboards: [],
    xcodeProjects: [],
    packageSwift: null
  };
  const patterns = [...await loadIgnorePatterns(directory), ...options.exclude ?? []];
  const isIgnored = buildIgnoreMatcher(patterns);
  await walkDir(directory, directory, result, isIgnored);
  result.frameworks = detectFrameworks(result);
  return result;
}

// src/patterns.ts
var HIG_SNAPSHOT_DATE = "2025-02-02";
var CRITICAL_CONCERNS = /* @__PURE__ */ new Set([
  "missing alt",
  "Image without alt",
  "svg without a11y",
  "empty heading",
  "empty button",
  "missing html lang",
  "video without track",
  "blink element",
  "marquee element",
  "user-scalable=no",
  "maximum-scale=1",
  "ImageView without contentDescription"
]);
var SERIOUS_CONCERNS = /* @__PURE__ */ new Set([
  // "onTapGesture without traits", "Image without a11y", and "hover without
  // focus" are deliberately NOT here: they fire heuristically on common,
  // frequently-fine code, so they default to moderate instead of tripping a
  // `--fail-on serious` CI gate.
  "isAccessibilityElement false on interactive",
  "div with onClick no role",
  "span with onClick no role",
  "ambiguous link text",
  "positive tabindex",
  "aria-hidden on focusable",
  "onMouseOver without onFocus",
  "onMouseOut without onBlur",
  "div as button",
  "div as nav/header class",
  "autoplay media",
  "outline none",
  "v-on:click without keyboard",
  "on:click without on:keydown",
  "(click) without (keydown)",
  "clickable without Role",
  "nested touchables"
]);
function severityFor(pattern) {
  if (CRITICAL_CONCERNS.has(pattern)) return "critical";
  if (SERIOUS_CONCERNS.has(pattern)) return "serious";
  return "moderate";
}
var SWIFT = /\.swift$/;
var WEB = /\.(tsx|jsx|html?)$/;
var TSX_JSX = /\.(tsx|jsx)$/;
var TS_JS = /\.(tsx|jsx|ts|js)$/;
var VUE = /\.vue$/;
var SVELTE = /\.svelte$/;
var ANGULAR = /\.(ts|html)$/;
var DART = /\.dart$/;
var KOTLIN = /\.kt$/;
var ANDROID_XML = /\.xml$/;
var WEB_ALL = /\.(tsx|jsx|html?|vue|svelte)$/;
var STYLE_ALL = /\.(css|scss|sass|less)$/;
var swiftRules = [
  // Layout & Navigation
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "TabView", regex: /\bTabView\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NavigationStack", regex: /\bNavigationStack\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NavigationSplitView", regex: /\bNavigationSplitView\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "navigation", type: "concern", pattern: "NavigationView (deprecated)", regex: /\bNavigationView\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NavigationLink", regex: /\bNavigationLink\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "List", regex: /\bList\s*\{/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "ScrollView", regex: /\bScrollView\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "LazyVGrid", regex: /\bLazyVGrid\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "LazyHGrid", regex: /\bLazyHGrid\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "GeometryReader", regex: /\bGeometryReader\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "layout", type: "positive", pattern: "adaptiveLayout", regex: /\.adaptive\(minimum:/, fileFilter: SWIFT },
  // Color
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcodedColor", regex: /\.foregroundColor\(\.(red|blue|green|yellow|orange|purple|pink|white|black)\)/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcodedRGBColor", regex: /Color\(\s*red:/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcodedUIColor", regex: /UIColor\(\s*red:/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcoded Color(uiColor:)", regex: /Color\(\s*uiColor:\s*UIColor\(\s*red:/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "semanticColor", regex: /\.(primary|secondary|accentColor)\b/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "foregroundStyle", regex: /\.foregroundStyle\(\.(primary|secondary|tertiary|quaternary)\)/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "assetCatalogColor", regex: /Color\(\s*"[^"]+"\s*\)/, fileFilter: SWIFT },
  // Typography
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "dynamicTypeStyle", regex: /\.font\(\.(largeTitle|title|title2|title3|headline|subheadline|body|callout|footnote|caption|caption2)\)/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "hardcodedFontSize", regex: /\.font\(\.system\(size:/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "hardcodedUIFont", regex: /UIFont\.\s*systemFont\(ofSize:/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "scaledMetric", regex: /@ScaledMetric/, fileFilter: SWIFT },
  // Accessibility
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityLabel", regex: /\.accessibilityLabel\(/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityHint", regex: /\.accessibilityHint\(/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityHidden", regex: /\.accessibilityHidden\(/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityAddTraits", regex: /\.accessibilityAddTraits\(/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityValue", regex: /\.accessibilityValue\(/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityAction", regex: /\.accessibilityAction\(/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "reduceMotion", regex: /accessibilityReduceMotion/, fileFilter: SWIFT },
  // Swift accessibility concerns
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "onTapGesture without traits", regex: /\.onTapGesture\s*\{/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "Image without a11y", regex: /\bImage\(\s*systemName:/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "isAccessibilityElement false on interactive", regex: /\.isAccessibilityElement\s*=\s*false/, fileFilter: SWIFT },
  // Dark mode
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "colorScheme", regex: /@Environment\(\\\.colorScheme\)/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "preferredColorScheme", regex: /\.preferredColorScheme\(/, fileFilter: SWIFT },
  // Controls
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Button", regex: /\bButton\s*[{(]/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Toggle", regex: /\bToggle\s*[{(]/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Picker", regex: /\bPicker\s*[{(]/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Slider", regex: /\bSlider\s*[{(]/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Stepper", regex: /\bStepper\s*[{(]/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "DatePicker", regex: /\bDatePicker\s*[{(]/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "ColorPicker", regex: /\bColorPicker\s*[{(]/, fileFilter: SWIFT },
  // Dialogs
  { category: "components-dialogs", subcategory: "modals", type: "pattern", pattern: "sheet", regex: /\.sheet\(/, fileFilter: SWIFT },
  { category: "components-dialogs", subcategory: "alerts", type: "pattern", pattern: "alert", regex: /\.alert\(/, fileFilter: SWIFT },
  { category: "components-dialogs", subcategory: "alerts", type: "pattern", pattern: "confirmationDialog", regex: /\.confirmationDialog\(/, fileFilter: SWIFT },
  { category: "components-dialogs", subcategory: "popover", type: "pattern", pattern: "popover", regex: /\.popover\(/, fileFilter: SWIFT },
  // Search
  { category: "components-search", subcategory: "search", type: "pattern", pattern: "searchable", regex: /\.searchable\(/, fileFilter: SWIFT },
  // Status
  { category: "components-status", subcategory: "progress", type: "pattern", pattern: "ProgressView", regex: /\bProgressView\b/, fileFilter: SWIFT },
  // Menus
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "contextMenu", regex: /\.contextMenu\s*\{/, fileFilter: SWIFT },
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "Menu", regex: /\bMenu\s*\{/, fileFilter: SWIFT },
  { category: "components-menus", subcategory: "toolbar", type: "pattern", pattern: "toolbar", regex: /\.toolbar\s*\{/, fileFilter: SWIFT },
  // Patterns
  { category: "patterns", subcategory: "animation", type: "pattern", pattern: "withAnimation", regex: /\bwithAnimation\b/, fileFilter: SWIFT },
  { category: "patterns", subcategory: "haptics", type: "pattern", pattern: "sensoryFeedback", regex: /\.sensoryFeedback\(/, fileFilter: SWIFT },
  { category: "patterns", subcategory: "dragDrop", type: "pattern", pattern: "onDrag", regex: /\.onDrag\b/, fileFilter: SWIFT },
  { category: "patterns", subcategory: "refresh", type: "pattern", pattern: "refreshable", regex: /\.refreshable\b/, fileFilter: SWIFT },
  { category: "patterns", subcategory: "swipeActions", type: "pattern", pattern: "swipeActions", regex: /\.swipeActions\b/, fileFilter: SWIFT },
  // Inputs
  { category: "inputs", subcategory: "gestures", type: "pattern", pattern: "TapGesture", regex: /\.onTapGesture\b/, fileFilter: SWIFT },
  { category: "inputs", subcategory: "keyboard", type: "pattern", pattern: "keyboardShortcut", regex: /\.keyboardShortcut\(/, fileFilter: SWIFT },
  { category: "inputs", subcategory: "focus", type: "pattern", pattern: "focusState", regex: /@FocusState\b/, fileFilter: SWIFT },
  // Technologies
  { category: "technologies", subcategory: "appIntents", type: "pattern", pattern: "AppIntent", regex: /\bAppIntent\b/, fileFilter: SWIFT },
  { category: "technologies", subcategory: "swiftData", type: "pattern", pattern: "SwiftData", regex: /import\s+SwiftData/, fileFilter: SWIFT },
  { category: "technologies", subcategory: "widgets", type: "pattern", pattern: "WidgetKit", regex: /import\s+WidgetKit/, fileFilter: SWIFT },
  { category: "technologies", subcategory: "activityKit", type: "pattern", pattern: "ActivityKit", regex: /import\s+ActivityKit/, fileFilter: SWIFT },
  { category: "technologies", subcategory: "healthKit", type: "pattern", pattern: "HealthKit", regex: /import\s+HealthKit/, fileFilter: SWIFT },
  { category: "technologies", subcategory: "arKit", type: "pattern", pattern: "ARKit", regex: /import\s+ARKit/, fileFilter: SWIFT },
  { category: "technologies", subcategory: "applePay", type: "pattern", pattern: "PassKit/ApplePay", regex: /import\s+PassKit|PKPaymentButton/, fileFilter: SWIFT },
  { category: "technologies", subcategory: "signInApple", type: "pattern", pattern: "SignInWithApple", regex: /ASAuthorizationAppleIDButton|SignInWithAppleButton/, fileFilter: SWIFT },
  // Platforms
  { category: "platforms", subcategory: "multiplatform", type: "positive", pattern: "conditionalPlatform", regex: /#if\s+(os\(iOS\)|os\(macOS\)|os\(watchOS\)|os\(tvOS\)|os\(visionOS\))/, fileFilter: SWIFT },
  // UIKit concerns
  { category: "foundations", subcategory: "layout", type: "concern", pattern: "hardcoded CGRect", regex: /CGRect\(\s*x:\s*\d/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "layout", type: "concern", pattern: "ignoresSafeArea", regex: /\.ignoresSafeArea\(/, fileFilter: SWIFT },
  { category: "patterns", subcategory: "state", type: "concern", pattern: "non-private @State", regex: /@State\b(?!\s+private\b)\s+(?:var|let)\b/, fileFilter: SWIFT }
];
var webCodeRules = [
  // ── Accessibility: Positives ────────────────────────────────
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-label", regex: /aria-label\s*=/, fileFilter: WEB },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-describedby", regex: /aria-describedby/, fileFilter: WEB },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-live", regex: /aria-live/, fileFilter: WEB },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-expanded", regex: /aria-expanded/, fileFilter: WEB },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-hidden", regex: /aria-hidden/, fileFilter: WEB },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-current", regex: /aria-current/, fileFilter: WEB },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-invalid", regex: /aria-invalid/, fileFilter: WEB },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-errormessage", regex: /aria-errormessage/, fileFilter: WEB },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-required", regex: /aria-required/, fileFilter: WEB },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "role attribute", regex: /role=["']/, fileFilter: WEB },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "sr-only", regex: /sr-only|visually-hidden|screen-reader/i, fileFilter: /\.(tsx|jsx|html?|css|vue|svelte)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "alt text", regex: /\balt=["'][^"']+["']/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "tabIndex", regex: /tabIndex=\{0\}|tabindex="0"/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "focus management", regex: /onFocus|onBlur|useRef.*focus/, fileFilter: TS_JS },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "keyboard handler", regex: /onKeyDown|onKeyUp|onKeyPress/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "skip link", regex: /skip.*nav|skip.*content|skiplink/i, fileFilter: /\.(tsx|jsx|html?|css|vue|svelte)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "htmlFor/for attribute", regex: /htmlFor=|for=["']/, fileFilter: WEB_ALL },
  // ── Accessibility: Concerns ─────────────────────────────────
  // Negative-attribute checks use a "tempered greedy token" — (?:(?!X)[^>])* —
  // which walks the tag body asserting attribute X never appears before the
  // closing >. A plain lookbehind/lookahead backtracks and matches tags that DO
  // have the attribute (the original bug flagged <img alt="..."> as missing alt).
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "missing alt", regex: /<img\b(?:(?!\balt\s*=)[^>])*>/i, fileFilter: WEB_ALL, scope: "document" },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "Image without alt", regex: /<Image\b(?:(?!\balt\s*=)[^>])*>/, fileFilter: TSX_JSX, scope: "document" },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "svg without a11y", regex: /<svg\b(?:(?!aria-label|aria-hidden|\brole\s*=)[^>])*>/, fileFilter: WEB_ALL, scope: "document" },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "div with onClick no role", regex: /<div\b(?:(?!\brole\s*=)[^>])*\bonClick\b(?:(?!\brole\s*=)[^>])*>/, fileFilter: TSX_JSX, scope: "document" },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "span with onClick no role", regex: /<span\b(?:(?!\brole\s*=)[^>])*\bonClick\b(?:(?!\brole\s*=)[^>])*>/, fileFilter: TSX_JSX, scope: "document" },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "ambiguous link text", regex: />\s*(click here|read more|learn more|here|more)\s*</i, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "positive tabindex", regex: /tabIndex=\{[1-9]|tabindex="[1-9]/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "aria-hidden on focusable", regex: /aria-hidden=["']true["'][^>]*(?:<button|<a\s|<input|tabIndex)/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "onMouseOver without onFocus", regex: /onMouseOver=(?![^>]*onFocus)/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "onMouseOut without onBlur", regex: /onMouseOut=(?![^>]*onBlur)/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "autoFocus", regex: /autoFocus\b|autofocus\b/, fileFilter: WEB_ALL },
  // ── Heading & Structure ─────────────────────────────────────
  { category: "foundations", subcategory: "structure", type: "concern", pattern: "empty heading", regex: /<h[1-6][^>]*>\s*<\/h[1-6]>/, fileFilter: WEB_ALL, scope: "document" },
  { category: "foundations", subcategory: "structure", type: "concern", pattern: "empty button", regex: /<button[^>]*>\s*<\/button>/, fileFilter: WEB_ALL, scope: "document" },
  { category: "foundations", subcategory: "structure", type: "concern", pattern: "div as button", regex: /<div[^>]*role=["']button["']/, fileFilter: WEB_ALL, scope: "document" },
  { category: "foundations", subcategory: "structure", type: "concern", pattern: "div as nav/header class", regex: /<div[^>]*class(?:Name)?=["'][^"']*\b(nav|header|footer|sidebar)\b/i, fileFilter: WEB_ALL, scope: "document" },
  { category: "foundations", subcategory: "structure", type: "concern", pattern: "missing html lang", regex: /<html(?!\s[^>]*lang=)/, fileFilter: /\.html?$/, scope: "document" },
  { category: "foundations", subcategory: "structure", type: "positive", pattern: "html lang attribute", regex: /<html\s[^>]*lang=["'][a-z]/, fileFilter: /\.html?$/ },
  { category: "foundations", subcategory: "structure", type: "positive", pattern: "landmark main", regex: /<main\b|role=["']main["']/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "structure", type: "positive", pattern: "landmark nav", regex: /<nav\b|role=["']navigation["']/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "structure", type: "positive", pattern: "landmark banner", regex: /role=["']banner["']/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "structure", type: "positive", pattern: "landmark contentinfo", regex: /role=["']contentinfo["']/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "structure", type: "positive", pattern: "heading h1", regex: /<h1\b/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "structure", type: "pattern", pattern: "heading h2", regex: /<h2\b/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "structure", type: "pattern", pattern: "heading h3", regex: /<h3\b/, fileFilter: WEB_ALL },
  // ── Color system ────────────────────────────────────────────
  { category: "foundations", subcategory: "color", type: "positive", pattern: "CSS variable color", regex: /var\(--[a-z]/, fileFilter: /\.(tsx|jsx|css|scss|html?|vue|svelte)$/ },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "semantic text color", regex: /text-(foreground|muted-foreground|primary|secondary|destructive|accent-foreground)/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "semantic bg color", regex: /bg-(background|muted|accent|card|popover|primary|secondary|destructive)/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "semantic border color", regex: /border-(border|input|ring)/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "inline color style", regex: /style=\{?\{[^}]*color:\s*['"]#/, fileFilter: TSX_JSX },
  // ── Typography ──────────────────────────────────────────────
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "design token font size", regex: /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "font-weight token", regex: /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "hardcoded font-size px", regex: /font-size:\s*\d+px/, fileFilter: /\.(css|scss|tsx|jsx)$/ },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "rem/em font size", regex: /font-size:\s*[\d.]+r?em/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "system font stack", regex: /font-family:.*(-apple-system|BlinkMacSystemFont|system-ui|SF Pro)/i, fileFilter: STYLE_ALL },
  // ── Dark mode ───────────────────────────────────────────────
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "dark mode class", regex: /\bdark:/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "prefers-color-scheme", regex: /prefers-color-scheme/, fileFilter: /\.(css|scss|tsx|jsx|ts|js|vue|svelte)$/ },
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "color-scheme property", regex: /color-scheme:\s*(light\s+dark|dark\s+light)/, fileFilter: STYLE_ALL },
  // ── Responsive / Layout ─────────────────────────────────────
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "responsive breakpoint", regex: /\b(sm:|md:|lg:|xl:|2xl:)/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "media query", regex: /@media\s*\(/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "safe area inset", regex: /safe-area-inset|env\(safe-area/, fileFilter: /\.(css|scss|tsx|jsx)$/ },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "container query", regex: /@container\b/, fileFilter: STYLE_ALL },
  // ── Motion ──────────────────────────────────────────────────
  { category: "foundations", subcategory: "motion", type: "positive", pattern: "prefers-reduced-motion", regex: /prefers-reduced-motion/, fileFilter: /\.(css|scss|tsx|jsx|ts|js|vue|svelte)$/ },
  { category: "foundations", subcategory: "motion", type: "pattern", pattern: "CSS animation", regex: /@keyframes/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "motion", type: "pattern", pattern: "CSS transition", regex: /transition:/, fileFilter: STYLE_ALL },
  // ── Touch targets ───────────────────────────────────────────
  { category: "foundations", subcategory: "touchTargets", type: "positive", pattern: "min touch target 44px", regex: /min-(width|height):\s*4[4-8]px|min-(w|h)-1[1-2]\b/, fileFilter: /\.(css|scss|tsx|jsx)$/ },
  // ── Navigation (components-layout) ──────────────────────────
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "nav element", regex: /<nav\b/, fileFilter: WEB_ALL },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "Link component", regex: /<Link\b/, fileFilter: TSX_JSX },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "useRouter", regex: /useRouter\b/, fileFilter: TS_JS },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "usePathname", regex: /usePathname\b/, fileFilter: TS_JS },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "header element", regex: /<header\b/, fileFilter: WEB_ALL },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "main element", regex: /<main\b/, fileFilter: WEB_ALL },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "footer element", regex: /<footer\b/, fileFilter: WEB_ALL },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "section element", regex: /<section\b/, fileFilter: WEB_ALL },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "aside element", regex: /<aside\b/, fileFilter: WEB_ALL },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "article element", regex: /<article\b/, fileFilter: WEB_ALL },
  { category: "components-layout", subcategory: "layout", type: "positive", pattern: "grid layout", regex: /grid-cols|grid-template/, fileFilter: /\.(tsx|jsx|css|scss)$/ },
  // ── Controls (components-controls) ──────────────────────────
  { category: "components-controls", subcategory: "buttons", type: "pattern", pattern: "button element", regex: /<button\b|<Button\b/, fileFilter: WEB_ALL },
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "input element", regex: /<input\b|<Input\b/, fileFilter: WEB_ALL },
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "select element", regex: /<select\b|<Select\b/, fileFilter: WEB_ALL },
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "textarea element", regex: /<textarea\b|<Textarea\b/, fileFilter: WEB_ALL },
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "checkbox/radio", regex: /type=["'](checkbox|radio)["']/, fileFilter: WEB_ALL },
  { category: "components-controls", subcategory: "inputs", type: "positive", pattern: "label element", regex: /<label\b|<Label\b/, fileFilter: WEB_ALL },
  { category: "components-controls", subcategory: "toggle", type: "pattern", pattern: "switch/toggle", regex: /<Switch\b|role=["']switch["']/, fileFilter: TSX_JSX },
  // ── Forms (inputs) ──────────────────────────────────────────
  { category: "inputs", subcategory: "forms", type: "pattern", pattern: "form element", regex: /<form\b|<Form\b/, fileFilter: WEB_ALL },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "form validation", regex: /\brequired\b|pattern=|minLength|maxLength/, fileFilter: WEB_ALL },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "input type email", regex: /type=["']email["']/, fileFilter: WEB_ALL },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "input type tel", regex: /type=["']tel["']/, fileFilter: WEB_ALL },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "input type url", regex: /type=["']url["']/, fileFilter: WEB_ALL },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "input type number", regex: /type=["']number["']/, fileFilter: WEB_ALL },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "autocomplete attribute", regex: /autocomplete=["']/, fileFilter: WEB_ALL },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "fieldset element", regex: /<fieldset\b/, fileFilter: WEB_ALL },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "legend element", regex: /<legend\b/, fileFilter: WEB_ALL },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "placeholder text", regex: /placeholder=["']/, fileFilter: WEB_ALL },
  // ── Dialogs (components-dialogs) ────────────────────────────
  { category: "components-dialogs", subcategory: "modals", type: "pattern", pattern: "dialog element", regex: /<dialog\b|<Dialog\b/, fileFilter: WEB_ALL },
  { category: "components-dialogs", subcategory: "modals", type: "pattern", pattern: "modal/sheet", regex: /<Modal\b|<Sheet\b|<Drawer\b/, fileFilter: TSX_JSX },
  { category: "components-dialogs", subcategory: "alerts", type: "pattern", pattern: "alert dialog", regex: /<AlertDialog\b|role=["']alertdialog["']/, fileFilter: TSX_JSX },
  { category: "components-dialogs", subcategory: "popover", type: "pattern", pattern: "popover", regex: /<Popover\b/, fileFilter: TSX_JSX },
  { category: "components-dialogs", subcategory: "toast", type: "pattern", pattern: "toast/notification", regex: /<Toast\b|toast\(|<Toaster\b|<Sonner\b/, fileFilter: TSX_JSX },
  { category: "components-dialogs", subcategory: "tooltip", type: "pattern", pattern: "tooltip", regex: /<Tooltip\b|role=["']tooltip["']/, fileFilter: WEB_ALL },
  // ── Search (components-search) ──────────────────────────────
  { category: "components-search", subcategory: "search", type: "pattern", pattern: "search input", regex: /type=["']search["']/, fileFilter: WEB_ALL },
  { category: "components-search", subcategory: "search", type: "pattern", pattern: "search role", regex: /role=["']search["']/, fileFilter: WEB_ALL },
  // ── Menus (components-menus) ────────────────────────────────
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "dropdown menu", regex: /<DropdownMenu\b/, fileFilter: TSX_JSX },
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "context menu", regex: /<ContextMenu\b|onContextMenu/, fileFilter: TSX_JSX },
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "menu role", regex: /role=["']menu["']|role=["']menubar["']/, fileFilter: WEB_ALL },
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "menuitem role", regex: /role=["']menuitem["']/, fileFilter: WEB_ALL },
  // ── Status (components-status) ──────────────────────────────
  { category: "components-status", subcategory: "progress", type: "pattern", pattern: "progress bar", regex: /<progress\b|<Progress\b|role=["']progressbar["']/, fileFilter: WEB_ALL },
  { category: "components-status", subcategory: "loading", type: "pattern", pattern: "loading state", regex: /isLoading|loading\s*[=:]|<Skeleton\b|<Spinner\b/, fileFilter: TS_JS },
  { category: "components-status", subcategory: "loading", type: "pattern", pattern: "aria-busy", regex: /aria-busy/, fileFilter: WEB_ALL },
  // ── Content (components-content) ────────────────────────────
  { category: "components-content", subcategory: "images", type: "pattern", pattern: "Next Image", regex: /<Image\b.*\bsrc=/, fileFilter: TSX_JSX },
  { category: "components-content", subcategory: "tables", type: "pattern", pattern: "table element", regex: /<table\b|<Table\b/, fileFilter: WEB_ALL },
  { category: "components-content", subcategory: "accordion", type: "pattern", pattern: "accordion", regex: /<Accordion\b/, fileFilter: TSX_JSX },
  { category: "components-content", subcategory: "cards", type: "pattern", pattern: "card component", regex: /<Card\b/, fileFilter: TSX_JSX },
  { category: "components-content", subcategory: "lists", type: "pattern", pattern: "list elements", regex: /<ul\b|<ol\b|<dl\b/, fileFilter: WEB_ALL },
  { category: "components-content", subcategory: "details", type: "pattern", pattern: "details/summary", regex: /<details\b|<summary\b/, fileFilter: WEB_ALL },
  // ── Patterns ────────────────────────────────────────────────
  { category: "patterns", subcategory: "animation", type: "pattern", pattern: "framer motion", regex: /framer-motion|motion\.[a-z]/, fileFilter: TS_JS },
  { category: "patterns", subcategory: "seo", type: "positive", pattern: "metadata/head", regex: /export.*metadata|<Head\b|<title\b/, fileFilter: TS_JS },
  { category: "patterns", subcategory: "errorHandling", type: "positive", pattern: "error boundary", regex: /ErrorBoundary|error\.tsx/, fileFilter: TS_JS },
  { category: "patterns", subcategory: "i18n", type: "positive", pattern: "i18n/l10n", regex: /useTranslation|i18n|intl|formatMessage|<FormattedMessage/, fileFilter: TS_JS },
  // ── Technologies ────────────────────────────────────────────
  { category: "technologies", subcategory: "analytics", type: "pattern", pattern: "analytics", regex: /@vercel\/analytics|gtag|GoogleAnalytics/, fileFilter: TS_JS },
  // ── Media accessibility ─────────────────────────────────────
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "video without track", regex: /<video\b(?:(?!<\/video>|<track\b)[\s\S])*?<\/video>/i, fileFilter: WEB_ALL, scope: "document" },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "autoplay media", regex: /\bauto[Pp]lay\b(?!\s*=\s*\{?\s*['"]?false)/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "blink element", regex: /<blink\b/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "marquee element", regex: /<marquee\b/, fileFilter: WEB_ALL },
  // ── Viewport concerns ───────────────────────────────────────
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "user-scalable=no", regex: /user-scalable\s*=\s*no/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "maximum-scale=1", regex: /maximum-scale\s*=\s*1\b/, fileFilter: WEB_ALL }
];
var cssRules = [
  // Color
  { category: "foundations", subcategory: "color", type: "positive", pattern: "CSS custom property def", regex: /--[a-z][\w-]*:\s*/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcoded hex in CSS", regex: /(?:^|[\s;{])(?:color|background(?:-color)?|border(?:-color)?):\s*#[0-9a-fA-F]{3,8}\b/, fileFilter: STYLE_ALL },
  // Typography
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "clamp font size", regex: /font-size:\s*clamp\(/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "font-size below 12px", regex: /font-size:\s*(1[01]|[0-9])px\b/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "text-align justify", regex: /text-align:\s*justify/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "line-height below 1.2", regex: /line-height:\s*(0\.\d+|1\.[01]\d*)\s*[;}]/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "max-width on text", regex: /max-width:.*ch\b/, fileFilter: STYLE_ALL },
  // Accessibility
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "focus-visible", regex: /:focus-visible/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "focus ring styles", regex: /outline.*focus|ring-/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "high contrast", regex: /forced-colors|high-contrast|prefers-contrast/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "outline none", regex: /outline:\s*(none|0)\b/, fileFilter: STYLE_ALL, skipInBlock: /(:focus:not\(:focus-visible\))|(@media\s+print)/ },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "hover without focus", regex: /:hover\b/, fileFilter: STYLE_ALL, scope: "document", requireAbsent: /:focus/ },
  // Layout
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "print styles", regex: /@media\s+print/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "logical properties", regex: /margin-inline|padding-inline|border-inline|inset-inline/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "flexbox gap", regex: /\bgap:\s*/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "aspect-ratio", regex: /aspect-ratio:/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "layout", type: "concern", pattern: "overflow hidden on body", regex: /body\s*\{[^}]*overflow:\s*hidden/, fileFilter: STYLE_ALL },
  // Touch targets
  { category: "foundations", subcategory: "touchTargets", type: "positive", pattern: "touch target sizing", regex: /min-(width|height):\s*4[4-8]px/, fileFilter: STYLE_ALL },
  // z-index
  { category: "foundations", subcategory: "layout", type: "concern", pattern: "extreme z-index", regex: /z-index:\s*[1-9]\d{3,}/, fileFilter: STYLE_ALL },
  // !important
  { category: "foundations", subcategory: "layout", type: "concern", pattern: "!important usage", regex: /!important/, fileFilter: STYLE_ALL, skipInBlock: /@media\s+print|prefers-reduced-motion/ },
  // Scrollbar
  { category: "foundations", subcategory: "layout", type: "pattern", pattern: "custom scrollbar", regex: /-webkit-scrollbar|scrollbar-width/, fileFilter: STYLE_ALL },
  // i18n / RTL
  { category: "foundations", subcategory: "i18n", type: "positive", pattern: "RTL direction", regex: /direction:\s*rtl|\[dir=["']rtl["']\]/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "i18n", type: "positive", pattern: "logical text-align", regex: /text-align:\s*(start|end)\b/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "i18n", type: "positive", pattern: "logical margin/padding", regex: /margin-inline-start|margin-inline-end|padding-inline-start|padding-inline-end/, fileFilter: STYLE_ALL },
  { category: "foundations", subcategory: "i18n", type: "concern", pattern: "physical text-align", regex: /text-align:\s*(left|right)\b/, fileFilter: STYLE_ALL }
];
var vueRules = [
  // Accessibility positives
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "v-bind aria-label", regex: /:?aria-label=|v-bind:aria-label/, fileFilter: VUE },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "v-bind aria-describedby", regex: /:?aria-describedby=|v-bind:aria-describedby/, fileFilter: VUE },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "v-bind aria-expanded", regex: /:?aria-expanded=|v-bind:aria-expanded/, fileFilter: VUE },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "v-bind role", regex: /:?role=|v-bind:role/, fileFilter: VUE },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "v-bind alt", regex: /:?alt=|v-bind:alt/, fileFilter: VUE },
  // Accessibility concerns
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "v-on:click without keyboard", regex: /v-on:click=|@click=(?![^>]*(?:@keydown|@keyup|v-on:keydown|v-on:keyup))/, fileFilter: VUE },
  // Navigation
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "router-link", regex: /<router-link\b/, fileFilter: VUE },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NuxtLink", regex: /<NuxtLink\b/, fileFilter: VUE },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "useRouter (Vue)", regex: /useRouter\(\)/, fileFilter: VUE },
  // Semantic elements
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "nav in template", regex: /<nav\b/, fileFilter: VUE },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "header in template", regex: /<header\b/, fileFilter: VUE },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "main in template", regex: /<main\b/, fileFilter: VUE },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "footer in template", regex: /<footer\b/, fileFilter: VUE },
  // Dark mode
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "Vue dark class", regex: /class="[^"]*dark:|:class="[^"]*dark/, fileFilter: VUE },
  // Controls
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "v-model", regex: /v-model=/, fileFilter: VUE },
  // Forms
  { category: "inputs", subcategory: "forms", type: "pattern", pattern: "Vue form", regex: /<form\b/, fileFilter: VUE },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "Vue form validation", regex: /required\b|v-validate|@submit\.prevent/, fileFilter: VUE },
  // Transitions
  { category: "patterns", subcategory: "animation", type: "pattern", pattern: "Vue transition", regex: /<transition\b|<Transition\b/, fileFilter: VUE },
  // i18n
  { category: "patterns", subcategory: "i18n", type: "positive", pattern: "Vue i18n", regex: /\$t\(|useI18n|vue-i18n/, fileFilter: VUE }
];
var svelteRules = [
  // Accessibility
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-label (Svelte)", regex: /aria-label=/, fileFilter: SVELTE },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-describedby (Svelte)", regex: /aria-describedby=/, fileFilter: SVELTE },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "role (Svelte)", regex: /role=["']/, fileFilter: SVELTE },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "on:click without on:keydown", regex: /on:click=(?![^>]*on:key(down|up)=)/, fileFilter: SVELTE },
  // Navigation
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "SvelteKit link", regex: /<a\s[^>]*href=["']\//, fileFilter: SVELTE },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "nav (Svelte)", regex: /<nav\b/, fileFilter: SVELTE },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "header (Svelte)", regex: /<header\b/, fileFilter: SVELTE },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "main (Svelte)", regex: /<main\b/, fileFilter: SVELTE },
  // Dark mode
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "Svelte dark class", regex: /class:dark|class="[^"]*dark:/, fileFilter: SVELTE },
  // Motion
  { category: "foundations", subcategory: "motion", type: "positive", pattern: "Svelte reduced motion", regex: /prefersReducedMotion|prefers-reduced-motion/, fileFilter: SVELTE },
  { category: "patterns", subcategory: "animation", type: "pattern", pattern: "Svelte transition", regex: /transition:|in:|out:/, fileFilter: SVELTE },
  // Forms
  { category: "inputs", subcategory: "forms", type: "pattern", pattern: "Svelte form", regex: /<form\b/, fileFilter: SVELTE },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "Svelte bind:value", regex: /bind:value=/, fileFilter: SVELTE },
  // i18n
  { category: "patterns", subcategory: "i18n", type: "positive", pattern: "Svelte i18n", regex: /svelte-i18n|\$_\(|i18n/, fileFilter: SVELTE }
];
var angularRules = [
  // Accessibility
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "[attr.aria-label]", regex: /\[attr\.aria-label\]=/, fileFilter: ANGULAR },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "[attr.aria-describedby]", regex: /\[attr\.aria-describedby\]=/, fileFilter: ANGULAR },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "[attr.role]", regex: /\[attr\.role\]=/, fileFilter: ANGULAR },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "Angular CDK a11y", regex: /cdkTrapFocus|cdkFocusInitial|cdkMonitorSubtreeFocus|A11yModule/, fileFilter: ANGULAR },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "(click) without (keydown)", regex: /\(click\)=(?![^>]*\(keydown\)=)/, fileFilter: ANGULAR },
  // Navigation
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "routerLink", regex: /routerLink=/, fileFilter: ANGULAR },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "router-outlet", regex: /<router-outlet/, fileFilter: ANGULAR },
  // Angular Material
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "mat-button", regex: /mat-button|matButton/, fileFilter: ANGULAR },
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "mat-form-field", regex: /mat-form-field|matFormField/, fileFilter: ANGULAR },
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "mat-input", regex: /matInput/, fileFilter: ANGULAR },
  { category: "components-controls", subcategory: "toggle", type: "pattern", pattern: "mat-slide-toggle", regex: /mat-slide-toggle/, fileFilter: ANGULAR },
  { category: "components-dialogs", subcategory: "modals", type: "pattern", pattern: "mat-dialog", regex: /MatDialog|mat-dialog/, fileFilter: ANGULAR },
  { category: "components-content", subcategory: "tables", type: "pattern", pattern: "mat-table", regex: /mat-table|matTable/, fileFilter: ANGULAR },
  // Forms
  { category: "inputs", subcategory: "forms", type: "pattern", pattern: "Angular form", regex: /\[formGroup\]=|formControlName=|ngModel/, fileFilter: ANGULAR },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "Angular validation", regex: /Validators\.|required|minlength|maxlength/, fileFilter: ANGULAR },
  // i18n
  { category: "patterns", subcategory: "i18n", type: "positive", pattern: "Angular i18n", regex: /i18n\b|@angular\/localize|translate/, fileFilter: ANGULAR },
  // Dark mode
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "Angular dark theme", regex: /dark-theme|\.dark\b/, fileFilter: ANGULAR }
];
var kotlinRules = [
  // Accessibility
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "contentDescription", regex: /contentDescription\s*=/, fileFilter: KOTLIN },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "semantics modifier", regex: /Modifier\.semantics/, fileFilter: KOTLIN },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "clearAndSetSemantics", regex: /clearAndSetSemantics/, fileFilter: KOTLIN },
  // Catches both the trailing-lambda form `Modifier.clickable { }` (which has no
  // way to pass a role and is therefore always a concern) and the parenthesized
  // `Modifier.clickable(...)` form when no role argument is present.
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "clickable without Role", regex: /Modifier\.clickable\s*(\{|\((?![^)]*role\s*=))/, fileFilter: KOTLIN },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "testTag", regex: /testTag\s*=/, fileFilter: KOTLIN },
  // Color
  { category: "foundations", subcategory: "color", type: "positive", pattern: "MaterialTheme colorScheme", regex: /MaterialTheme\.colorScheme/, fileFilter: KOTLIN },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcoded Color(0x)", regex: /Color\(0x[0-9a-fA-F]+\)/, fileFilter: KOTLIN },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcoded Color.Red/Blue", regex: /Color\.(Red|Blue|Green|Yellow|White|Black|Gray|Cyan|Magenta)\b/, fileFilter: KOTLIN },
  // Typography
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "MaterialTheme typography", regex: /MaterialTheme\.typography/, fileFilter: KOTLIN },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "hardcoded fontSize", regex: /fontSize\s*=\s*\d+\.sp/, fileFilter: KOTLIN },
  // Dark mode
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "isSystemInDarkTheme", regex: /isSystemInDarkTheme\(\)/, fileFilter: KOTLIN },
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "darkColorScheme", regex: /darkColorScheme\b/, fileFilter: KOTLIN },
  // Layout
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NavigationBar", regex: /\bNavigationBar\b/, fileFilter: KOTLIN },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NavHost", regex: /\bNavHost\b/, fileFilter: KOTLIN },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "BottomNavigation", regex: /\bBottomNavigation\b/, fileFilter: KOTLIN },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "Scaffold", regex: /\bScaffold\s*\(/, fileFilter: KOTLIN },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "LazyColumn", regex: /\bLazyColumn\b/, fileFilter: KOTLIN },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "LazyRow", regex: /\bLazyRow\b/, fileFilter: KOTLIN },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "LazyVerticalGrid", regex: /\bLazyVerticalGrid\b/, fileFilter: KOTLIN },
  // Controls
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Compose Button", regex: /\bButton\s*\(/, fileFilter: KOTLIN },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "TextField", regex: /\bTextField\s*\(|OutlinedTextField\s*\(/, fileFilter: KOTLIN },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Compose Switch", regex: /\bSwitch\s*\(/, fileFilter: KOTLIN },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Compose Checkbox", regex: /\bCheckbox\s*\(/, fileFilter: KOTLIN },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Compose Slider", regex: /\bSlider\s*\(/, fileFilter: KOTLIN },
  // Dialogs
  { category: "components-dialogs", subcategory: "modals", type: "pattern", pattern: "AlertDialog (Compose)", regex: /\bAlertDialog\s*\(/, fileFilter: KOTLIN },
  { category: "components-dialogs", subcategory: "modals", type: "pattern", pattern: "BottomSheet", regex: /BottomSheet|ModalBottomSheet/, fileFilter: KOTLIN },
  // Search
  { category: "components-search", subcategory: "search", type: "pattern", pattern: "SearchBar (Compose)", regex: /\bSearchBar\s*\(/, fileFilter: KOTLIN },
  // Status
  { category: "components-status", subcategory: "progress", type: "pattern", pattern: "CircularProgress", regex: /CircularProgressIndicator|LinearProgressIndicator/, fileFilter: KOTLIN }
];
var androidXmlRules = [
  // Accessibility
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "android:contentDescription", regex: /android:contentDescription=/, fileFilter: ANDROID_XML },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "ImageView without contentDescription", regex: /<ImageView(?![^>]*contentDescription=)/, fileFilter: ANDROID_XML },
  { category: "foundations", subcategory: "accessibility", type: "pattern", pattern: "importantForAccessibility", regex: /android:importantForAccessibility/, fileFilter: ANDROID_XML },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "android:labelFor", regex: /android:labelFor=/, fileFilter: ANDROID_XML },
  // Color / resources
  { category: "foundations", subcategory: "color", type: "positive", pattern: "@color/ resource", regex: /@color\//, fileFilter: ANDROID_XML },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcoded color in XML", regex: /android:(?:text|background)Color=["']#/, fileFilter: ANDROID_XML },
  // Typography
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "sp text size", regex: /android:textSize=["']\d+sp/, fileFilter: ANDROID_XML },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "dp text size", regex: /android:textSize=["']\d+dp/, fileFilter: ANDROID_XML },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "@style/ usage", regex: /@style\//, fileFilter: ANDROID_XML },
  // Layout
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "dp units", regex: /\d+dp\b/, fileFilter: ANDROID_XML },
  { category: "foundations", subcategory: "layout", type: "concern", pattern: "px units in XML", regex: /\d+px\b/, fileFilter: ANDROID_XML },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "@dimen/ resource", regex: /@dimen\//, fileFilter: ANDROID_XML },
  // Components
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "ConstraintLayout", regex: /ConstraintLayout/, fileFilter: ANDROID_XML },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "RecyclerView", regex: /RecyclerView/, fileFilter: ANDROID_XML },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "BottomNavigationView", regex: /BottomNavigationView/, fileFilter: ANDROID_XML },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NavigationView", regex: /NavigationView/, fileFilter: ANDROID_XML },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "MaterialButton", regex: /MaterialButton/, fileFilter: ANDROID_XML },
  // Touch targets
  { category: "foundations", subcategory: "touchTargets", type: "positive", pattern: "minHeight 48dp", regex: /android:minHeight=["']4[4-8]dp/, fileFilter: ANDROID_XML }
];
var reactNativeRules = [
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityLabel", regex: /accessibilityLabel=/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityRole", regex: /accessibilityRole=/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityHint", regex: /accessibilityHint=/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityState", regex: /accessibilityState=/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessible={true}", regex: /accessible=\{true\}/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "useColorScheme", regex: /useColorScheme\b/, fileFilter: TS_JS },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "useWindowDimensions", regex: /useWindowDimensions\b/, fileFilter: TS_JS },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "React Navigation", regex: /createNativeStackNavigator|createBottomTabNavigator|NavigationContainer/, fileFilter: TS_JS },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "FlatList", regex: /\bFlatList\b/, fileFilter: TSX_JSX },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "SectionList", regex: /\bSectionList\b/, fileFilter: TSX_JSX },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "SafeAreaView", regex: /\bSafeAreaView\b/, fileFilter: TSX_JSX },
  { category: "inputs", subcategory: "gestures", type: "pattern", pattern: "Gesture handler", regex: /PanGestureHandler|TapGestureHandler|GestureDetector/, fileFilter: TSX_JSX },
  { category: "patterns", subcategory: "haptics", type: "pattern", pattern: "Haptics", regex: /Haptics\.|expo-haptics/, fileFilter: TS_JS },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "nested touchables", regex: /accessible=\{true\}[\s\S]*?<Touchable/, fileFilter: TSX_JSX }
];
var flutterRules = [
  // Accessibility
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "Semantics widget", regex: /\bSemantics\(/, fileFilter: DART },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "ExcludeSemantics", regex: /\bExcludeSemantics\(/, fileFilter: DART },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "MergeSemantics", regex: /\bMergeSemantics\(/, fileFilter: DART },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "semanticLabel", regex: /semanticLabel:/, fileFilter: DART },
  // Color
  { category: "foundations", subcategory: "color", type: "positive", pattern: "Theme color", regex: /Theme\.of\(context\)\.colorScheme/, fileFilter: DART },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcoded Color", regex: /Color\(0x[0-9a-fA-F]+\)/, fileFilter: DART },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "Colors.red/blue", regex: /Colors\.(red|blue|green|yellow|orange|purple|pink|white|black|grey)\b/, fileFilter: DART },
  // Typography
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "Theme text style", regex: /Theme\.of\(context\)\.textTheme/, fileFilter: DART },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "hardcoded fontSize", regex: /fontSize:\s*\d+/, fileFilter: DART },
  // Dark mode
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "brightness detection", regex: /MediaQuery\.of\(context\)\.platformBrightness/, fileFilter: DART },
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "darkTheme", regex: /darkTheme:/, fileFilter: DART },
  // Layout
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "MediaQuery responsive", regex: /MediaQuery\.of\(context\)\.size/, fileFilter: DART },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "LayoutBuilder", regex: /\bLayoutBuilder\b/, fileFilter: DART },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "Navigator", regex: /\bNavigator\b/, fileFilter: DART },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "CupertinoTabBar", regex: /\bCupertinoTabBar\b/, fileFilter: DART },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "GoRouter", regex: /\bGoRouter\b/, fileFilter: DART },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "ListView", regex: /\bListView\b/, fileFilter: DART },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "GridView", regex: /\bGridView\b/, fileFilter: DART },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "CupertinoButton", regex: /\bCupertinoButton\b/, fileFilter: DART },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "ElevatedButton", regex: /\bElevatedButton\b/, fileFilter: DART },
  // i18n
  { category: "patterns", subcategory: "i18n", type: "positive", pattern: "Flutter l10n", regex: /AppLocalizations|flutter_localizations|intl/, fileFilter: DART }
];
var uikitRules = [
  // Navigation & structure
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "UINavigationController", regex: /\bUINavigationController\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "UITabBarController", regex: /\bUITabBarController\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "UISplitViewController", regex: /\bUISplitViewController\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "UIPageViewController", regex: /\bUIPageViewController\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "lists", type: "pattern", pattern: "UICollectionView", regex: /\bUICollectionView\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "lists", type: "pattern", pattern: "UITableView", regex: /\bUITableView\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "UIStackView", regex: /\bUIStackView\b/, fileFilter: SWIFT },
  { category: "components-search", subcategory: "search", type: "pattern", pattern: "UISearchController", regex: /\bUISearchController\b/, fileFilter: SWIFT },
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "UIMenu", regex: /\bUIMenu\b/, fileFilter: SWIFT },
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "UIContextMenuConfiguration", regex: /\bUIContextMenuConfiguration\b/, fileFilter: SWIFT },
  { category: "components-status", subcategory: "modals", type: "pattern", pattern: "UIAlertController", regex: /\bUIAlertController\b/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "UISegmentedControl", regex: /\bUISegmentedControl\b/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "UISwitch", regex: /\bUISwitch\b/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "UIStepper", regex: /\bUIStepper\b/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "UIToolbar", regex: /\bUIToolbar\b/, fileFilter: SWIFT },
  // Typography — Dynamic Type
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "UIKit preferredFont", regex: /preferredFont\(forTextStyle:/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "adjustsFontForContentSizeCategory", regex: /adjustsFontForContentSizeCategory\s*=\s*true/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "hardcoded UIFont(name:)", regex: /UIFont\(name:[^)]*,\s*size:\s*\d/, fileFilter: SWIFT },
  // Color — semantic vs hardcoded
  { category: "foundations", subcategory: "color", type: "positive", pattern: "UIKit semantic color", regex: /UIColor\.(label|secondaryLabel|tertiaryLabel|systemBackground|secondarySystemBackground|tintColor|systemFill|separator|link)\b/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcoded UIColor constant", regex: /UIColor\.(white|black|gray|lightGray|darkGray|red|blue|green|yellow|orange|purple|brown|cyan|magenta)\b/, fileFilter: SWIFT },
  // Accessibility
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "UIKit accessibilityLabel", regex: /\.accessibilityLabel\s*=/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "UIKit isAccessibilityElement", regex: /\.isAccessibilityElement\s*=\s*true/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "UIKit accessibilityTraits", regex: /\.accessibilityTraits\s*=/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "viewWithTag lookup", regex: /\.viewWithTag\(/, fileFilter: SWIFT },
  // SF Symbols
  { category: "foundations", subcategory: "sf-symbols", type: "positive", pattern: "UIImage(systemName:)", regex: /UIImage\(systemName:/, fileFilter: SWIFT },
  // Layout — Auto Layout & safe area
  { category: "components-layout", subcategory: "layout", type: "positive", pattern: "Auto Layout constraints", regex: /NSLayoutConstraint|\.constraint\(equalTo:/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "layout", type: "positive", pattern: "safeAreaLayoutGuide", regex: /safeAreaLayoutGuide/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "layout", type: "concern", pattern: "UIScreen.main.bounds for layout", regex: /UIScreen\.main\.bounds/, fileFilter: SWIFT },
  // Haptics
  { category: "patterns", subcategory: "haptics", type: "positive", pattern: "UIFeedbackGenerator", regex: /UI(Impact|Notification|Selection)FeedbackGenerator/, fileFilter: SWIFT },
  // Dark mode
  { category: "foundations", subcategory: "color", type: "positive", pattern: "userInterfaceStyle", regex: /traitCollection\.userInterfaceStyle|overrideUserInterfaceStyle/, fileFilter: SWIFT },
  // Deprecated APIs
  { category: "components-status", subcategory: "modals", type: "concern", pattern: "UIAlertView (deprecated)", regex: /\bUIAlertView\b/, fileFilter: SWIFT },
  { category: "components-status", subcategory: "modals", type: "concern", pattern: "UIActionSheet (deprecated)", regex: /\bUIActionSheet\b/, fileFilter: SWIFT },
  { category: "technologies", subcategory: "structure", type: "concern", pattern: "UIWebView (deprecated)", regex: /\bUIWebView\b/, fileFilter: SWIFT },
  { category: "components-search", subcategory: "search", type: "concern", pattern: "UISearchDisplayController (deprecated)", regex: /\bUISearchDisplayController\b/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "structure", type: "concern", pattern: "setStatusBarStyle (deprecated)", regex: /setStatusBarStyle|statusBarStyle\s*=/, fileFilter: SWIFT }
];
var appkitRules = [
  // Structure
  { category: "components-layout", subcategory: "windows", type: "pattern", pattern: "NSWindow", regex: /\bNSWindow\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "windows", type: "pattern", pattern: "NSWindowController", regex: /\bNSWindowController\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NSSplitViewController", regex: /\bNSSplitViewController\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "sidebars", type: "pattern", pattern: "NSOutlineView", regex: /\bNSOutlineView\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "lists", type: "pattern", pattern: "NSTableView", regex: /\bNSTableView\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "lists", type: "pattern", pattern: "NSCollectionView", regex: /\bNSCollectionView\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "toolbar", type: "pattern", pattern: "NSToolbar", regex: /\bNSToolbar\b/, fileFilter: SWIFT },
  { category: "components-menus", subcategory: "menu-bar", type: "pattern", pattern: "NSMenu", regex: /\bNSMenu\b/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "NSButton", regex: /\bNSButton\b/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "NSSegmentedControl", regex: /\bNSSegmentedControl\b/, fileFilter: SWIFT },
  { category: "components-status", subcategory: "modals", type: "pattern", pattern: "NSAlert", regex: /\bNSAlert\b/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "NSComboBox", regex: /\bNSComboBox\b/, fileFilter: SWIFT },
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "NSPopUpButton", regex: /\bNSPopUpButton\b/, fileFilter: SWIFT },
  // Materials & vibrancy (macOS)
  { category: "foundations", subcategory: "materials", type: "pattern", pattern: "NSVisualEffectView", regex: /\bNSVisualEffectView\b/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "materials", type: "positive", pattern: "NSVisualEffect material", regex: /\.material\s*=\s*\.(sidebar|menu|popover|headerView|contentBackground|windowBackground|hudWindow|underWindowBackground)/, fileFilter: SWIFT },
  // Color — semantic vs hardcoded
  { category: "foundations", subcategory: "color", type: "positive", pattern: "NSColor semantic", regex: /NSColor\.(labelColor|secondaryLabelColor|controlAccentColor|windowBackgroundColor|textColor|controlColor|separatorColor|linkColor)\b/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcoded NSColor(red:)", regex: /NSColor\(\s*(calibratedRed|deviceRed|red):/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcoded NSColor constant", regex: /NSColor\.(white|black|gray|red|blue|green|yellow|orange|purple)\b/, fileFilter: SWIFT },
  // Typography
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "NSFont.preferredFont", regex: /NSFont\.preferredFont\(forTextStyle:/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "hardcoded NSFont size", regex: /NSFont\.systemFont\(ofSize:\s*\d/, fileFilter: SWIFT },
  // Accessibility
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "setAccessibilityLabel", regex: /setAccessibilityLabel\(|\.accessibilityLabel\s*=/, fileFilter: SWIFT },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "NSAccessibility protocol", regex: /NSAccessibilityElement|isAccessibilityElement\(\)/, fileFilter: SWIFT },
  // Layout
  { category: "components-layout", subcategory: "layout", type: "positive", pattern: "AppKit Auto Layout", regex: /translatesAutoresizingMaskIntoConstraints\s*=\s*false/, fileFilter: SWIFT },
  // Pointer
  { category: "inputs", subcategory: "keyboard", type: "positive", pattern: "NSCursor", regex: /\bNSCursor\b/, fileFilter: SWIFT },
  // Deprecated
  { category: "components-menus", subcategory: "menu-bar", type: "concern", pattern: "NSMenuItem setSubmenu (deprecated)", regex: /setSubmenu:forItem:/, fileFilter: SWIFT }
];
var watchosRules = [
  // WatchKit structure
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "WKInterfaceController", regex: /\bWKInterfaceController\b/, fileFilter: SWIFT },
  { category: "platforms", subcategory: "navigation", type: "pattern", pattern: "WKHostingController", regex: /\bWKHostingController\b/, fileFilter: SWIFT },
  // Digital Crown
  { category: "inputs", subcategory: "digital-crown", type: "positive", pattern: "digitalCrownRotation", regex: /\.digitalCrownRotation\(/, fileFilter: SWIFT },
  { category: "inputs", subcategory: "digital-crown", type: "pattern", pattern: "WKCrownSequencer", regex: /\bWKCrownSequencer\b|crownSequencer/, fileFilter: SWIFT },
  { category: "inputs", subcategory: "digital-crown", type: "positive", pattern: "focusable for crown", regex: /\.focusable\(/, fileFilter: SWIFT },
  // Complications
  { category: "platforms", subcategory: "complications", type: "pattern", pattern: "CLKComplication", regex: /\bCLKComplication/, fileFilter: SWIFT },
  { category: "platforms", subcategory: "complications", type: "pattern", pattern: "WidgetKit complication", regex: /CLKComplicationWidgetMigrator|\.accessoryCircular|\.accessoryCorner/, fileFilter: SWIFT },
  // Always-On / luminance
  { category: "platforms", subcategory: "always-on", type: "positive", pattern: "isLuminanceReduced", regex: /isLuminanceReduced/, fileFilter: SWIFT },
  { category: "platforms", subcategory: "always-on", type: "positive", pattern: "privacySensitive", regex: /\.privacySensitive\(/, fileFilter: SWIFT },
  // Watch faces / workouts
  { category: "platforms", subcategory: "workouts", type: "pattern", pattern: "HKWorkoutSession", regex: /\bHKWorkoutSession\b/, fileFilter: SWIFT },
  { category: "platforms", subcategory: "workouts", type: "positive", pattern: "WKExtendedRuntimeSession", regex: /\bWKExtendedRuntimeSession\b/, fileFilter: SWIFT },
  // Haptics (watch)
  { category: "patterns", subcategory: "haptics", type: "positive", pattern: "WKInterfaceDevice haptic", regex: /WKInterfaceDevice\.current\(\)\.play\(/, fileFilter: SWIFT },
  // Notifications
  { category: "patterns", subcategory: "state", type: "pattern", pattern: "WKUserNotificationInterfaceController", regex: /\bWKUserNotificationInterfaceController\b/, fileFilter: SWIFT }
];
var visionosRules = [
  // Windows, volumes, immersive spaces
  { category: "components-layout", subcategory: "windows", type: "pattern", pattern: "visionOS volumetric window", regex: /\.windowStyle\(\.volumetric\)/, fileFilter: SWIFT },
  { category: "platforms", subcategory: "immersive", type: "pattern", pattern: "ImmersiveSpace", regex: /\bImmersiveSpace\b/, fileFilter: SWIFT },
  { category: "platforms", subcategory: "immersive", type: "positive", pattern: "immersionStyle mixed", regex: /\.immersionStyle\(/, fileFilter: SWIFT },
  { category: "platforms", subcategory: "spatial", type: "pattern", pattern: "RealityView", regex: /\bRealityView\b/, fileFilter: SWIFT },
  // Ornaments
  { category: "components-layout", subcategory: "ornaments", type: "positive", pattern: "ornament", regex: /\.ornament\(/, fileFilter: SWIFT },
  // Glass materials
  { category: "foundations", subcategory: "materials", type: "positive", pattern: "glassBackgroundEffect", regex: /\.glassBackgroundEffect\(/, fileFilter: SWIFT },
  // Hover / gaze interaction
  { category: "inputs", subcategory: "spatial", type: "positive", pattern: "hoverEffect", regex: /\.hoverEffect\(/, fileFilter: SWIFT },
  { category: "inputs", subcategory: "spatial", type: "positive", pattern: "visionOS spatial gesture", regex: /SpatialTapGesture|\.targetedToAnyEntity\(/, fileFilter: SWIFT },
  // Depth / 3D layout
  { category: "components-layout", subcategory: "spatial", type: "pattern", pattern: "Model3D", regex: /\bModel3D\b/, fileFilter: SWIFT },
  { category: "components-layout", subcategory: "spatial", type: "positive", pattern: "depth alignment", regex: /\.offset\(z:|alignment3D/, fileFilter: SWIFT }
];
function slugify(label) {
  return label.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
var SECTIONS = [
  ["swift", swiftRules],
  ["uikit", uikitRules],
  ["appkit", appkitRules],
  ["watchos", watchosRules],
  ["visionos", visionosRules],
  ["web", webCodeRules],
  ["css", cssRules],
  ["vue", vueRules],
  ["svelte", svelteRules],
  ["angular", angularRules],
  ["compose", kotlinRules],
  ["android-xml", androidXmlRules],
  ["react-native", reactNativeRules],
  ["flutter", flutterRules]
];
var allRules = [];
var ENGINE_BY_RULE_ID = {
  "swift/image-without-a11y": "swift-structural",
  "swift/on-tap-gesture-without-traits": "swift-structural",
  "web/missing-alt": "ast-tsx",
  "web/image-without-alt": "ast-tsx",
  "web/div-with-on-click-no-role": "ast-tsx",
  "web/span-with-on-click-no-role": "ast-tsx",
  "web/positive-tabindex": "ast-tsx"
};
{
  const used = /* @__PURE__ */ new Set();
  for (const [framework, rules] of SECTIONS) {
    for (const rule of rules) {
      const base = `${framework}/${slugify(rule.pattern)}`;
      let id = base;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
      used.add(id);
      allRules.push({ ...rule, id, framework, engine: ENGINE_BY_RULE_ID[id] ?? "regex" });
    }
  }
}
var HIG_BASE = "https://developer.apple.com/design/human-interface-guidelines/";
var SUBCATEGORY_HIG = {
  accessibility: "accessibility",
  accordion: "disclosure-controls",
  alerts: "alerts",
  analytics: "privacy",
  animation: "motion",
  buttons: "buttons",
  cards: "layout",
  color: "color",
  controls: "controls",
  details: "disclosure-controls",
  focus: "focus-and-selection",
  forms: "entering-data",
  gestures: "gestures",
  haptics: "playing-haptics",
  images: "images",
  inputs: "text-fields",
  keyboard: "keyboards",
  layout: "layout",
  lists: "lists-and-tables",
  loading: "loading",
  menus: "menus",
  modals: "modality",
  motion: "motion",
  multiplatform: "",
  navigation: "",
  popover: "popovers",
  progress: "progress-indicators",
  refresh: "loading",
  search: "searching",
  seo: "",
  state: "feedback",
  structure: "layout",
  tables: "lists-and-tables",
  toast: "feedback",
  toggle: "toggles",
  toolbar: "toolbars",
  tooltip: "offering-help",
  typography: "typography",
  widgets: "widgets",
  // Apple-platform subcategories
  windows: "windows",
  sidebars: "sidebars",
  "split-views": "split-views",
  "menu-bar": "the-menu-bar",
  materials: "materials",
  "sf-symbols": "sf-symbols",
  "digital-crown": "digital-crown",
  complications: "complications",
  "always-on": "always-on",
  workouts: "workouts",
  immersive: "immersive-experiences",
  spatial: "spatial-layout",
  ornaments: "ornaments"
};
function higCitation(rule) {
  if (rule.hig) return rule.hig;
  const slug = SUBCATEGORY_HIG[rule.subcategory] ?? "";
  return HIG_BASE + slug;
}
var FIX_GUIDANCE = {
  // Critical
  "missing alt": 'Add descriptive alt text, or alt="" when the image is purely decorative.',
  "Image without alt": 'Add descriptive alt text, or alt="" when the image is purely decorative.',
  "svg without a11y": 'Give inline SVG role="img" plus a <title> or aria-label, or aria-hidden="true" if decorative.',
  "empty heading": "Add text content to the heading or remove it; screen readers announce empty headings as unlabeled.",
  "empty button": "Give the button visible text or an aria-label.",
  "missing html lang": 'Add lang="\u2026" to the <html> element so assistive tech picks the right voice.',
  "video without track": 'Add a <track kind="captions"> file to the video.',
  "blink element": "Remove <blink>; if emphasis is needed, use CSS animation that honors prefers-reduced-motion.",
  "marquee element": "Remove <marquee>; use static layout or an accessible animation that honors prefers-reduced-motion.",
  "user-scalable=no": "Remove user-scalable=no from the viewport meta so pinch-zoom keeps working.",
  "maximum-scale=1": "Remove maximum-scale=1 from the viewport meta so users can zoom.",
  "ImageView without contentDescription": 'Add android:contentDescription, or importantForAccessibility="no" if decorative.',
  // Serious
  "isAccessibilityElement false on interactive": "Keep interactive elements exposed to accessibility; give them a label instead of hiding them.",
  "div with onClick no role": 'Use a native <button>, or add role="button", tabIndex={0}, and Enter/Space key handling.',
  "span with onClick no role": 'Use a native <button>, or add role="button", tabIndex={0}, and Enter/Space key handling.',
  "ambiguous link text": 'Write link text that names the destination; avoid "click here"/"read more".',
  "positive tabindex": 'Use tabindex="0" (or -1); positive values override the natural focus order.',
  "aria-hidden on focusable": "Remove aria-hidden from focusable elements, or take them out of the tab order too.",
  "onMouseOver without onFocus": "Pair onMouseOver with onFocus so keyboard users get the same affordance.",
  "onMouseOut without onBlur": "Pair onMouseOut with onBlur so keyboard users get the same affordance.",
  "div as button": "Replace the div with a native <button>; it brings focus, key handling, and semantics for free.",
  "div as nav/header class": "Use the semantic <nav>/<header> element instead of a classed div so landmarks exist.",
  "autoplay media": "Avoid autoplay; if unavoidable, autoplay muted with visible controls.",
  "outline none": "Keep a visible focus indicator \u2014 style :focus-visible instead of removing the outline.",
  "v-on:click without keyboard": "Add @keydown.enter/@keydown.space handling, or use a <button>.",
  "on:click without on:keydown": "Add on:keydown handling, or use a <button>.",
  "(click) without (keydown)": "Add a (keydown) handler, or use a <button>.",
  "clickable without Role": "Pass role = Role.Button (or use Modifier.semantics) so TalkBack announces the control.",
  "nested touchables": "Flatten nested touchables; keep one interactive wrapper per control.",
  // Common moderates
  "hardcodedColor": "Use semantic colors (.primary, .secondary, or an asset-catalog color) that adapt to dark mode.",
  "hardcodedRGBColor": "Move the color into an asset catalog with light/dark variants.",
  "hardcodedUIColor": "Use a semantic UIColor (label, systemBackground) or an asset-catalog color.",
  "NavigationView (deprecated)": "Migrate to NavigationStack (single column) or NavigationSplitView (sidebar layouts).",
  "onTapGesture without traits": "Prefer Button, or add .accessibilityAddTraits(.isButton) so VoiceOver announces it.",
  // UIKit
  "hardcoded UIColor constant": "Use a semantic UIColor (.label, .systemBackground, .tintColor) that adapts to appearance.",
  "hardcoded UIFont(name:)": "Scale custom fonts with UIFontMetrics, or use preferredFont(forTextStyle:).",
  "viewWithTag lookup": "Reference views by outlet or property; tag-based lookup is fragile and breaks with view reordering.",
  "UIScreen.main.bounds for layout": "Lay out against the view's bounds or safeAreaLayoutGuide; UIScreen.main ignores Split View and Slide Over.",
  "UIAlertView (deprecated)": "Use UIAlertController with a .alert style.",
  "UIActionSheet (deprecated)": "Use UIAlertController with an .actionSheet style.",
  "UIWebView (deprecated)": "Use WKWebView.",
  "UISearchDisplayController (deprecated)": "Use UISearchController.",
  "setStatusBarStyle (deprecated)": "Override preferredStatusBarStyle on the view controller instead.",
  // AppKit
  "hardcoded NSColor(red:)": "Use a semantic NSColor (.labelColor, .controlAccentColor) or a Color Set asset with light/dark variants.",
  "hardcoded NSColor constant": "Use a semantic NSColor (.labelColor, .windowBackgroundColor) that adapts to appearance and accent color.",
  "hardcoded NSFont size": "Use NSFont.preferredFont(forTextStyle:) so text respects the user's size settings.",
  "NSMenuItem setSubmenu (deprecated)": "Set the item's submenu property directly."
};
function fixGuidance(rule) {
  return rule.fix ?? FIX_GUIDANCE[rule.pattern] ?? null;
}
function toMeta(rule) {
  return {
    id: rule.id,
    framework: rule.framework,
    category: rule.category,
    subcategory: rule.subcategory,
    type: rule.type,
    label: rule.pattern,
    severity: rule.type === "concern" ? severityFor(rule.pattern) : null,
    engine: rule.engine,
    hig: higCitation(rule),
    fix: fixGuidance(rule)
  };
}
function ruleCatalog() {
  return allRules.map(toMeta);
}
function getRuleById(id) {
  const rule = allRules.find((r) => r.id === id);
  return rule ? toMeta(rule) : void 0;
}
function stripComments(line, state, lineComments) {
  let out = "";
  let str = null;
  const n = line.length;
  let i = 0;
  while (i < n) {
    const c = line[i];
    const c2 = i + 1 < n ? line[i + 1] : "";
    if (state.inBlock) {
      if (c === "*" && c2 === "/") {
        state.inBlock = false;
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    if (state.inHtml) {
      if (c === "-" && c2 === "-" && line[i + 2] === ">") {
        state.inHtml = false;
        i += 3;
      } else {
        i++;
      }
      continue;
    }
    if (str !== null) {
      out += c;
      if (c === "\\" && i + 1 < n) {
        out += c2;
        i += 2;
        continue;
      }
      if (c === str) str = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      str = c;
      out += c;
      i++;
      continue;
    }
    if (c === "/" && c2 === "*") {
      state.inBlock = true;
      i += 2;
      continue;
    }
    if (lineComments && c === "/" && c2 === "/") break;
    if (c === "<" && c2 === "!" && line[i + 2] === "-" && line[i + 3] === "-") {
      state.inHtml = true;
      i += 4;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}
function parseSuppression(line) {
  const m = line.match(/hig-disable-(next-line|file)\b(.*)$/);
  if (!m) return null;
  const ids = [];
  for (const token of (m[2] ?? "").trim().split(/\s+/)) {
    if (token === "" || token === "--") break;
    if (!/^[a-z0-9/*-]+$/.test(token) || !token.includes("/")) break;
    ids.push(token);
  }
  return { kind: m[1], ids: ids.length > 0 ? ids : "all" };
}
function suppressionCovers(ids, ruleId) {
  if (ids === "all") return true;
  return ids.some(
    (id) => id.endsWith("*") ? ruleId.startsWith(id.slice(0, -1)) : ruleId === id
  );
}
function detectPatterns(code, file) {
  const matches = [];
  const rawLines = code.split("\n");
  let fileSuppression = null;
  const lineSuppressions = /* @__PURE__ */ new Map();
  for (let i = 0; i < rawLines.length; i++) {
    if (!rawLines[i].includes("hig-disable-")) continue;
    const sup = parseSuppression(rawLines[i]);
    if (!sup) continue;
    if (sup.kind === "file") {
      fileSuppression = fileSuppression === "all" || sup.ids === "all" ? "all" : [...fileSuppression ?? [], ...sup.ids];
    } else {
      const existing = lineSuppressions.get(i + 2);
      lineSuppressions.set(
        i + 2,
        existing === "all" || sup.ids === "all" ? "all" : [...existing ?? [], ...sup.ids]
      );
    }
  }
  const isSuppressed = (ruleId, line) => {
    if (fileSuppression && suppressionCovers(fileSuppression, ruleId)) return true;
    const forLine = lineSuppressions.get(line);
    return forLine !== void 0 && suppressionCovers(forLine, ruleId);
  };
  const isStyleFile = /\.(css|scss|sass|less)$/.test(file);
  const allowLineComments = !/\.(css|html?|xml|storyboard|xib)$/i.test(file);
  const commentState = { inBlock: false, inHtml: false };
  const lines = rawLines.map((l) => stripComments(l, commentState, allowLineComments));
  const applicable = allRules.filter((r) => !r.fileFilter || r.fileFilter.test(file));
  const lineRules = applicable.filter((r) => r.scope !== "document");
  const docRules = applicable.filter((r) => r.scope === "document");
  const blockContext = [];
  let braceDepth = 0;
  const blockStartDepth = [];
  for (let i = 0; i < lines.length; i++) {
    const scanLine = lines[i];
    if (isStyleFile) {
      const opensBlock = scanLine.includes("{");
      const closesBlock = scanLine.includes("}");
      if (opensBlock) {
        let contextLines = scanLine;
        for (let j = Math.max(0, i - 3); j < i; j++) {
          if (!lines[j].includes("}") && !lines[j].includes("{")) {
            contextLines = `${lines[j]} ${contextLines}`;
          }
        }
        blockContext.push(contextLines);
        blockStartDepth.push(braceDepth);
        braceDepth++;
      }
      if (closesBlock) {
        braceDepth = Math.max(0, braceDepth - 1);
        while (blockStartDepth.length > 0 && blockStartDepth[blockStartDepth.length - 1] >= braceDepth) {
          blockStartDepth.pop();
          blockContext.pop();
        }
      }
    }
    for (const rule of lineRules) {
      if (rule.regex.test(scanLine)) {
        const skipInBlock = rule.skipInBlock;
        if (skipInBlock && isStyleFile) {
          const inSkippedBlock = blockContext.some((ctx) => skipInBlock.test(ctx));
          if (inSkippedBlock) continue;
        }
        if (isSuppressed(rule.id, i + 1)) continue;
        matches.push({
          ruleId: rule.id,
          engine: "regex",
          category: rule.category,
          subcategory: rule.subcategory,
          type: rule.type,
          pattern: rule.pattern,
          line: i + 1,
          lineContent: rawLines[i].trim(),
          file,
          severity: rule.type === "concern" ? severityFor(rule.pattern) : void 0
        });
      }
    }
  }
  if (docRules.length > 0) {
    const stripped = lines.join("\n");
    const lineStarts = [0];
    for (let k = 0; k < stripped.length; k++) {
      if (stripped[k] === "\n") lineStarts.push(k + 1);
    }
    const lineNumberAt = (index) => {
      let lo = 0;
      let hi = lineStarts.length - 1;
      while (lo < hi) {
        const mid = lo + hi + 1 >> 1;
        if (lineStarts[mid] <= index) lo = mid;
        else hi = mid - 1;
      }
      return lo + 1;
    };
    for (const rule of docRules) {
      if (rule.requireAbsent && rule.requireAbsent.test(stripped)) continue;
      const flags = rule.regex.flags.includes("g") ? rule.regex.flags : rule.regex.flags + "g";
      const re = new RegExp(rule.regex.source, flags);
      let m;
      while ((m = re.exec(stripped)) !== null) {
        const lineNo = lineNumberAt(m.index);
        if (isSuppressed(rule.id, lineNo)) {
          if (rule.requireAbsent) break;
          if (m.index === re.lastIndex) re.lastIndex++;
          continue;
        }
        matches.push({
          ruleId: rule.id,
          engine: "regex",
          category: rule.category,
          subcategory: rule.subcategory,
          type: rule.type,
          pattern: rule.pattern,
          line: lineNo,
          lineContent: (rawLines[lineNo - 1] ?? "").trim(),
          file,
          severity: rule.type === "concern" ? severityFor(rule.pattern) : void 0
        });
        if (rule.requireAbsent) break;
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }
    matches.sort((a, b) => a.line - b.line);
  }
  return matches;
}
var RULE_COUNT = allRules.length;

// src/engines/swift-structural.ts
var A11Y_MODIFIERS = [
  "accessibilityLabel",
  "accessibilityHidden",
  "accessibilityHint",
  "accessibilityValue",
  "accessibilityElement",
  "accessibilityRepresentation",
  "accessibilityAddTraits",
  "accessibilityLabeledPair"
];
function stripSwift(code) {
  let out = "";
  let i = 0;
  const n = code.length;
  let inBlock = false;
  let inString = false;
  while (i < n) {
    const c = code[i];
    const c2 = i + 1 < n ? code[i + 1] : "";
    if (inBlock) {
      if (c === "*" && c2 === "/") {
        inBlock = false;
        i += 2;
      } else {
        i++;
      }
      continue;
    }
    if (inString) {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === '"') {
        inString = false;
        out += '"';
        i++;
        continue;
      }
      i++;
      continue;
    }
    if (c === "/" && c2 === "*") {
      inBlock = true;
      i += 2;
      continue;
    }
    if (c === "/" && c2 === "/") {
      while (i < n && code[i] !== "\n") i++;
      continue;
    }
    if (c === '"') {
      inString = true;
      out += '"';
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}
function chainedModifiers(stripped, from) {
  const mods = [];
  let i = from;
  const n = stripped.length;
  const skipWs = () => {
    while (i < n && /\s/.test(stripped[i])) i++;
  };
  const skipGroup = (open, close) => {
    let depth = 0;
    for (; i < n; i++) {
      const ch = stripped[i];
      if (ch === open) depth++;
      else if (ch === close) {
        depth--;
        if (depth === 0) {
          i++;
          return;
        }
      }
    }
  };
  skipWs();
  if (stripped[i] === "(") skipGroup("(", ")");
  while (true) {
    skipWs();
    if (stripped[i] !== ".") break;
    i++;
    skipWs();
    let id = "";
    while (i < n && /[A-Za-z0-9_]/.test(stripped[i])) {
      id += stripped[i];
      i++;
    }
    if (id === "") break;
    mods.push(id);
    skipWs();
    if (stripped[i] === "(") skipGroup("(", ")");
    skipWs();
    if (stripped[i] === "{") skipGroup("{", "}");
  }
  return mods;
}
function lineAt(stripped, index) {
  let line = 1;
  for (let i = 0; i < index && i < stripped.length; i++) {
    if (stripped[i] === "\n") line++;
  }
  return line;
}
function refineSwift(matches, code) {
  const swiftRefined = /* @__PURE__ */ new Set(["Image without a11y", "onTapGesture without traits"]);
  if (!matches.some((m) => swiftRefined.has(m.pattern))) return matches;
  const stripped = stripSwift(code);
  const handledImageLines = /* @__PURE__ */ new Set();
  const handledTapLines = /* @__PURE__ */ new Set();
  for (const m of stripped.matchAll(/\bImage\s*\(\s*systemName:/g)) {
    const idx = m.index ?? 0;
    const parenIdx = stripped.indexOf("(", idx);
    const mods = chainedModifiers(stripped, parenIdx);
    if (mods.some((mod) => A11Y_MODIFIERS.includes(mod))) {
      handledImageLines.add(lineAt(stripped, idx));
    }
  }
  for (const m of stripped.matchAll(/\.onTapGesture\s*\{/g)) {
    const idx = m.index ?? 0;
    const braceIdx = stripped.indexOf("{", idx);
    let j = braceIdx;
    let depth = 0;
    for (; j < stripped.length; j++) {
      if (stripped[j] === "{") depth++;
      else if (stripped[j] === "}") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    const after = chainedModifiers(stripped, j);
    if (after.some((mod) => A11Y_MODIFIERS.includes(mod))) {
      handledTapLines.add(lineAt(stripped, idx));
    }
  }
  const out = [];
  for (const match of matches) {
    if (match.pattern === "Image without a11y") {
      if (handledImageLines.has(match.line)) continue;
      out.push({ ...match, engine: "swift-structural" });
    } else if (match.pattern === "onTapGesture without traits") {
      if (handledTapLines.has(match.line)) continue;
      out.push({ ...match, engine: "swift-structural" });
    } else {
      out.push(match);
    }
  }
  return out;
}

// src/engines/ast-tsx.ts
import { createRequire } from "node:module";
var AST_TSX_RULES = /* @__PURE__ */ new Set([
  "web/missing-alt",
  "web/image-without-alt",
  "web/div-with-on-click-no-role",
  "web/span-with-on-click-no-role",
  "web/positive-tabindex"
]);
var tsModule;
function loadTs() {
  if (tsModule !== void 0) return tsModule;
  try {
    tsModule = createRequire(import.meta.url)("typescript");
  } catch {
    tsModule = null;
  }
  return tsModule;
}
function astTsxAvailable() {
  return loadTs() != null;
}
function isTsxFile(file) {
  return /\.(tsx|jsx)$/.test(file);
}
function push(findings, ruleId, ts, node, source) {
  const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
  const text = source.text.split("\n")[line] ?? "";
  findings.push({ ruleId, line: line + 1, lineContent: text.trim() });
}
function analyzeTsx(code, file) {
  if (!isTsxFile(file)) return null;
  const ts = loadTs();
  if (!ts) return null;
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings = [];
  const attrs = (opening) => {
    const names = /* @__PURE__ */ new Set();
    const byName = /* @__PURE__ */ new Map();
    let hasSpread = false;
    for (const prop of opening.attributes.properties) {
      if (ts.isJsxSpreadAttribute(prop)) {
        hasSpread = true;
        continue;
      }
      if (ts.isJsxAttribute(prop) && prop.name) {
        const name = prop.name.getText(source);
        names.add(name);
        byName.set(name, prop);
      }
    }
    return { names, hasSpread, byName };
  };
  const tagNameOf = (opening) => opening.tagName.getText(source);
  const attrIsTruthy = (attr) => {
    if (!attr.initializer) return true;
    if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text === "true";
    if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
      return attr.initializer.expression.kind === ts.SyntaxKind.TrueKeyword;
    }
    return false;
  };
  const positiveTabIndex = (attr) => {
    if (!attr.initializer) return false;
    let raw = null;
    if (ts.isStringLiteral(attr.initializer)) raw = attr.initializer.text;
    else if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
      const e = attr.initializer.expression;
      if (ts.isNumericLiteral(e)) raw = e.text;
      else if (ts.isPrefixUnaryExpression?.(e) && e.operator === ts.SyntaxKind.MinusToken) raw = "-1";
    }
    if (raw == null) return false;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0;
  };
  const visitOpening = (opening) => {
    const tag = tagNameOf(opening);
    const { names, hasSpread, byName } = attrs(opening);
    if ((tag === "img" || tag === "Image") && !hasSpread && !names.has("alt")) {
      push(findings, "web/missing-alt", ts, opening.parent ?? opening, source);
    }
    if ((tag === "div" || tag === "span") && names.has("onClick") && !hasSpread) {
      const interactive = names.has("role") || names.has("tabIndex") || names.has("onKeyDown") || names.has("onKeyPress") || names.has("onKeyUp");
      if (!interactive) {
        const ruleId = tag === "div" ? "web/div-with-on-click-no-role" : "web/span-with-on-click-no-role";
        push(findings, ruleId, ts, opening.parent ?? opening, source);
      }
    }
    const tabIndexAttr = byName.get("tabIndex");
    if (tabIndexAttr && positiveTabIndex(tabIndexAttr)) {
      push(findings, "web/positive-tabindex", ts, opening.parent ?? opening, source);
    }
    void attrIsTruthy;
  };
  const walk = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      visitOpening(node);
    }
    ts.forEachChild(node, walk);
  };
  walk(source);
  return findings.map((f) => {
    const meta = getRuleById(f.ruleId);
    return {
      ruleId: f.ruleId,
      engine: "ast-tsx",
      category: meta?.category ?? "foundations",
      subcategory: meta?.subcategory ?? "accessibility",
      type: "concern",
      pattern: meta?.label ?? f.ruleId,
      line: f.line,
      lineContent: f.lineContent,
      file,
      severity: meta?.severity ?? "moderate"
    };
  });
}

// src/analyze.ts
function analyzeFile(code, file) {
  let matches = detectPatterns(code, file);
  if (/\.swift$/.test(file)) {
    matches = refineSwift(matches, code);
  }
  const ast = analyzeTsx(code, file);
  if (ast !== null) {
    matches = matches.filter((m) => !AST_TSX_RULES.has(m.ruleId));
    matches.push(...ast);
    matches.sort((a, b) => a.line - b.line);
  }
  return matches;
}

// src/categorizer.ts
var CATEGORY_TO_SKILL = {
  "foundations": "hig-foundations",
  "components-layout": "hig-components-layout",
  "components-selection": "hig-components-selection",
  "components-actions": "hig-components-actions",
  "components-presentation": "hig-components-presentation",
  "components-textinput": "hig-components-textinput",
  "components-media": "hig-components-media",
  "components-controls": "hig-components-controls",
  "components-menus": "hig-components-menus",
  "components-dialogs": "hig-components-dialogs",
  "components-search": "hig-components-search",
  "components-status": "hig-components-status",
  "components-content": "hig-components-content",
  "components-system": "hig-components-system",
  "patterns": "hig-patterns",
  "platforms": "hig-platforms",
  "technologies": "hig-technologies",
  "inputs": "hig-inputs"
};
var CATEGORY_LABELS = {
  "hig-foundations": "Foundations",
  "hig-components-layout": "Layout & Navigation",
  "hig-components-selection": "Selection Controls",
  "hig-components-actions": "Actions",
  "hig-components-presentation": "Presentation",
  "hig-components-textinput": "Text Input",
  "hig-components-media": "Media",
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
  "hig-platforms": "Platform Adaptation"
};
function categorizeMatches(matches) {
  if (matches.length === 0) return [];
  const grouped = /* @__PURE__ */ new Map();
  for (const match of matches) {
    const skillName = CATEGORY_TO_SKILL[match.category] || `hig-${match.category}`;
    if (!grouped.has(skillName)) {
      grouped.set(skillName, []);
    }
    grouped.get(skillName).push(match);
  }
  const categories = [];
  for (const [skillName, skillMatches] of grouped) {
    const files = [...new Set(skillMatches.map((m) => m.file))];
    const concerns = skillMatches.filter((m) => m.type === "concern");
    categories.push({
      skillName,
      category: skillMatches[0].category,
      label: CATEGORY_LABELS[skillName] ?? skillName,
      matches: skillMatches,
      concerns: concerns.length,
      positives: skillMatches.filter((m) => m.type === "positive").length,
      patterns: skillMatches.filter((m) => m.type === "pattern").length,
      critical: concerns.filter((m) => m.severity === "critical").length,
      serious: concerns.filter((m) => m.severity === "serious").length,
      moderate: concerns.filter((m) => m.severity === "moderate").length,
      fileCount: files.length,
      files
    });
  }
  categories.sort((a, b) => b.matches.length - a.matches.length);
  return categories;
}

// src/audit-generator.ts
import { readFile as readFile2 } from "node:fs/promises";
import { join as join2 } from "node:path";
function formatDate() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function langForFile(file) {
  if (file.endsWith(".swift")) return "swift";
  if (file.endsWith(".tsx") || file.endsWith(".jsx")) return "tsx";
  if (file.endsWith(".ts") || file.endsWith(".js")) return "typescript";
  if (file.endsWith(".css") || file.endsWith(".scss")) return "css";
  if (file.endsWith(".html") || file.endsWith(".htm")) return "html";
  if (file.endsWith(".dart")) return "dart";
  if (file.endsWith(".kt")) return "kotlin";
  return "";
}
function commentPrefix(file) {
  if (file.endsWith(".css") || file.endsWith(".scss")) return "/* ";
  return "// ";
}
function commentSuffix(file) {
  if (file.endsWith(".css") || file.endsWith(".scss")) return " */";
  return "";
}
function escapeMarkdownText(value) {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\\/g, "\\\\").replace(/([`*_{}\[\]()#+.!|-])/g, "\\$1");
}
function longestRun(value, char) {
  let longest = 0;
  let current = 0;
  for (const c of value) {
    if (c === char) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}
function fenceFor(matches) {
  const longestTildeRun = matches.reduce(
    (max, match) => Math.max(max, longestRun(match.lineContent, "~")),
    0
  );
  return "~".repeat(Math.max(3, longestTildeRun + 1));
}
function sanitizeExcerptLine(value) {
  return value.replace(/[\r\n\t]+/g, " ");
}
function renderExcerpts(category) {
  const lines = [];
  const byFile = /* @__PURE__ */ new Map();
  for (const m of category.matches) {
    if (!byFile.has(m.file)) byFile.set(m.file, []);
    byFile.get(m.file).push(m);
  }
  for (const [file, matches] of byFile) {
    const lang = langForFile(file);
    const cp = commentPrefix(file);
    const cs = commentSuffix(file);
    const fence = fenceFor(matches);
    lines.push(`**${escapeMarkdownText(file)}**`);
    lines.push(`${fence}${lang}`);
    for (const m of matches.slice(0, 15)) {
      const tag = m.type === "concern" ? ` ${cp}\u26A0 concern${cs}` : m.type === "positive" ? ` ${cp}\u2713 good${cs}` : "";
      lines.push(`L${m.line}: ${sanitizeExcerptLine(m.lineContent)}${tag}`);
    }
    if (matches.length > 15) {
      lines.push(`${cp}... and ${matches.length - 15} more matches${cs}`);
    }
    lines.push(fence);
    lines.push("");
  }
  return lines.join("\n");
}
async function loadSkillContent(skillsDir, skillName) {
  try {
    const skillPath = join2(skillsDir, skillName, "SKILL.md");
    const content = await readFile2(skillPath, "utf-8");
    const stripped = content.replace(/^---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/, "");
    const principlesMatch = stripped.match(/## Key Principles\n([\s\S]*?)(?=\n## |$)/);
    return principlesMatch ? principlesMatch[1].trim() : stripped.slice(0, 2e3);
  } catch {
    return null;
  }
}
function generateAuditMarkdown(scanResult, categories, skillsDir, skillContents) {
  const lines = [];
  const appName = scanResult.directory.split("/").pop() || "App";
  lines.push(`# HIG Audit: ${appName}`);
  lines.push("");
  lines.push(`**Generated**: ${formatDate()}`);
  lines.push(`**Project**: ${scanResult.directory}`);
  lines.push(`**Frameworks detected**: ${scanResult.frameworks.join(", ")}`);
  const fileCounts = [
    `${scanResult.codeFiles.length} code`,
    `${scanResult.styleFiles.length} style`,
    `${scanResult.configFiles.length} config`
  ].join(", ");
  lines.push(`**Files scanned**: ${fileCounts}`);
  lines.push("");
  const totalConcerns = categories.reduce((s, c) => s + c.concerns, 0);
  const totalPositives = categories.reduce((s, c) => s + c.positives, 0);
  const totalPatterns = categories.reduce((s, c) => s + c.patterns, 0);
  lines.push(`**Quick stats**: ${totalConcerns} potential concerns, ${totalPositives} positive patterns, ${totalPatterns} component usages detected across ${categories.length} HIG categories`);
  lines.push("");
  lines.push("## Instructions for AI Evaluator");
  lines.push("");
  lines.push("You are reviewing a project for Apple Human Interface Guidelines compliance.");
  lines.push("The HIG principles (accessibility, color systems, typography, responsive layout, motion) apply to all surfaces \u2014 native, web, and cross-platform.");
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
  for (const category of categories) {
    lines.push(`## Category: ${category.label}`);
    lines.push("");
    lines.push(`*${category.matches.length} detections across ${category.fileCount} file(s) \u2014 ${category.concerns} concern(s), ${category.positives} positive(s)*`);
    lines.push("");
    lines.push("### Code Excerpts");
    lines.push("");
    if (category.matches.length > 0) {
      lines.push(renderExcerpts(category));
    } else {
      lines.push("*No patterns detected for this category.*");
      lines.push("");
    }
    lines.push("### HIG Reference");
    lines.push("");
    const content = skillContents?.get(category.skillName);
    if (content) {
      lines.push(content);
    } else {
      lines.push(`*Load reference from skill: ${category.skillName}*`);
    }
    lines.push("");
    lines.push("### Evaluate");
    lines.push("");
    const checks = getEvaluationChecklist(category.skillName);
    for (const check of checks) {
      lines.push(`- ${check}`);
    }
    lines.push("");
  }
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
function getEvaluationChecklist(skillName) {
  const checklists = {
    "hig-foundations": [
      "Color usage: system semantic colors vs hardcoded values",
      "Typography: Dynamic Type text styles vs fixed font sizes",
      "Accessibility: labels, hints, traits on interactive elements",
      "Dark mode: proper color adaptation, no hardcoded light/dark values",
      "Motion: Reduce Motion support for animations"
    ],
    "hig-components-layout": [
      "Navigation pattern matches app structure (tabs for flat, sidebar for deep)",
      "Adaptive layout: responds to size classes, multitasking",
      "Standard navigation components (NavigationSplitView, not deprecated NavigationView)",
      "Consistent back navigation and spatial hierarchy"
    ],
    "hig-components-controls": [
      "Standard control usage (Button, Toggle, Picker, etc.)",
      "Proper button styles and roles",
      "Clear action labels and consistent interaction patterns"
    ],
    "hig-components-selection": [
      "Appropriate picker and selection controls",
      "Clear selection state feedback"
    ],
    "hig-components-actions": [
      "Button hierarchy and prominence",
      "Destructive actions clearly marked",
      "Swipe actions follow HIG conventions"
    ],
    "hig-components-presentation": [
      "Sheets for focused tasks, popovers for contextual info",
      "Alerts used sparingly for important decisions",
      "Confirmation dialogs for destructive actions"
    ],
    "hig-components-textinput": [
      "Text fields use appropriate keyboard types",
      "Search functionality uses .searchable where appropriate"
    ],
    "hig-components-media": [
      "Image handling with proper async loading",
      "Media playback uses system controls"
    ],
    "hig-components-menus": [
      "Context menus provide relevant actions",
      "Menu organization follows HIG grouping conventions"
    ],
    "hig-components-dialogs": [
      "Alerts used sparingly for important decisions",
      "Sheets for focused tasks, popovers for contextual info",
      "Confirmation dialogs for destructive actions"
    ],
    "hig-components-search": [
      "Searchable modifier used for filterable content",
      "Search suggestions and scopes where appropriate"
    ],
    "hig-components-status": [
      "Progress indicators for long operations",
      "Appropriate use of determinate vs indeterminate progress"
    ],
    "hig-components-content": [
      "Content display uses appropriate containers",
      "Image handling with proper async loading"
    ],
    "hig-components-system": [
      "System integration uses standard APIs (ShareLink, PhotosPicker)",
      "Deep link handling, widget support where relevant"
    ],
    "hig-patterns": [
      "Drag and drop support where appropriate",
      "Pull-to-refresh for refreshable content",
      "Swipe actions follow HIG conventions",
      "Undo support for destructive actions"
    ],
    "hig-inputs": [
      "Text input uses appropriate field types",
      "Keyboard shortcuts for power users (macOS/iPad)",
      "Gesture usage follows platform conventions"
    ],
    "hig-technologies": [
      "Apple framework integration follows HIG for that technology",
      "Proper permission handling and progressive disclosure"
    ],
    "hig-platforms": [
      "UI adapts appropriately across target platforms",
      "Platform idioms respected (iPhone vs iPad vs Mac)"
    ]
  };
  return checklists[skillName] ?? ["Evaluate against Apple HIG best practices for this category"];
}

// src/config.ts
import { readFile as readFile3 } from "node:fs/promises";
import { isAbsolute, join as join3, resolve } from "node:path";
var CONFIG_FILENAME = "hig-doctor.config.json";
var VALID_SETTINGS = /* @__PURE__ */ new Set(["off", "on", "critical", "serious", "moderate"]);
function validateRules(rules, where, warnings) {
  if (rules == null) return {};
  if (typeof rules !== "object" || Array.isArray(rules)) {
    throw new Error(`${where}: "rules" must be an object mapping rule IDs to settings`);
  }
  const out = {};
  for (const [id, setting] of Object.entries(rules)) {
    if (typeof setting !== "string" || !VALID_SETTINGS.has(setting)) {
      throw new Error(
        `${where}: invalid setting ${JSON.stringify(setting)} for rule "${id}" \u2014 expected "off", "on", "critical", "serious", or "moderate"`
      );
    }
    if (!id.includes("*") && !getRuleById(id)) {
      warnings.push(`${where}: unknown rule ID "${id}" (see docs/rules.md)`);
    }
    out[id] = setting;
  }
  return out;
}
function parseConfig(raw, sourcePath) {
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${sourcePath} is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (json == null || typeof json !== "object" || Array.isArray(json)) {
    throw new Error(`${sourcePath}: config must be a JSON object`);
  }
  const obj = json;
  const warnings = [];
  const config = {};
  config.rules = validateRules(obj.rules, sourcePath, warnings);
  if (obj.ignore != null) {
    if (!Array.isArray(obj.ignore) || obj.ignore.some((g) => typeof g !== "string")) {
      throw new Error(`${sourcePath}: "ignore" must be an array of glob strings`);
    }
    config.ignore = obj.ignore;
  }
  if (obj.overrides != null) {
    if (!Array.isArray(obj.overrides)) {
      throw new Error(`${sourcePath}: "overrides" must be an array`);
    }
    config.overrides = obj.overrides.map((entry, i) => {
      const where = `${sourcePath} overrides[${i}]`;
      if (entry == null || typeof entry !== "object" || Array.isArray(entry)) {
        throw new Error(`${where}: must be an object with "files" and "rules"`);
      }
      const o = entry;
      if (!Array.isArray(o.files) || o.files.length === 0 || o.files.some((g) => typeof g !== "string")) {
        throw new Error(`${where}: "files" must be a non-empty array of glob strings`);
      }
      return { files: o.files, rules: validateRules(o.rules, where, warnings) };
    });
  }
  return { config, warnings };
}
async function loadConfig(directory, explicitPath) {
  const path = explicitPath ? isAbsolute(explicitPath) ? explicitPath : resolve(explicitPath) : join3(resolve(directory), CONFIG_FILENAME);
  let raw;
  try {
    raw = await readFile3(path, "utf-8");
  } catch {
    if (explicitPath) throw new Error(`Config file not found: ${path}`);
    return { path: null, config: {}, warnings: [] };
  }
  const { config, warnings } = parseConfig(raw, path);
  return { path, config, warnings };
}
function settingFor(ruleId, rules) {
  if (!rules) return null;
  if (ruleId in rules) return rules[ruleId];
  let best = null;
  for (const [key, setting] of Object.entries(rules)) {
    if (!key.endsWith("*")) continue;
    const prefix = key.slice(0, -1);
    if (ruleId.startsWith(prefix) && (!best || prefix.length > best.len)) {
      best = { len: prefix.length, setting };
    }
  }
  return best?.setting ?? null;
}
function applyConfig(matches, config) {
  const hasRules = config.rules && Object.keys(config.rules).length > 0;
  const overrides = (config.overrides ?? []).map((o) => ({
    files: o.files.map(globToRegExp),
    rules: o.rules
  }));
  if (!hasRules && overrides.length === 0) return matches;
  const out = [];
  for (const match of matches) {
    let setting = settingFor(match.ruleId, config.rules);
    for (const override of overrides) {
      if (override.files.some((re) => re.test(match.file))) {
        const s = settingFor(match.ruleId, override.rules);
        if (s !== null) setting = s;
      }
    }
    if (setting === "off") continue;
    if (setting && setting !== "on" && match.type === "concern") {
      out.push({ ...match, severity: setting });
    } else {
      out.push(match);
    }
  }
  return out;
}

// src/baseline.ts
import { readFile as readFile4, writeFile } from "node:fs/promises";
import { isAbsolute as isAbsolute2, join as join4, resolve as resolve2 } from "node:path";
var BASELINE_FILENAME = ".hig-baseline.json";
function baselineKey(match) {
  const content = match.lineContent.replace(/\s+/g, " ").trim();
  return `${match.ruleId}\0${match.file}\0${content}`;
}
function createBaseline(matches, generated) {
  const findings = {};
  for (const match of matches) {
    if (match.type !== "concern") continue;
    const key = baselineKey(match);
    findings[key] = (findings[key] ?? 0) + 1;
  }
  return { version: 1, generated, findings };
}
function applyBaseline(matches, baseline) {
  const remaining = new Map(Object.entries(baseline.findings));
  const kept = [];
  let baselined = 0;
  for (const match of matches) {
    if (match.type === "concern") {
      const key = baselineKey(match);
      const left = remaining.get(key) ?? 0;
      if (left > 0) {
        remaining.set(key, left - 1);
        baselined++;
        continue;
      }
    }
    kept.push(match);
  }
  let stale = 0;
  for (const left of remaining.values()) stale += left;
  return { kept, baselined, stale };
}
function parseBaseline(raw, sourcePath) {
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${sourcePath} is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
  const obj = json;
  if (obj == null || obj.version !== 1 || typeof obj.findings !== "object" || obj.findings == null) {
    throw new Error(`${sourcePath}: not a hig-doctor baseline (expected {version: 1, findings: {...}})`);
  }
  for (const [key, count] of Object.entries(obj.findings)) {
    if (typeof count !== "number" || count < 0 || !Number.isInteger(count)) {
      throw new Error(`${sourcePath}: invalid count for ${JSON.stringify(key)}`);
    }
  }
  return { version: 1, generated: typeof obj.generated === "string" ? obj.generated : "", findings: obj.findings };
}
async function loadBaseline(directory, explicitPath) {
  const path = explicitPath ? isAbsolute2(explicitPath) ? explicitPath : resolve2(explicitPath) : join4(resolve2(directory), BASELINE_FILENAME);
  let raw;
  try {
    raw = await readFile4(path, "utf-8");
  } catch {
    if (explicitPath) throw new Error(`Baseline file not found: ${path}`);
    return null;
  }
  return { path, baseline: parseBaseline(raw, path) };
}
async function writeBaseline(path, baseline) {
  await writeFile(path, JSON.stringify(baseline, null, 2) + "\n");
}

// src/cache.ts
import { createHash } from "node:crypto";
import { readFile as readFile5, writeFile as writeFile2 } from "node:fs/promises";
var CACHE_VERSION = 2;
var CACHE_FILENAME = ".hig-cache.json";
function namespace() {
  return `v${CACHE_VERSION}.rules${RULE_COUNT}`;
}
function keyFor(path, content) {
  return createHash("sha256").update(path).update("\0").update(content).digest("hex").slice(0, 24);
}
var ScanCache = class _ScanCache {
  entries;
  hits = 0;
  misses = 0;
  constructor(entries) {
    this.entries = entries;
  }
  static async load(path) {
    try {
      const raw = await readFile5(path, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.namespace === namespace() && parsed.entries) {
        return new _ScanCache(new Map(Object.entries(parsed.entries)));
      }
    } catch {
    }
    return new _ScanCache(/* @__PURE__ */ new Map());
  }
  /** Return cached findings for this file, or null on a miss. */
  get(path, content) {
    const hit = this.entries.get(keyFor(path, content));
    if (hit) {
      this.hits++;
      return hit;
    }
    this.misses++;
    return null;
  }
  set(path, content, matches) {
    this.entries.set(keyFor(path, content), matches);
  }
  get stats() {
    return { hits: this.hits, misses: this.misses };
  }
  /** Persist only the keys touched this run, so deleted files don't accumulate. */
  async save(path, touched) {
    const entries = {};
    for (const [k, v] of this.entries) {
      if (touched.has(k)) entries[k] = v;
    }
    const file = { namespace: namespace(), entries };
    await writeFile2(path, JSON.stringify(file));
  }
  keyOf(path, content) {
    return keyFor(path, content);
  }
};

// src/audit.ts
import { resolve as resolve3, join as join5 } from "node:path";
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
var moduleDir = fileURLToPath(new URL(".", import.meta.url));
async function audit(directory, skillsDir, options = {}) {
  const resolvedDir = resolve3(directory);
  const loaded = options.noConfig ? { path: null, config: {}, warnings: [] } : await loadConfig(resolvedDir, options.configPath);
  const exclude = [...loaded.config.ignore ?? [], ...options.exclude ?? []];
  const scanResult = await scanProject(resolvedDir, { exclude });
  const detected = [];
  const allFiles = [...scanResult.codeFiles, ...scanResult.styleFiles, ...scanResult.markupFiles];
  const cachePath = join5(resolvedDir, CACHE_FILENAME);
  const cache = options.cache ? await ScanCache.load(cachePath) : null;
  const touched = /* @__PURE__ */ new Set();
  for (const file of allFiles) {
    let matches = cache?.get(file.relativePath, file.content) ?? null;
    if (matches === null) {
      matches = analyzeFile(file.content, file.relativePath);
      cache?.set(file.relativePath, file.content, matches);
    }
    if (cache) touched.add(cache.keyOf(file.relativePath, file.content));
    detected.push(...matches);
  }
  if (cache) await cache.save(cachePath, touched);
  const configured = applyConfig(detected, loaded.config);
  let allMatches = configured;
  let baselinePath = null;
  let baselined = 0;
  let baselineStale = 0;
  if (!options.noBaseline) {
    const found = await loadBaseline(resolvedDir, options.baselinePath);
    if (found) {
      const applied = applyBaseline(configured, found.baseline);
      allMatches = applied.kept;
      baselinePath = found.path;
      baselined = applied.baselined;
      baselineStale = applied.stale;
    }
  }
  const categories = categorizeMatches(allMatches);
  let resolvedSkillsDir = null;
  const skillContents = /* @__PURE__ */ new Map();
  if (skillsDir) {
    resolvedSkillsDir = resolve3(skillsDir);
  } else {
    const candidates = [
      join5(resolvedDir, "skills"),
      join5(resolvedDir, "..", "skills"),
      join5(resolvedDir, "..", "..", "skills"),
      // Relative to this package (for development: packages/core/src → repo root)
      join5(moduleDir, "..", "..", "..", "skills")
    ];
    for (const candidate of candidates) {
      try {
        await access(candidate);
        resolvedSkillsDir = candidate;
        break;
      } catch {
      }
    }
  }
  if (resolvedSkillsDir) {
    for (const category of categories) {
      const content = await loadSkillContent(resolvedSkillsDir, category.skillName);
      if (content) skillContents.set(category.skillName, content);
    }
  }
  const markdown = generateAuditMarkdown(scanResult, categories, resolvedSkillsDir, skillContents);
  return {
    scanResult,
    allMatches,
    categories,
    markdown,
    configPath: loaded.path,
    configWarnings: loaded.warnings,
    baselinePath,
    baselined,
    baselineStale,
    cacheStats: cache ? cache.stats : null
  };
}

// src/sarif.ts
var SARIF_LEVEL = {
  critical: "error",
  serious: "warning",
  moderate: "note"
};
function toSarif(matches, options) {
  const concerns = matches.filter((m) => m.type === "concern");
  const ruleIndex = /* @__PURE__ */ new Map();
  const rules = [];
  for (const match of concerns) {
    if (ruleIndex.has(match.ruleId)) continue;
    const meta = getRuleById(match.ruleId);
    ruleIndex.set(match.ruleId, rules.length);
    rules.push({
      id: match.ruleId,
      name: meta?.label ?? match.pattern,
      shortDescription: { text: meta?.label ?? match.pattern },
      ...meta?.fix ? { fullDescription: { text: meta.fix } } : {},
      helpUri: meta?.hig,
      properties: {
        engine: meta?.engine ?? match.engine,
        category: match.category,
        subcategory: match.subcategory
      },
      defaultConfiguration: {
        level: SARIF_LEVEL[meta?.severity ?? match.severity ?? "moderate"]
      }
    });
  }
  const results = concerns.map((match) => {
    const meta = getRuleById(match.ruleId);
    const fix = meta?.fix ? ` Fix: ${meta.fix}` : "";
    const uri = match.file.replace(/\\/g, "/");
    const suggested = options.getFix?.(match) ?? null;
    return {
      ruleId: match.ruleId,
      ruleIndex: ruleIndex.get(match.ruleId),
      level: SARIF_LEVEL[match.severity ?? "moderate"],
      message: { text: `${match.pattern} (${match.category}/${match.subcategory}).${fix}` },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri, uriBaseId: "SRCROOT" },
            region: { startLine: match.line }
          }
        }
      ],
      partialFingerprints: {
        // Content-based, line-number-free — matches the baseline fingerprint so
        // code motion doesn't produce "new" alerts.
        higDoctorKey: `${match.ruleId} ${match.file} ${match.lineContent.replace(/\s+/g, " ").trim()}`
      },
      ...suggested ? {
        fixes: [
          {
            description: { text: `${suggested.description}${suggested.safe ? "" : " (review before applying)"}` },
            artifactChanges: [
              {
                artifactLocation: { uri, uriBaseId: "SRCROOT" },
                replacements: [
                  {
                    deletedRegion: { startLine: match.line, endLine: match.line },
                    insertedContent: { text: suggested.after }
                  }
                ]
              }
            ]
          }
        ]
      } : {}
    };
  });
  return {
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "hig-doctor",
            informationUri: "https://github.com/raintree-technology/hig-doctor",
            version: options.toolVersion,
            ...options.snapshotDate ? { properties: { higSnapshot: options.snapshotDate } } : {},
            rules
          }
        },
        originalUriBaseIds: {
          SRCROOT: { description: { text: "Root of the audited project" } }
        },
        results
      }
    ]
  };
}

// src/fixes.ts
function stripViewportToken(line, token) {
  if (!token.test(line)) return null;
  let out = line.replace(new RegExp(`\\s*,\\s*${token.source}`, "i"), "").replace(new RegExp(`${token.source}\\s*,\\s*`, "i"), "").replace(new RegExp(`\\s*${token.source}`, "i"), "");
  out = out.replace(/,\s*,/g, ", ").replace(/,\s*(["'])/g, "$1").replace(/=\s*,/g, "=");
  return out === line ? null : out;
}
var FIXERS = {
  "css/physical-text-align": {
    safe: true,
    description: "Use logical text-align (start/end) so text follows writing direction.",
    apply: (line) => {
      const fixed = line.replace(/text-align:\s*left\b/g, "text-align: start").replace(/text-align:\s*right\b/g, "text-align: end");
      return fixed === line ? null : fixed;
    }
  },
  "web/user-scalable-no": {
    safe: true,
    description: "Remove user-scalable=no so pinch-zoom keeps working.",
    apply: (line) => stripViewportToken(line, /user-scalable\s*=\s*no/)
  },
  "web/maximum-scale-1": {
    safe: true,
    description: "Remove maximum-scale=1 so users can zoom.",
    apply: (line) => stripViewportToken(line, /maximum-scale\s*=\s*1(?:\.0)?/)
  },
  "swift/navigation-view-deprecated": {
    // Unsafe: a NavigationView with a sidebar should become NavigationSplitView,
    // which a line-level transform can't tell apart. Suggest the common case.
    safe: false,
    description: "Replace NavigationView with NavigationStack (or NavigationSplitView for sidebar layouts).",
    apply: (line) => {
      const fixed = line.replace(/\bNavigationView\b/g, "NavigationStack");
      return fixed === line ? null : fixed;
    }
  },
  "web/positive-tabindex": {
    // Unsafe: dropping to 0 changes focus order; the author must confirm intent.
    safe: false,
    description: "Use tabIndex 0 (or -1); positive values override the natural focus order.",
    apply: (line) => {
      const fixed = line.replace(/tabIndex=\{\s*[1-9]\d*\s*\}/g, "tabIndex={0}").replace(/tabindex=(["'])[1-9]\d*\1/g, "tabindex=$10$1");
      return fixed === line ? null : fixed;
    }
  }
};
function isFixable(ruleId) {
  return ruleId in FIXERS;
}
function suggestFix(match, rawLine) {
  const fixer = FIXERS[match.ruleId];
  if (!fixer) return null;
  const after = fixer.apply(rawLine);
  if (after === null || after === rawLine) return null;
  return { ruleId: match.ruleId, line: match.line, before: rawLine, after, safe: fixer.safe, description: fixer.description };
}
function applyFixes(content, matches) {
  const lines = content.split("\n");
  const applied = [];
  const suggestions = [];
  const seen = /* @__PURE__ */ new Set();
  for (const match of matches) {
    const fixer = FIXERS[match.ruleId];
    if (!fixer) continue;
    const idx = match.line - 1;
    if (idx < 0 || idx >= lines.length) continue;
    const key = `${match.line}:${match.ruleId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const rawLine = lines[idx];
    const after = fixer.apply(rawLine);
    if (after === null || after === rawLine) continue;
    const fix = { ruleId: match.ruleId, line: match.line, before: rawLine, after, safe: fixer.safe, description: fixer.description };
    if (fixer.safe) {
      lines[idx] = after;
      applied.push(fix);
    } else {
      suggestions.push(fix);
    }
  }
  return { content: lines.join("\n"), applied, suggestions };
}

// src/benchmark.ts
var BENCHMARK_CASES = [
  // ── Swift / SwiftUI ────────────────────────────────────────────
  {
    id: "swift-color-bad",
    framework: "swift",
    file: "BadColors.swift",
    kind: "bad",
    code: `struct V: View {
  var body: some View {
    Text("Hi").foregroundColor(.red)
    Rectangle().foregroundColor(.blue)
  }
}`,
    expect: ["swift/hardcoded-color", "swift/hardcoded-color"]
  },
  {
    id: "swift-color-good",
    framework: "swift",
    file: "GoodColors.swift",
    kind: "good",
    code: `struct V: View {
  var body: some View {
    Text("Hi").foregroundStyle(.primary)
    Rectangle().foregroundColor(Color("BrandAccent"))
  }
}`,
    expect: []
  },
  {
    id: "swift-nav-bad",
    framework: "swift",
    file: "BadNav.swift",
    kind: "bad",
    code: `struct Root: View {
  var body: some View {
    NavigationView {
      Text("Legacy")
    }
  }
}`,
    expect: ["swift/navigation-view-deprecated"]
  },
  {
    id: "swift-nav-good",
    framework: "swift",
    file: "GoodNav.swift",
    kind: "good",
    code: `struct Root: View {
  var body: some View {
    NavigationStack {
      Text("Modern")
    }
  }
}`,
    expect: []
  },
  {
    id: "swift-typography-bad",
    framework: "swift",
    file: "BadType.swift",
    kind: "bad",
    code: `Text("Title").font(.system(size: 24))`,
    expect: ["swift/hardcoded-font-size"]
  },
  {
    id: "swift-typography-good",
    framework: "swift",
    file: "GoodType.swift",
    kind: "good",
    code: `Text("Title").font(.title)`,
    expect: []
  },
  // ── Web / React ────────────────────────────────────────────────
  {
    id: "web-img-bad",
    framework: "web",
    file: "BadImg.tsx",
    kind: "bad",
    code: `export const Hero = () => <img src="/hero.png" />;`,
    expect: ["web/missing-alt"]
  },
  {
    id: "web-img-good",
    framework: "web",
    file: "GoodImg.tsx",
    kind: "good",
    code: `export const Hero = () => <img src="/hero.png" alt="Product hero shot" />;`,
    expect: []
  },
  {
    id: "web-clickable-bad",
    framework: "web",
    file: "BadClick.tsx",
    kind: "bad",
    code: `export const Row = () => <div onClick={() => open()}>Open</div>;`,
    expect: ["web/div-with-on-click-no-role"]
  },
  {
    id: "web-clickable-good",
    framework: "web",
    file: "GoodClick.tsx",
    kind: "good",
    code: `export const Row = () => <button onClick={() => open()}>Open</button>;`,
    expect: []
  },
  {
    id: "web-tabindex-bad",
    framework: "web",
    file: "BadTab.tsx",
    kind: "bad",
    code: `export const F = () => <input tabIndex={3} />;`,
    expect: ["web/positive-tabindex"]
  },
  {
    id: "web-link-good",
    framework: "web",
    file: "GoodLink.tsx",
    kind: "good",
    code: `export const L = () => <a href="/pricing">See pricing plans</a>;`,
    expect: []
  },
  // ── CSS ────────────────────────────────────────────────────────
  {
    id: "css-outline-bad",
    framework: "css",
    file: "bad.css",
    kind: "bad",
    code: `button:focus { outline: none; }`,
    expect: ["css/outline-none"]
  },
  {
    id: "css-outline-good",
    framework: "css",
    file: "good.css",
    kind: "good",
    code: `button:focus-visible { outline: 2px solid Highlight; }`,
    expect: []
  },
  {
    id: "css-important-bad",
    framework: "css",
    file: "important.css",
    kind: "bad",
    code: `.a { color: var(--fg) !important; }`,
    expect: ["css/important-usage"]
  },
  {
    id: "css-logical-good",
    framework: "css",
    file: "logical.css",
    kind: "good",
    code: `.a { text-align: start; margin-inline-start: 8px; }`,
    expect: []
  },
  // ── HTML ───────────────────────────────────────────────────────
  {
    id: "html-viewport-bad",
    framework: "web",
    file: "bad.html",
    kind: "bad",
    code: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, user-scalable=no"></head><body><h1>Hi</h1></body></html>`,
    expect: ["web/user-scalable-no"]
  },
  {
    id: "html-good",
    framework: "web",
    file: "good.html",
    kind: "good",
    code: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><h1>Hi</h1></body></html>`,
    expect: []
  },
  // ── AST-tier precision cases (regex would misjudge these) ──────
  {
    id: "web-img-spread-good",
    framework: "web",
    file: "SpreadImg.tsx",
    kind: "good",
    code: `export const Avatar = (props) => <img {...props} />;`,
    expect: []
    // spread props may carry alt — the AST tier abstains
  },
  {
    id: "web-img-multiline-bad",
    framework: "web",
    file: "MultilineImg.tsx",
    kind: "bad",
    code: `export const Hero = () => (
  <img
    src="/hero.png"
    width={640}
  />
);`,
    expect: ["web/missing-alt"]
  },
  {
    id: "web-div-nested-gt-bad",
    framework: "web",
    file: "NestedGt.tsx",
    kind: "bad",
    code: `export const Row = () => (
  <div onClick={() => select(a > b ? a : b)}>
    Pick
  </div>
);`,
    expect: ["web/div-with-on-click-no-role"]
  },
  {
    id: "web-span-keyboard-good",
    framework: "web",
    file: "AccessibleSpan.tsx",
    kind: "good",
    code: `export const Row = () => (
  <span role="button" tabIndex={0} onKeyDown={onKey} onClick={onClick}>
    Pick
  </span>
);`,
    expect: []
    // AST tier abstains: role + tabIndex + keydown make it operable
  },
  {
    id: "swift-image-labeled-good",
    framework: "swift",
    file: "LabeledImage.swift",
    kind: "good",
    code: `Image(systemName: "star")
  .resizable()
  .accessibilityLabel("Favorite")`,
    expect: []
    // structural analysis sees the chained label
  },
  {
    id: "swift-image-bare-bad",
    framework: "swift",
    file: "BareImage.swift",
    kind: "bad",
    code: `Image(systemName: "star").frame(width: 20, height: 20)`,
    expect: ["swift/image-without-a11y"]
  },
  // ── Cross-platform ─────────────────────────────────────────────
  {
    id: "compose-clickable-bad",
    framework: "compose",
    file: "Bad.kt",
    kind: "bad",
    code: `Box(Modifier.clickable { open() }) { Text("Open") }`,
    expect: ["compose/clickable-without-role"]
  },
  {
    id: "android-image-bad",
    framework: "android-xml",
    file: "bad.xml",
    kind: "bad",
    code: `<ImageView android:src="@drawable/logo" android:layout_width="48dp" android:layout_height="48dp" />`,
    expect: ["android-xml/image-view-without-content-description"]
  },
  {
    id: "flutter-color-bad",
    framework: "flutter",
    file: "bad.dart",
    kind: "bad",
    code: `Container(color: Color(0xFFFF0000));`,
    expect: ["flutter/hardcoded-color"]
  }
];
function ratio(n, d) {
  return d === 0 ? 1 : Math.round(n / d * 1e3) / 1e3;
}
function runBenchmark(cases = BENCHMARK_CASES) {
  const tp = /* @__PURE__ */ new Map();
  const fp = /* @__PURE__ */ new Map();
  const fn = /* @__PURE__ */ new Map();
  const bump = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);
  const falsePositives = [];
  const falseNegatives = [];
  for (const c of cases) {
    const concerns = analyzeFile(c.code, c.file).filter((m) => m.type === "concern");
    const expected = [...c.expect];
    for (const match of concerns) {
      const idx = expected.indexOf(match.ruleId);
      if (idx !== -1) {
        expected.splice(idx, 1);
        bump(tp, match.ruleId);
      } else {
        bump(fp, match.ruleId);
        falsePositives.push({ case: c.id, ruleId: match.ruleId, line: match.line });
      }
    }
    for (const missed of expected) {
      bump(fn, missed);
      falseNegatives.push({ case: c.id, ruleId: missed });
    }
  }
  const ruleIds = /* @__PURE__ */ new Set([...tp.keys(), ...fp.keys(), ...fn.keys()]);
  const perRule = [...ruleIds].sort().map((ruleId) => {
    const t = tp.get(ruleId) ?? 0;
    const f = fp.get(ruleId) ?? 0;
    const n = fn.get(ruleId) ?? 0;
    return { ruleId, tp: t, fp: f, fn: n, precision: ratio(t, t + f), recall: ratio(t, t + n) };
  });
  const sum = (m) => [...m.values()].reduce((a, b) => a + b, 0);
  const T = sum(tp);
  const F = sum(fp);
  const N = sum(fn);
  return {
    perRule,
    overall: { tp: T, fp: F, fn: N, precision: ratio(T, T + F), recall: ratio(T, T + N) },
    falsePositives,
    falseNegatives
  };
}
export {
  AST_TSX_RULES,
  BASELINE_FILENAME,
  BENCHMARK_CASES,
  CACHE_FILENAME,
  CONFIG_FILENAME,
  HIG_SNAPSHOT_DATE,
  RULE_COUNT,
  ScanCache,
  analyzeFile,
  applyBaseline,
  applyConfig,
  applyFixes,
  astTsxAvailable,
  audit,
  baselineKey,
  categorizeMatches,
  createBaseline,
  detectPatterns,
  fixGuidance,
  generateAuditMarkdown,
  getRuleById,
  globToRegExp,
  higCitation,
  isFixable,
  loadBaseline,
  loadConfig,
  loadSkillContent,
  parseBaseline,
  parseConfig,
  refineSwift,
  ruleCatalog,
  runBenchmark,
  scanProject,
  severityFor,
  suggestFix,
  toSarif,
  writeBaseline
};
