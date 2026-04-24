// patterns.ts — Universal HIG pattern detection across all frameworks
// ~450 rules covering Swift, React, Vue, Svelte, Angular, Flutter, Kotlin, Android XML, CSS, HTML
export type Severity = "critical" | "serious" | "moderate";

export interface PatternMatch {
  category: string;
  subcategory: string;
  type: "pattern" | "positive" | "concern";
  pattern: string;
  line: number;
  lineContent: string;
  file: string;
  severity?: Severity;
}

interface PatternRule {
  category: string;
  subcategory: string;
  type: "pattern" | "positive" | "concern";
  pattern: string;
  regex: RegExp;
  fileFilter?: RegExp; // only apply to files matching this pattern
  skipInBlock?: RegExp; // skip this rule when inside a CSS block matching this pattern
}

// Severity classification for concern-type rules.
// Critical = breaks accessibility outright. Serious = significant UX degradation.
// Everything else defaults to moderate.
const CRITICAL_CONCERNS = new Set<string>([
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
  "ImageView without contentDescription",
]);

const SERIOUS_CONCERNS = new Set<string>([
  "onTapGesture without traits",
  "Image without a11y",
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
  "hover without focus",
  "v-on:click without keyboard",
  "on:click without on:keydown",
  "(click) without (keydown)",
  "clickable without Role",
  "nested touchables",
]);

export function severityFor(pattern: string): Severity {
  if (CRITICAL_CONCERNS.has(pattern)) return "critical";
  if (SERIOUS_CONCERNS.has(pattern)) return "serious";
  return "moderate";
}

// File filter shorthands
const SWIFT = /\.swift$/;
const WEB = /\.(tsx|jsx|html?)$/;
const TSX_JSX = /\.(tsx|jsx)$/;
const TS_JS = /\.(tsx|jsx|ts|js)$/;
const CSS = /\.(css|scss|sass|less)$/;
const VUE = /\.vue$/;
const SVELTE = /\.svelte$/;
const ANGULAR = /\.(ts|html)$/;
const DART = /\.dart$/;
const KOTLIN = /\.kt$/;
const ANDROID_XML = /\.xml$/;
const WEB_ALL = /\.(tsx|jsx|html?|vue|svelte)$/;
const CODE_ALL = /\.(tsx|jsx|ts|js|vue|svelte|html?)$/;
const STYLE_ALL = /\.(css|scss|sass|less)$/;

// ════════════════════════════════════════════════════════════════
// SWIFT / SWIFTUI RULES (~55 rules)
// ════════════════════════════════════════════════════════════════
const swiftRules: PatternRule[] = [
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
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "non-private @State", regex: /\b(var|let)\s+\w+.*@State\b(?!.*private)/, fileFilter: SWIFT },
];

// ════════════════════════════════════════════════════════════════
// WEB / REACT / NEXT.JS RULES (~100 rules)
// ════════════════════════════════════════════════════════════════
const webCodeRules: PatternRule[] = [
  // ── Accessibility: Positives ────────────────────────────────
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-label", regex: /aria-label[=s]/, fileFilter: WEB },
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
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "missing alt", regex: /<img\s[^>]*(?<!\balt=)[^>]*\/?>/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "Image without alt", regex: /<Image\s[^>]*(?<!\balt=)[^>]*\/?>/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "svg without a11y", regex: /<svg\s(?![^>]*(?:aria-label|aria-hidden|role=))/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "div with onClick no role", regex: /<div\s[^>]*onClick[^>]*(?!.*role=)/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "span with onClick no role", regex: /<span\s[^>]*onClick[^>]*(?!.*role=)/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "ambiguous link text", regex: />\s*(click here|read more|learn more|here|more)\s*</i, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "positive tabindex", regex: /tabIndex=\{[1-9]|tabindex="[1-9]/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "aria-hidden on focusable", regex: /aria-hidden=["']true["'][^>]*(?:<button|<a\s|<input|tabIndex)/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "onMouseOver without onFocus", regex: /onMouseOver=(?![^>]*onFocus)/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "onMouseOut without onBlur", regex: /onMouseOut=(?![^>]*onBlur)/, fileFilter: TSX_JSX },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "autoFocus", regex: /autoFocus\b|autofocus\b/, fileFilter: WEB_ALL },

  // ── Heading & Structure ─────────────────────────────────────
  { category: "foundations", subcategory: "structure", type: "concern", pattern: "empty heading", regex: /<h[1-6][^>]*>\s*<\/h[1-6]>/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "structure", type: "concern", pattern: "empty button", regex: /<button[^>]*>\s*<\/button>/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "structure", type: "concern", pattern: "div as button", regex: /<div[^>]*role=["']button["']/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "structure", type: "concern", pattern: "div as nav/header class", regex: /<div[^>]*class(?:Name)?=["'][^"']*\b(nav|header|footer|sidebar)\b/i, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "structure", type: "concern", pattern: "missing html lang", regex: /<html(?!\s[^>]*lang=)/, fileFilter: /\.html?$/ },
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
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "video without track", regex: /<video\b(?![^>]*<track)/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "autoplay media", regex: /\bautoplay\b|autoPlay\b/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "blink element", regex: /<blink\b/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "marquee element", regex: /<marquee\b/, fileFilter: WEB_ALL },

  // ── Viewport concerns ───────────────────────────────────────
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "user-scalable=no", regex: /user-scalable\s*=\s*no/, fileFilter: WEB_ALL },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "maximum-scale=1", regex: /maximum-scale\s*=\s*1\b/, fileFilter: WEB_ALL },
];

// ════════════════════════════════════════════════════════════════
// CSS-SPECIFIC RULES (~40 rules)
// ════════════════════════════════════════════════════════════════
const cssRules: PatternRule[] = [
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
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "hover without focus", regex: /:hover\s*\{(?![^}]*:focus)/, fileFilter: STYLE_ALL, skipInBlock: /::-webkit-scrollbar|::scrollbar/ },

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
  { category: "foundations", subcategory: "i18n", type: "concern", pattern: "physical text-align", regex: /text-align:\s*(left|right)\b/, fileFilter: STYLE_ALL },
];

// ════════════════════════════════════════════════════════════════
// VUE RULES (~25 rules)
// ════════════════════════════════════════════════════════════════
const vueRules: PatternRule[] = [
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
  { category: "patterns", subcategory: "i18n", type: "positive", pattern: "Vue i18n", regex: /\$t\(|useI18n|vue-i18n/, fileFilter: VUE },
];

// ════════════════════════════════════════════════════════════════
// SVELTE RULES (~20 rules)
// ════════════════════════════════════════════════════════════════
const svelteRules: PatternRule[] = [
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
  { category: "patterns", subcategory: "i18n", type: "positive", pattern: "Svelte i18n", regex: /svelte-i18n|\$_\(|i18n/, fileFilter: SVELTE },
];

// ════════════════════════════════════════════════════════════════
// ANGULAR RULES (~25 rules)
// ════════════════════════════════════════════════════════════════
const angularRules: PatternRule[] = [
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
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "Angular dark theme", regex: /dark-theme|\.dark\b/, fileFilter: ANGULAR },
];

// ════════════════════════════════════════════════════════════════
// KOTLIN / JETPACK COMPOSE RULES (~30 rules)
// ════════════════════════════════════════════════════════════════
const kotlinRules: PatternRule[] = [
  // Accessibility
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "contentDescription", regex: /contentDescription\s*=/, fileFilter: KOTLIN },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "semantics modifier", regex: /Modifier\.semantics/, fileFilter: KOTLIN },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "clearAndSetSemantics", regex: /clearAndSetSemantics/, fileFilter: KOTLIN },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "clickable without Role", regex: /Modifier\.clickable\s*\((?![^)]*role\s*=)/, fileFilter: KOTLIN },
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
  { category: "components-status", subcategory: "progress", type: "pattern", pattern: "CircularProgress", regex: /CircularProgressIndicator|LinearProgressIndicator/, fileFilter: KOTLIN },
];

// ════════════════════════════════════════════════════════════════
// ANDROID XML RULES (~20 rules)
// ════════════════════════════════════════════════════════════════
const androidXmlRules: PatternRule[] = [
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
  { category: "foundations", subcategory: "touchTargets", type: "positive", pattern: "minHeight 48dp", regex: /android:minHeight=["']4[4-8]dp/, fileFilter: ANDROID_XML },
];

// ════════════════════════════════════════════════════════════════
// REACT NATIVE RULES (~15 rules)
// ════════════════════════════════════════════════════════════════
const reactNativeRules: PatternRule[] = [
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
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "nested touchables", regex: /accessible=\{true\}[^]*?<Touchable/, fileFilter: TSX_JSX },
];

// ════════════════════════════════════════════════════════════════
// FLUTTER RULES (~20 rules)
// ════════════════════════════════════════════════════════════════
const flutterRules: PatternRule[] = [
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
  { category: "patterns", subcategory: "i18n", type: "positive", pattern: "Flutter l10n", regex: /AppLocalizations|flutter_localizations|intl/, fileFilter: DART },
];

// ════════════════════════════════════════════════════════════════
// COMBINE ALL RULES
// ════════════════════════════════════════════════════════════════
const allRules: PatternRule[] = [
  ...swiftRules,
  ...webCodeRules,
  ...cssRules,
  ...vueRules,
  ...svelteRules,
  ...angularRules,
  ...kotlinRules,
  ...androidXmlRules,
  ...reactNativeRules,
  ...flutterRules,
];

export function detectPatterns(code: string, file: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const lines = code.split("\n");
  const isStyleFile = /\.(css|scss|sass|less)$/.test(file);

  // Track CSS block context for skipInBlock rules
  // We maintain a stack of block-opening lines so we can check if we're inside
  // a @media print, :focus:not(:focus-visible), or similar block
  const blockContext: string[] = [];
  let braceDepth = 0;
  const blockStartDepth: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineContent = lines[i];

    // Track CSS block nesting for context-aware rules
    if (isStyleFile) {
      // Check if this line opens a new block (has a selector/at-rule before {)
      const opensBlock = lineContent.includes("{");
      const closesBlock = lineContent.includes("}");

      if (opensBlock) {
        // Accumulate context: look back up to 3 lines for the selector/at-rule
        let contextLines = lineContent;
        for (let j = Math.max(0, i - 3); j < i; j++) {
          if (!lines[j].includes("}") && !lines[j].includes("{")) {
            contextLines = lines[j] + " " + contextLines;
          }
        }
        blockContext.push(contextLines);
        blockStartDepth.push(braceDepth);
        braceDepth++;
      }
      if (closesBlock) {
        braceDepth = Math.max(0, braceDepth - 1);
        // Pop blocks that have ended
        while (blockStartDepth.length > 0 && blockStartDepth[blockStartDepth.length - 1] >= braceDepth) {
          blockStartDepth.pop();
          blockContext.pop();
        }
      }
    }

    for (const rule of allRules) {
      if (rule.fileFilter && !rule.fileFilter.test(file)) continue;
      if (rule.regex.test(lineContent)) {
        // Check if this match should be skipped due to block context
        if (rule.skipInBlock && isStyleFile) {
          const inSkippedBlock = blockContext.some(ctx => rule.skipInBlock!.test(ctx));
          if (inSkippedBlock) continue;
        }
        matches.push({
          category: rule.category,
          subcategory: rule.subcategory,
          type: rule.type,
          pattern: rule.pattern,
          line: i + 1,
          lineContent: lineContent.trim(),
          file,
          severity: rule.type === "concern" ? severityFor(rule.pattern) : undefined,
        });
      }
    }
  }

  return matches;
}

// Export rule count for documentation
export const RULE_COUNT = allRules.length;
