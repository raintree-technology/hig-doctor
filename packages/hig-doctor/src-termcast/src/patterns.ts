// patterns.ts — Universal HIG pattern detection across all frameworks
export interface PatternMatch {
  category: string;
  subcategory: string;
  type: "pattern" | "positive" | "concern";
  pattern: string;
  line: number;
  lineContent: string;
  file: string;
}

interface PatternRule {
  category: string;
  subcategory: string;
  type: "pattern" | "positive" | "concern";
  pattern: string;
  regex: RegExp;
  fileFilter?: RegExp; // only apply to files matching this pattern
}

// ============================================================
// SWIFT / SWIFTUI RULES
// ============================================================
const swiftRules: PatternRule[] = [
  // Layout & Navigation
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "TabView", regex: /\bTabView\b/, fileFilter: /\.swift$/ },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NavigationStack", regex: /\bNavigationStack\b/, fileFilter: /\.swift$/ },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NavigationSplitView", regex: /\bNavigationSplitView\b/, fileFilter: /\.swift$/ },
  { category: "components-layout", subcategory: "navigation", type: "concern", pattern: "NavigationView (deprecated)", regex: /\bNavigationView\b/, fileFilter: /\.swift$/ },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "NavigationLink", regex: /\bNavigationLink\b/, fileFilter: /\.swift$/ },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "List", regex: /\bList\s*\{/, fileFilter: /\.swift$/ },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "ScrollView", regex: /\bScrollView\b/, fileFilter: /\.swift$/ },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "LazyVGrid", regex: /\bLazyVGrid\b/, fileFilter: /\.swift$/ },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "GeometryReader", regex: /\bGeometryReader\b/, fileFilter: /\.swift$/ },
  { category: "components-layout", subcategory: "layout", type: "positive", pattern: "adaptiveLayout", regex: /\.adaptive\(minimum:/, fileFilter: /\.swift$/ },

  // Color
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcodedColor", regex: /\.foregroundColor\(\.(red|blue|green|yellow|orange|purple|pink|white|black)\)/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcodedRGBColor", regex: /Color\(\s*red:/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcodedUIColor", regex: /UIColor\(\s*red:/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "semanticColor", regex: /\.(primary|secondary|accentColor)\b/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "foregroundStyle", regex: /\.foregroundStyle\(\.(primary|secondary|tertiary|quaternary)\)/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "assetCatalogColor", regex: /Color\(\s*"[^"]+"\s*\)/, fileFilter: /\.swift$/ },

  // Typography
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "dynamicTypeStyle", regex: /\.font\(\.(largeTitle|title|title2|title3|headline|subheadline|body|callout|footnote|caption|caption2)\)/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "hardcodedFontSize", regex: /\.font\(\.system\(size:/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "hardcodedUIFont", regex: /UIFont\.\s*systemFont\(ofSize:/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "scaledMetric", regex: /@ScaledMetric/, fileFilter: /\.swift$/ },

  // Accessibility
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityLabel", regex: /\.accessibilityLabel\(/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityHint", regex: /\.accessibilityHint\(/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityHidden", regex: /\.accessibilityHidden\(/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityAddTraits", regex: /\.accessibilityAddTraits\(/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "reduceMotion", regex: /accessibilityReduceMotion/, fileFilter: /\.swift$/ },

  // Dark mode
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "colorScheme", regex: /@Environment\(\\\.colorScheme\)/, fileFilter: /\.swift$/ },
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "preferredColorScheme", regex: /\.preferredColorScheme\(/, fileFilter: /\.swift$/ },

  // Controls
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Button", regex: /\bButton\s*[{(]/, fileFilter: /\.swift$/ },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Toggle", regex: /\bToggle\s*[{(]/, fileFilter: /\.swift$/ },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Picker", regex: /\bPicker\s*[{(]/, fileFilter: /\.swift$/ },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "Slider", regex: /\bSlider\s*[{(]/, fileFilter: /\.swift$/ },

  // Dialogs
  { category: "components-dialogs", subcategory: "modals", type: "pattern", pattern: "sheet", regex: /\.sheet\(/, fileFilter: /\.swift$/ },
  { category: "components-dialogs", subcategory: "alerts", type: "pattern", pattern: "alert", regex: /\.alert\(/, fileFilter: /\.swift$/ },
  { category: "components-dialogs", subcategory: "alerts", type: "pattern", pattern: "confirmationDialog", regex: /\.confirmationDialog\(/, fileFilter: /\.swift$/ },

  // Search
  { category: "components-search", subcategory: "search", type: "pattern", pattern: "searchable", regex: /\.searchable\(/, fileFilter: /\.swift$/ },

  // Status
  { category: "components-status", subcategory: "progress", type: "pattern", pattern: "ProgressView", regex: /\bProgressView\b/, fileFilter: /\.swift$/ },

  // Menus
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "contextMenu", regex: /\.contextMenu\s*\{/, fileFilter: /\.swift$/ },
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "Menu", regex: /\bMenu\s*\{/, fileFilter: /\.swift$/ },

  // Patterns
  { category: "patterns", subcategory: "animation", type: "pattern", pattern: "withAnimation", regex: /\bwithAnimation\b/, fileFilter: /\.swift$/ },
  { category: "patterns", subcategory: "haptics", type: "pattern", pattern: "sensoryFeedback", regex: /\.sensoryFeedback\(/, fileFilter: /\.swift$/ },
  { category: "patterns", subcategory: "dragDrop", type: "pattern", pattern: "onDrag", regex: /\.onDrag\b/, fileFilter: /\.swift$/ },
  { category: "patterns", subcategory: "refresh", type: "pattern", pattern: "refreshable", regex: /\.refreshable\b/, fileFilter: /\.swift$/ },
  { category: "patterns", subcategory: "swipeActions", type: "pattern", pattern: "swipeActions", regex: /\.swipeActions\b/, fileFilter: /\.swift$/ },

  // Inputs
  { category: "inputs", subcategory: "gestures", type: "pattern", pattern: "TapGesture", regex: /\.onTapGesture\b/, fileFilter: /\.swift$/ },
  { category: "inputs", subcategory: "keyboard", type: "pattern", pattern: "keyboardShortcut", regex: /\.keyboardShortcut\(/, fileFilter: /\.swift$/ },
  { category: "inputs", subcategory: "focus", type: "pattern", pattern: "focusState", regex: /@FocusState\b/, fileFilter: /\.swift$/ },

  // Technologies
  { category: "technologies", subcategory: "appIntents", type: "pattern", pattern: "AppIntent", regex: /\bAppIntent\b/, fileFilter: /\.swift$/ },
  { category: "technologies", subcategory: "swiftData", type: "pattern", pattern: "SwiftData", regex: /import\s+SwiftData/, fileFilter: /\.swift$/ },

  // Platforms
  { category: "platforms", subcategory: "multiplatform", type: "positive", pattern: "conditionalPlatform", regex: /#if\s+(os\(iOS\)|os\(macOS\)|os\(watchOS\)|os\(tvOS\)|os\(visionOS\))/, fileFilter: /\.swift$/ },
];

// ============================================================
// WEB / REACT / NEXT.JS RULES
// ============================================================
const webCodeRules: PatternRule[] = [
  // --- Accessibility (foundations) ---
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-label", regex: /aria-label[=s]/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-describedby", regex: /aria-describedby/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-live", regex: /aria-live/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-expanded", regex: /aria-expanded/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-hidden", regex: /aria-hidden/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "aria-current", regex: /aria-current/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "role attribute", regex: /role=["']/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "sr-only", regex: /sr-only|visually-hidden|screen-reader/i, fileFilter: /\.(tsx|jsx|html?|css)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "alt text", regex: /\balt=["'][^"']+["']/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "foundations", subcategory: "accessibility", type: "concern", pattern: "missing alt", regex: /<img\s[^>]*(?<!\balt=)[^>]*\/?>/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "tabIndex", regex: /tabIndex/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "focus management", regex: /onFocus|onBlur|useRef.*focus/, fileFilter: /\.(tsx|jsx|ts|js)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "keyboard handler", regex: /onKeyDown|onKeyUp|onKeyPress/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "skip link", regex: /skip.*nav|skip.*content|skiplink/i, fileFilter: /\.(tsx|jsx|html?|css)$/ },

  // --- Color system (foundations) ---
  { category: "foundations", subcategory: "color", type: "positive", pattern: "CSS variable color", regex: /var\(--[a-z]/, fileFilter: /\.(tsx|jsx|css|scss|html?)$/ },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "semantic text color", regex: /text-(foreground|muted-foreground|primary|secondary|destructive|accent-foreground)/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "semantic bg color", regex: /bg-(background|muted|accent|card|popover|primary|secondary|destructive)/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "semantic border color", regex: /border-(border|input|ring)/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "inline color style", regex: /style=\{?\{[^}]*color:\s*['"]#/, fileFilter: /\.(tsx|jsx)$/ },

  // --- Typography (foundations) ---
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "design token font size", regex: /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "font-weight token", regex: /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "foundations", subcategory: "typography", type: "concern", pattern: "hardcoded font-size px", regex: /font-size:\s*\d+px/, fileFilter: /\.(css|scss|tsx|jsx)$/ },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "rem/em font size", regex: /font-size:\s*[\d.]+r?em/, fileFilter: /\.(css|scss)$/ },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "system font stack", regex: /font-family:.*(-apple-system|BlinkMacSystemFont|system-ui|SF Pro)/i, fileFilter: /\.(css|scss)$/ },

  // --- Dark mode (foundations) ---
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "dark mode class", regex: /\bdark:/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "prefers-color-scheme", regex: /prefers-color-scheme/, fileFilter: /\.(css|scss|tsx|jsx|ts|js)$/ },
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "color-scheme property", regex: /color-scheme:\s*(light\s+dark|dark\s+light)/, fileFilter: /\.(css|scss)$/ },

  // --- Responsive / Layout (foundations) ---
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "responsive breakpoint", regex: /\b(sm:|md:|lg:|xl:|2xl:)/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "media query", regex: /@media\s*\(/, fileFilter: /\.(css|scss)$/ },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "safe area inset", regex: /safe-area-inset|env\(safe-area/, fileFilter: /\.(css|scss|tsx|jsx)$/ },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "container query", regex: /@container\b/, fileFilter: /\.(css|scss)$/ },

  // --- Motion (foundations) ---
  { category: "foundations", subcategory: "motion", type: "positive", pattern: "prefers-reduced-motion", regex: /prefers-reduced-motion/, fileFilter: /\.(css|scss|tsx|jsx|ts|js)$/ },
  { category: "foundations", subcategory: "motion", type: "pattern", pattern: "CSS animation", regex: /@keyframes/, fileFilter: /\.(css|scss)$/ },
  { category: "foundations", subcategory: "motion", type: "pattern", pattern: "CSS transition", regex: /transition:/, fileFilter: /\.(css|scss)$/ },

  // --- Touch targets (foundations) ---
  { category: "foundations", subcategory: "touchTargets", type: "positive", pattern: "min touch target 44px", regex: /min-(width|height):\s*4[4-8]px|min-(w|h)-1[1-2]\b/, fileFilter: /\.(css|scss|tsx|jsx)$/ },

  // --- Navigation (components-layout) ---
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "nav element", regex: /<nav\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "Link component", regex: /<Link\b/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "useRouter", regex: /useRouter\b/, fileFilter: /\.(tsx|jsx|ts|js)$/ },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "usePathname", regex: /usePathname\b/, fileFilter: /\.(tsx|jsx|ts|js)$/ },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "header element", regex: /<header\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "main element", regex: /<main\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "footer element", regex: /<footer\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "section element", regex: /<section\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-layout", subcategory: "layout", type: "positive", pattern: "grid layout", regex: /grid-cols|grid-template/, fileFilter: /\.(tsx|jsx|css|scss)$/ },

  // --- Controls (components-controls) ---
  { category: "components-controls", subcategory: "buttons", type: "pattern", pattern: "button element", regex: /<button\b|<Button\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "input element", regex: /<input\b|<Input\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "select element", regex: /<select\b|<Select\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-controls", subcategory: "inputs", type: "pattern", pattern: "checkbox/radio", regex: /type=["'](checkbox|radio)["']/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-controls", subcategory: "inputs", type: "positive", pattern: "label element", regex: /<label\b|<Label\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-controls", subcategory: "toggle", type: "pattern", pattern: "switch/toggle", regex: /<Switch\b|role=["']switch["']/, fileFilter: /\.(tsx|jsx)$/ },

  // --- Dialogs (components-dialogs) ---
  { category: "components-dialogs", subcategory: "modals", type: "pattern", pattern: "dialog element", regex: /<dialog\b|<Dialog\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-dialogs", subcategory: "modals", type: "pattern", pattern: "modal/sheet", regex: /<Modal\b|<Sheet\b|<Drawer\b/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "components-dialogs", subcategory: "alerts", type: "pattern", pattern: "alert dialog", regex: /<AlertDialog\b|role=["']alertdialog["']/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "components-dialogs", subcategory: "popover", type: "pattern", pattern: "popover", regex: /<Popover\b/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "components-dialogs", subcategory: "toast", type: "pattern", pattern: "toast/notification", regex: /<Toast\b|toast\(|<Toaster\b|<Sonner\b/, fileFilter: /\.(tsx|jsx)$/ },

  // --- Search (components-search) ---
  { category: "components-search", subcategory: "search", type: "pattern", pattern: "search input", regex: /type=["']search["']/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-search", subcategory: "search", type: "pattern", pattern: "search role", regex: /role=["']search["']/, fileFilter: /\.(tsx|jsx|html?)$/ },

  // --- Menus (components-menus) ---
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "dropdown menu", regex: /<DropdownMenu\b/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "components-menus", subcategory: "menus", type: "pattern", pattern: "context menu", regex: /<ContextMenu\b|onContextMenu/, fileFilter: /\.(tsx|jsx)$/ },

  // --- Status (components-status) ---
  { category: "components-status", subcategory: "progress", type: "pattern", pattern: "progress bar", regex: /<progress\b|<Progress\b|role=["']progressbar["']/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-status", subcategory: "loading", type: "pattern", pattern: "loading state", regex: /isLoading|loading\s*[=:]|<Skeleton\b|<Spinner\b/, fileFilter: /\.(tsx|jsx|ts|js)$/ },

  // --- Content (components-content) ---
  { category: "components-content", subcategory: "images", type: "pattern", pattern: "Next Image", regex: /<Image\b.*\bsrc=/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "components-content", subcategory: "tables", type: "pattern", pattern: "table element", regex: /<table\b|<Table\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "components-content", subcategory: "accordion", type: "pattern", pattern: "accordion", regex: /<Accordion\b/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "components-content", subcategory: "cards", type: "pattern", pattern: "card component", regex: /<Card\b/, fileFilter: /\.(tsx|jsx)$/ },

  // --- Patterns ---
  { category: "patterns", subcategory: "animation", type: "pattern", pattern: "framer motion", regex: /framer-motion|motion\.[a-z]/, fileFilter: /\.(tsx|jsx|ts|js)$/ },
  { category: "patterns", subcategory: "seo", type: "positive", pattern: "metadata/head", regex: /export.*metadata|<Head\b|<title\b/, fileFilter: /\.(tsx|jsx|ts|js)$/ },
  { category: "patterns", subcategory: "errorHandling", type: "positive", pattern: "error boundary", regex: /ErrorBoundary|error\.tsx/, fileFilter: /\.(tsx|jsx|ts|js)$/ },

  // --- Inputs ---
  { category: "inputs", subcategory: "forms", type: "pattern", pattern: "form element", regex: /<form\b|<Form\b/, fileFilter: /\.(tsx|jsx|html?)$/ },
  { category: "inputs", subcategory: "forms", type: "positive", pattern: "form validation", regex: /\brequired\b|pattern=|minLength|maxLength/, fileFilter: /\.(tsx|jsx|html?)$/ },

  // --- Technologies ---
  { category: "technologies", subcategory: "analytics", type: "pattern", pattern: "analytics", regex: /@vercel\/analytics|gtag|GoogleAnalytics/, fileFilter: /\.(tsx|jsx|ts|js)$/ },
];

// ============================================================
// CSS-SPECIFIC RULES (applied to style files)
// ============================================================
const cssRules: PatternRule[] = [
  { category: "foundations", subcategory: "color", type: "positive", pattern: "CSS custom property def", regex: /--[a-z][\w-]*:\s*/, fileFilter: /\.(css|scss)$/ },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcoded hex in CSS", regex: /(?:^|[\s;{])(?:color|background(?:-color)?|border(?:-color)?):\s*#[0-9a-fA-F]{3,8}\b/, fileFilter: /\.(css|scss)$/ },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "clamp font size", regex: /font-size:\s*clamp\(/, fileFilter: /\.(css|scss)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "focus-visible", regex: /:focus-visible/, fileFilter: /\.(css|scss)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "focus ring styles", regex: /outline.*focus|ring-/, fileFilter: /\.(css|scss)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "high contrast", regex: /forced-colors|high-contrast|prefers-contrast/, fileFilter: /\.(css|scss)$/ },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "print styles", regex: /@media\s+print/, fileFilter: /\.(css|scss)$/ },
  { category: "foundations", subcategory: "touchTargets", type: "positive", pattern: "touch target sizing", regex: /min-(width|height):\s*4[4-8]px/, fileFilter: /\.(css|scss)$/ },
];

// ============================================================
// REACT NATIVE RULES
// ============================================================
const reactNativeRules: PatternRule[] = [
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityLabel", regex: /accessibilityLabel=/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "accessibilityRole", regex: /accessibilityRole=/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "useColorScheme", regex: /useColorScheme\b/, fileFilter: /\.(tsx|jsx|ts|js)$/ },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "useWindowDimensions", regex: /useWindowDimensions\b/, fileFilter: /\.(tsx|jsx|ts|js)$/ },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "React Navigation", regex: /createNativeStackNavigator|createBottomTabNavigator|NavigationContainer/, fileFilter: /\.(tsx|jsx|ts|js)$/ },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "FlatList", regex: /\bFlatList\b/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "SafeAreaView", regex: /\bSafeAreaView\b/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "inputs", subcategory: "gestures", type: "pattern", pattern: "Gesture handler", regex: /PanGestureHandler|TapGestureHandler|GestureDetector/, fileFilter: /\.(tsx|jsx)$/ },
  { category: "patterns", subcategory: "haptics", type: "pattern", pattern: "Haptics", regex: /Haptics\.|expo-haptics/, fileFilter: /\.(tsx|jsx|ts|js)$/ },
];

// ============================================================
// FLUTTER RULES
// ============================================================
const flutterRules: PatternRule[] = [
  { category: "foundations", subcategory: "accessibility", type: "positive", pattern: "Semantics widget", regex: /\bSemantics\(/, fileFilter: /\.dart$/ },
  { category: "foundations", subcategory: "color", type: "positive", pattern: "Theme color", regex: /Theme\.of\(context\)\.colorScheme/, fileFilter: /\.dart$/ },
  { category: "foundations", subcategory: "color", type: "concern", pattern: "hardcoded Color", regex: /Color\(0x[0-9a-fA-F]+\)/, fileFilter: /\.dart$/ },
  { category: "foundations", subcategory: "typography", type: "positive", pattern: "Theme text style", regex: /Theme\.of\(context\)\.textTheme/, fileFilter: /\.dart$/ },
  { category: "foundations", subcategory: "darkMode", type: "positive", pattern: "brightness detection", regex: /MediaQuery\.of\(context\)\.platformBrightness/, fileFilter: /\.dart$/ },
  { category: "foundations", subcategory: "layout", type: "positive", pattern: "MediaQuery responsive", regex: /MediaQuery\.of\(context\)\.size/, fileFilter: /\.dart$/ },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "Navigator", regex: /\bNavigator\b/, fileFilter: /\.dart$/ },
  { category: "components-layout", subcategory: "navigation", type: "pattern", pattern: "CupertinoTabBar", regex: /\bCupertinoTabBar\b/, fileFilter: /\.dart$/ },
  { category: "components-layout", subcategory: "layout", type: "pattern", pattern: "ListView", regex: /\bListView\b/, fileFilter: /\.dart$/ },
  { category: "components-controls", subcategory: "controls", type: "pattern", pattern: "CupertinoButton", regex: /\bCupertinoButton\b/, fileFilter: /\.dart$/ },
];

// Combine all rules
const allRules: PatternRule[] = [
  ...swiftRules,
  ...webCodeRules,
  ...cssRules,
  ...reactNativeRules,
  ...flutterRules,
];

export function detectPatterns(code: string, file: string): PatternMatch[] {
  const matches: PatternMatch[] = [];
  const lines = code.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const lineContent = lines[i];
    for (const rule of allRules) {
      if (rule.fileFilter && !rule.fileFilter.test(file)) continue;
      if (rule.regex.test(lineContent)) {
        matches.push({
          category: rule.category,
          subcategory: rule.subcategory,
          type: rule.type,
          pattern: rule.pattern,
          line: i + 1,
          lineContent: lineContent.trim(),
          file,
        });
      }
    }
  }

  return matches;
}
