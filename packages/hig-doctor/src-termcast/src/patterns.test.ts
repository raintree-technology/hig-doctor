import { describe, test, expect } from "bun:test";
import { detectPatterns, RULE_COUNT } from "./patterns";

// Exact-count guard. The rule count is quoted verbatim in user-facing docs, so
// it must not drift silently. When you intentionally add or remove rules, bump
// the number here AND in every doc spot below (search the repo for the old count):
//   - README.md (root)
//   - AGENTS.md (root)
//   - .claude-plugin/marketplace.json (plugin description)
//   - website/components/AuditDemo.tsx (the "same N rules" copy)
//   - demos/remotion-hig-doctor/README.md
//   - demos/remotion-hig-doctor/src/data/report-data.json ("totalRules")
const EXPECTED_RULE_COUNT = 348;
test(`rule count is exactly ${EXPECTED_RULE_COUNT}`, () => {
  expect(RULE_COUNT).toBe(EXPECTED_RULE_COUNT);
});

// ════════════════════════════════════════════════════════════════
// SWIFT
// ════════════════════════════════════════════════════════════════
describe("detectPatterns — Swift", () => {
  test("detects TabView navigation", () => {
    const code = `struct ContentView: View {\n  var body: some View {\n    TabView {\n      HomeView()\n    }\n  }\n}`;
    const matches = detectPatterns(code, "ContentView.swift");
    const nav = matches.filter(m => m.category === "components-layout");
    expect(nav.length).toBeGreaterThan(0);
    expect(nav.some(m => m.pattern === "TabView")).toBe(true);
  });
  test("flags hardcoded colors", () => {
    const matches = detectPatterns(`.foregroundColor(.red)\n.foregroundColor(Color(red: 0.5, green: 0.2, blue: 0.1))`, "View.swift");
    expect(matches.filter(m => m.category === "foundations" && m.type === "concern").length).toBeGreaterThan(0);
  });
  test("detects system color usage as positive", () => {
    const matches = detectPatterns(`.foregroundStyle(.primary)\n.foregroundStyle(.secondary)`, "View.swift");
    expect(matches.filter(m => m.category === "foundations" && m.type === "positive").length).toBeGreaterThan(0);
  });
  test("detects accessibility modifiers", () => {
    const matches = detectPatterns(`.accessibilityLabel("Close")\n.accessibilityHint("Dismisses")`, "View.swift");
    expect(matches.filter(m => m.category === "foundations" && m.subcategory === "accessibility").length).toBeGreaterThan(0);
  });
  test("flags hardcoded font sizes", () => {
    const matches = detectPatterns(`.font(.system(size: 14))`, "View.swift");
    expect(matches.filter(m => m.subcategory === "typography" && m.type === "concern").length).toBeGreaterThan(0);
  });
  test("detects Dynamic Type usage", () => {
    const matches = detectPatterns(`.font(.title)\n.font(.body)`, "View.swift");
    expect(matches.filter(m => m.subcategory === "typography" && m.type === "positive").length).toBeGreaterThan(0);
  });
  test("flags onTapGesture as concern", () => {
    const matches = detectPatterns(`.onTapGesture {\n  doSomething()\n}`, "View.swift");
    expect(matches.some(m => m.type === "concern" && m.pattern === "onTapGesture without traits")).toBe(true);
  });
  test("detects WidgetKit import", () => {
    const matches = detectPatterns(`import WidgetKit`, "Widget.swift");
    expect(matches.some(m => m.pattern === "WidgetKit")).toBe(true);
  });
  test("flags hardcoded CGRect", () => {
    const matches = detectPatterns(`let frame = CGRect(x: 10, y: 20, width: 100, height: 50)`, "View.swift");
    expect(matches.some(m => m.type === "concern" && m.pattern === "hardcoded CGRect")).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// WEB / REACT
// ════════════════════════════════════════════════════════════════
describe("detectPatterns — Web/React", () => {
  test("detects aria attributes as positive", () => {
    const code = `<button aria-label="Close" aria-expanded={open}>X</button>`;
    const matches = detectPatterns(code, "Header.tsx");
    const a11y = matches.filter(m => m.subcategory === "accessibility" && m.type === "positive");
    expect(a11y.length).toBeGreaterThan(0);
    expect(a11y.some(m => m.pattern === "aria-label")).toBe(true);
  });

  test("detects semantic color tokens as positive", () => {
    const code = `<div className="text-foreground bg-background border-border">`;
    const matches = detectPatterns(code, "Card.tsx");
    const color = matches.filter(m => m.subcategory === "color" && m.type === "positive");
    expect(color.length).toBeGreaterThan(0);
  });

  test("flags inline hardcoded colors as concern", () => {
    const code = `<div style={{color: "#ff0000"}}>Bad</div>`;
    const matches = detectPatterns(code, "Bad.tsx");
    const concerns = matches.filter(m => m.subcategory === "color" && m.type === "concern");
    expect(concerns.length).toBeGreaterThan(0);
  });

  test("detects Tailwind font size tokens as positive", () => {
    const code = `<h1 className="text-4xl font-bold">Title</h1>`;
    const matches = detectPatterns(code, "Hero.tsx");
    const typo = matches.filter(m => m.subcategory === "typography" && m.type === "positive");
    expect(typo.length).toBeGreaterThan(0);
  });

  test("detects dark mode classes", () => {
    const code = `<div className="dark:bg-gray-900 dark:text-white">`;
    const matches = detectPatterns(code, "Layout.tsx");
    const dark = matches.filter(m => m.subcategory === "darkMode" && m.type === "positive");
    expect(dark.length).toBeGreaterThan(0);
  });

  test("detects responsive breakpoints", () => {
    const code = `<div className="flex flex-col sm:flex-row lg:grid-cols-3">`;
    const matches = detectPatterns(code, "Grid.tsx");
    const layout = matches.filter(m => m.subcategory === "layout" && m.type === "positive");
    expect(layout.length).toBeGreaterThan(0);
  });

  test("detects prefers-reduced-motion as positive", () => {
    const code = `@media (prefers-reduced-motion: reduce) { * { animation: none; } }`;
    const matches = detectPatterns(code, "globals.css");
    const motion = matches.filter(m => m.subcategory === "motion" && m.type === "positive");
    expect(motion.length).toBeGreaterThan(0);
  });

  test("detects semantic HTML elements", () => {
    const code = `<nav>\n<header>\n<main>\n<footer>`;
    const matches = detectPatterns(code, "Layout.tsx");
    const layout = matches.filter(m => m.category === "components-layout");
    expect(layout.length).toBeGreaterThanOrEqual(4);
  });

  test("detects sr-only as accessibility positive", () => {
    const code = `<span className="sr-only">Screen reader text</span>`;
    const matches = detectPatterns(code, "Icon.tsx");
    expect(matches.some(m => m.pattern === "sr-only" && m.type === "positive")).toBe(true);
  });

  test("does not apply Swift rules to TSX files", () => {
    const code = `const TabView = () => <div>tabs</div>`;
    const matches = detectPatterns(code, "Tabs.tsx");
    expect(matches.filter(m => m.pattern === "TabView").length).toBe(0);
  });

  test("does not apply web rules to Swift files", () => {
    const code = `<nav className="flex">`;
    const matches = detectPatterns(code, "View.swift");
    expect(matches.filter(m => m.pattern === "nav element").length).toBe(0);
  });

  // Accessibility anti-patterns
  test("flags div with onClick but no role", () => {
    const code = `<div onClick={handleClick}>Click me</div>`;
    const matches = detectPatterns(code, "Bad.tsx");
    expect(matches.some(m => m.type === "concern" && m.pattern === "div with onClick no role")).toBe(true);
  });

  test("flags ambiguous link text", () => {
    const code = `<a href="/page">click here</a>`;
    const matches = detectPatterns(code, "Links.tsx");
    expect(matches.some(m => m.type === "concern" && m.pattern === "ambiguous link text")).toBe(true);
  });

  test("flags positive tabindex", () => {
    const code = `<div tabIndex={5}>Bad</div>`;
    const matches = detectPatterns(code, "Bad.tsx");
    expect(matches.some(m => m.type === "concern" && m.pattern === "positive tabindex")).toBe(true);
  });

  test("flags empty heading", () => {
    const code = `<h2></h2>`;
    const matches = detectPatterns(code, "Page.tsx");
    expect(matches.some(m => m.type === "concern" && m.pattern === "empty heading")).toBe(true);
  });

  test("flags empty button", () => {
    const code = `<button></button>`;
    const matches = detectPatterns(code, "Page.tsx");
    expect(matches.some(m => m.type === "concern" && m.pattern === "empty button")).toBe(true);
  });

  test("flags div used as button", () => {
    const code = `<div role="button" onClick={click}>Do</div>`;
    const matches = detectPatterns(code, "Bad.tsx");
    expect(matches.some(m => m.type === "concern" && m.pattern === "div as button")).toBe(true);
  });

  test("flags autoplay media", () => {
    const code = `<video autoplay src="video.mp4"></video>`;
    const matches = detectPatterns(code, "Video.tsx");
    expect(matches.some(m => m.type === "concern" && m.pattern === "autoplay media")).toBe(true);
  });

  test("flags user-scalable=no", () => {
    const code = `<meta name="viewport" content="width=device-width, user-scalable=no">`;
    const matches = detectPatterns(code, "index.html");
    expect(matches.some(m => m.type === "concern" && m.pattern === "user-scalable=no")).toBe(true);
  });

  test("detects form validation as positive", () => {
    const code = `<input type="email" required />\n<input type="tel" autocomplete="tel" />`;
    const matches = detectPatterns(code, "Form.tsx");
    expect(matches.some(m => m.pattern === "input type email" && m.type === "positive")).toBe(true);
    expect(matches.some(m => m.pattern === "input type tel" && m.type === "positive")).toBe(true);
  });

  test("detects fieldset/legend as positive", () => {
    const code = `<fieldset><legend>Options</legend></fieldset>`;
    const matches = detectPatterns(code, "Form.tsx");
    expect(matches.some(m => m.pattern === "fieldset element")).toBe(true);
    expect(matches.some(m => m.pattern === "legend element")).toBe(true);
  });

  test("detects i18n usage as positive", () => {
    const code = `const { t } = useTranslation();`;
    const matches = detectPatterns(code, "Page.tsx");
    expect(matches.some(m => m.pattern === "i18n/l10n" && m.type === "positive")).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// CSS
// ════════════════════════════════════════════════════════════════
describe("detectPatterns — CSS", () => {
  test("detects CSS custom properties as positive", () => {
    const code = `--background: 225 10% 6%;`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "CSS custom property def" && m.type === "positive")).toBe(true);
  });

  test("detects focus-visible styles", () => {
    const code = `button:focus-visible { outline: 2px solid var(--ring); }`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "focus-visible" && m.type === "positive")).toBe(true);
  });

  test("detects high contrast support", () => {
    const code = `@media (forced-colors: active) { button { border: 1px solid; } }`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "high contrast")).toBe(true);
  });

  test("flags outline: none as concern", () => {
    const code = `button { outline: none; }`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "outline none" && m.type === "concern")).toBe(true);
  });

  test("flags text-align justify as concern", () => {
    const code = `p { text-align: justify; }`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "text-align justify" && m.type === "concern")).toBe(true);
  });

  test("flags !important as concern", () => {
    const code = `color: red !important;`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "!important usage" && m.type === "concern")).toBe(true);
  });

  test("flags extreme z-index as concern", () => {
    const code = `z-index: 9999;`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "extreme z-index" && m.type === "concern")).toBe(true);
  });

  test("detects logical properties as positive", () => {
    const code = `margin-inline-start: 1rem;`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "logical margin/padding" && m.type === "positive")).toBe(true);
  });

  test("flags physical text-align as concern", () => {
    const code = `text-align: left;`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "physical text-align" && m.type === "concern")).toBe(true);
  });

  test("detects clamp font size as positive", () => {
    const code = `font-size: clamp(1rem, 2vw, 2rem);`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "clamp font size" && m.type === "positive")).toBe(true);
  });

  test("detects max-width with ch as positive", () => {
    const code = `max-width: 65ch;`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "max-width on text" && m.type === "positive")).toBe(true);
  });

  test("flags small font size as concern", () => {
    const code = `font-size: 10px;`;
    const matches = detectPatterns(code, "globals.css");
    expect(matches.some(m => m.pattern === "font-size below 12px" && m.type === "concern")).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// VUE
// ════════════════════════════════════════════════════════════════
describe("detectPatterns — Vue", () => {
  test("detects vue aria-label as positive", () => {
    const code = `<button :aria-label="label">X</button>`;
    const matches = detectPatterns(code, "Button.vue");
    expect(matches.some(m => m.type === "positive" && m.subcategory === "accessibility")).toBe(true);
  });

  test("detects router-link as navigation", () => {
    const code = `<router-link to="/about">About</router-link>`;
    const matches = detectPatterns(code, "Nav.vue");
    expect(matches.some(m => m.pattern === "router-link")).toBe(true);
  });

  test("detects v-model as control pattern", () => {
    const code = `<input v-model="name" />`;
    const matches = detectPatterns(code, "Form.vue");
    expect(matches.some(m => m.pattern === "v-model")).toBe(true);
  });

  test("detects Vue i18n as positive", () => {
    const code = `{{ $t('hello') }}`;
    const matches = detectPatterns(code, "Page.vue");
    expect(matches.some(m => m.pattern === "Vue i18n" && m.type === "positive")).toBe(true);
  });

  test("detects Vue transition as animation pattern", () => {
    const code = `<transition name="fade"><div>Content</div></transition>`;
    const matches = detectPatterns(code, "Page.vue");
    expect(matches.some(m => m.pattern === "Vue transition")).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// SVELTE
// ════════════════════════════════════════════════════════════════
describe("detectPatterns — Svelte", () => {
  test("detects svelte aria-label as positive", () => {
    const code = `<button aria-label="Close">X</button>`;
    const matches = detectPatterns(code, "Button.svelte");
    expect(matches.some(m => m.type === "positive" && m.subcategory === "accessibility")).toBe(true);
  });

  test("flags on:click without on:keydown as concern", () => {
    const code = `<div on:click={handle}>Click</div>`;
    const matches = detectPatterns(code, "Bad.svelte");
    expect(matches.some(m => m.type === "concern" && m.pattern === "on:click without on:keydown")).toBe(true);
  });

  test("detects svelte bind:value as positive", () => {
    const code = `<input bind:value={name} />`;
    const matches = detectPatterns(code, "Form.svelte");
    expect(matches.some(m => m.pattern === "Svelte bind:value")).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// ANGULAR
// ════════════════════════════════════════════════════════════════
describe("detectPatterns — Angular", () => {
  test("detects [attr.aria-label] as positive", () => {
    const code = `<button [attr.aria-label]="label">X</button>`;
    const matches = detectPatterns(code, "button.component.html");
    expect(matches.some(m => m.type === "positive" && m.pattern === "[attr.aria-label]")).toBe(true);
  });

  test("detects routerLink as navigation", () => {
    const code = `<a routerLink="/about">About</a>`;
    const matches = detectPatterns(code, "nav.component.html");
    expect(matches.some(m => m.pattern === "routerLink")).toBe(true);
  });

  test("detects Angular CDK a11y as positive", () => {
    const code = `<div cdkTrapFocus><input cdkFocusInitial /></div>`;
    const matches = detectPatterns(code, "dialog.component.html");
    expect(matches.some(m => m.pattern === "Angular CDK a11y" && m.type === "positive")).toBe(true);
  });

  test("flags (click) without (keydown) as concern", () => {
    const code = `<div (click)="handleClick()">Click</div>`;
    const matches = detectPatterns(code, "bad.component.html");
    expect(matches.some(m => m.type === "concern" && m.pattern === "(click) without (keydown)")).toBe(true);
  });

  test("detects mat-form-field as control pattern", () => {
    const code = `<mat-form-field><input matInput /></mat-form-field>`;
    const matches = detectPatterns(code, "form.component.html");
    expect(matches.some(m => m.pattern === "mat-form-field")).toBe(true);
    expect(matches.some(m => m.pattern === "mat-input")).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// KOTLIN / JETPACK COMPOSE
// ════════════════════════════════════════════════════════════════
describe("detectPatterns — Kotlin/Compose", () => {
  test("detects contentDescription as positive", () => {
    const code = `Image(contentDescription = "Profile photo")`;
    const matches = detectPatterns(code, "Profile.kt");
    expect(matches.some(m => m.pattern === "contentDescription" && m.type === "positive")).toBe(true);
  });

  test("flags hardcoded Color as concern", () => {
    const code = `Color(0xFF0000FF)`;
    const matches = detectPatterns(code, "Theme.kt");
    expect(matches.some(m => m.pattern === "hardcoded Color(0x)" && m.type === "concern")).toBe(true);
  });

  test("flags hardcoded Color.Red as concern", () => {
    const code = `Text(color = Color.Red)`;
    const matches = detectPatterns(code, "View.kt");
    expect(matches.some(m => m.pattern === "hardcoded Color.Red/Blue" && m.type === "concern")).toBe(true);
  });

  test("detects MaterialTheme colorScheme as positive", () => {
    const code = `val color = MaterialTheme.colorScheme.primary`;
    const matches = detectPatterns(code, "Theme.kt");
    expect(matches.some(m => m.pattern === "MaterialTheme colorScheme" && m.type === "positive")).toBe(true);
  });

  test("detects Scaffold layout pattern", () => {
    const code = `Scaffold(\n  topBar = { TopAppBar() }\n) { }`;
    const matches = detectPatterns(code, "Main.kt");
    expect(matches.some(m => m.pattern === "Scaffold")).toBe(true);
  });

  test("detects isSystemInDarkTheme as positive", () => {
    const code = `val isDark = isSystemInDarkTheme()`;
    const matches = detectPatterns(code, "Theme.kt");
    expect(matches.some(m => m.pattern === "isSystemInDarkTheme" && m.type === "positive")).toBe(true);
  });

  test("flags clickable without Role as concern", () => {
    const code = `Modifier.clickable(onClick = { })`;
    const matches = detectPatterns(code, "Item.kt");
    expect(matches.some(m => m.type === "concern" && m.pattern === "clickable without Role")).toBe(true);
  });

  test("flags hardcoded fontSize as concern", () => {
    const code = `fontSize = 14.sp`;
    const matches = detectPatterns(code, "Text.kt");
    expect(matches.some(m => m.type === "concern" && m.pattern === "hardcoded fontSize")).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// ANDROID XML
// ════════════════════════════════════════════════════════════════
describe("detectPatterns — Android XML", () => {
  test("detects contentDescription as positive", () => {
    const code = `<ImageView android:contentDescription="@string/photo" />`;
    const matches = detectPatterns(code, "layout.xml");
    expect(matches.some(m => m.pattern === "android:contentDescription" && m.type === "positive")).toBe(true);
  });

  test("flags ImageView without contentDescription", () => {
    const code = `<ImageView android:src="@drawable/icon" />`;
    const matches = detectPatterns(code, "layout.xml");
    expect(matches.some(m => m.pattern === "ImageView without contentDescription" && m.type === "concern")).toBe(true);
  });

  test("flags hardcoded color in XML", () => {
    const code = `<TextView android:textColor="#FF0000" />`;
    const matches = detectPatterns(code, "layout.xml");
    expect(matches.some(m => m.pattern === "hardcoded color in XML" && m.type === "concern")).toBe(true);
  });

  test("detects @color/ resource as positive", () => {
    const code = `android:textColor="@color/primary"`;
    const matches = detectPatterns(code, "layout.xml");
    expect(matches.some(m => m.pattern === "@color/ resource" && m.type === "positive")).toBe(true);
  });

  test("detects sp text size as positive", () => {
    const code = `android:textSize="16sp"`;
    const matches = detectPatterns(code, "layout.xml");
    expect(matches.some(m => m.pattern === "sp text size" && m.type === "positive")).toBe(true);
  });

  test("flags dp text size as concern", () => {
    const code = `android:textSize="16dp"`;
    const matches = detectPatterns(code, "layout.xml");
    expect(matches.some(m => m.pattern === "dp text size" && m.type === "concern")).toBe(true);
  });

  test("flags px units as concern", () => {
    const code = `android:layout_width="100px"`;
    const matches = detectPatterns(code, "layout.xml");
    expect(matches.some(m => m.pattern === "px units in XML" && m.type === "concern")).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// FLUTTER
// ════════════════════════════════════════════════════════════════
describe("detectPatterns — Flutter", () => {
  test("detects Semantics widget as positive", () => {
    const matches = detectPatterns(`Semantics(label: "Close")`, "widget.dart");
    expect(matches.some(m => m.pattern === "Semantics widget" && m.type === "positive")).toBe(true);
  });

  test("flags Colors.red as concern", () => {
    const matches = detectPatterns(`color: Colors.red`, "widget.dart");
    expect(matches.some(m => m.pattern === "Colors.red/blue" && m.type === "concern")).toBe(true);
  });

  test("detects Theme.of as positive", () => {
    const matches = detectPatterns(`Theme.of(context).colorScheme.primary`, "widget.dart");
    expect(matches.some(m => m.pattern === "Theme color" && m.type === "positive")).toBe(true);
  });

  test("detects darkTheme as positive", () => {
    const matches = detectPatterns(`darkTheme: ThemeData.dark()`, "app.dart");
    expect(matches.some(m => m.pattern === "darkTheme" && m.type === "positive")).toBe(true);
  });

  test("detects Flutter l10n as positive", () => {
    const matches = detectPatterns(`import 'package:flutter_localizations/flutter_localizations.dart';`, "app.dart");
    expect(matches.some(m => m.pattern === "Flutter l10n" && m.type === "positive")).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// FILE FILTER ISOLATION
// ════════════════════════════════════════════════════════════════
describe("file filter isolation", () => {
  test("Kotlin rules don't match Swift files", () => {
    const code = `MaterialTheme.colorScheme.primary`;
    const matches = detectPatterns(code, "View.swift");
    expect(matches.filter(m => m.pattern === "MaterialTheme colorScheme").length).toBe(0);
  });

  test("Android XML rules don't match HTML files", () => {
    const code = `<ImageView android:src="@drawable/icon" />`;
    const matches = detectPatterns(code, "page.html");
    expect(matches.filter(m => m.pattern === "ImageView without contentDescription").length).toBe(0);
  });

  test("Vue rules don't match TSX files", () => {
    const code = `<router-link to="/about">About</router-link>`;
    const matches = detectPatterns(code, "Nav.tsx");
    expect(matches.filter(m => m.pattern === "router-link").length).toBe(0);
  });

  test("Svelte rules don't match Vue files", () => {
    const code = `<input bind:value={name} />`;
    const matches = detectPatterns(code, "Form.vue");
    expect(matches.filter(m => m.pattern === "Svelte bind:value").length).toBe(0);
  });
});
