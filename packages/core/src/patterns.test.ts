import { describe, test, expect } from "bun:test";
import { detectPatterns, RULE_COUNT, ruleCatalog, getRuleById } from "./patterns";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

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
// RULE CATALOG
// ════════════════════════════════════════════════════════════════
describe("rule catalog", () => {
  const catalog = ruleCatalog();

  test("has one meta entry per rule with unique stable IDs", () => {
    expect(catalog.length).toBe(RULE_COUNT);
    const ids = new Set(catalog.map(r => r.id));
    expect(ids.size).toBe(RULE_COUNT);
    for (const meta of catalog) {
      expect(meta.id).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+(-\d+)?$/);
    }
  });

  test("getRuleById round-trips", () => {
    const first = catalog[0];
    expect(getRuleById(first.id)).toEqual(first);
    expect(getRuleById("nope/never")).toBeUndefined();
  });

  test("every match carries the ruleId and engine of its rule", () => {
    const matches = detectPatterns(`.foregroundColor(.red)`, "V.swift");
    const m = matches.find(x => x.pattern === "hardcodedColor");
    expect(m?.ruleId).toBe("swift/hardcoded-color");
    expect(m?.engine).toBe("regex");
    expect(getRuleById(m!.ruleId)?.label).toBe("hardcodedColor");
  });

  test("every critical and serious concern has fix guidance", () => {
    const gaps = catalog.filter(
      r => r.type === "concern" && (r.severity === "critical" || r.severity === "serious") && !r.fix,
    );
    expect(gaps.map(g => g.id)).toEqual([]);
  });

  test("every HIG citation resolves to a real reference topic", () => {
    const skillsDir = join(import.meta.dir, "..", "..", "..", "skills");
    const topics = new Set<string>();
    for (const skill of readdirSync(skillsDir)) {
      const refs = join(skillsDir, skill, "references");
      if (!existsSync(refs)) continue;
      for (const f of readdirSync(refs)) topics.add(f.replace(/\.md$/, ""));
    }
    const base = "https://developer.apple.com/design/human-interface-guidelines/";
    for (const meta of catalog) {
      expect(meta.hig.startsWith(base)).toBe(true);
      const slug = meta.hig.slice(base.length);
      if (slug !== "") {
        expect(topics.has(slug)).toBe(true);
      }
    }
  });
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

// ════════════════════════════════════════════════════════════════
// NO FALSE POSITIVES — correct code must stay quiet.
// These guard the negative-attribute rules whose original lookbehind/lookahead
// form matched tags that DID have the attribute (e.g. <img alt> flagged as
// "missing alt"). Without these, that class of bug is invisible to the suite.
// ════════════════════════════════════════════════════════════════
describe("no false positives — negative-attribute rules", () => {
  test("does NOT flag an <img> that has alt", () => {
    const matches = detectPatterns(`<img src="logo.png" alt="Company logo" />`, "Hero.tsx");
    expect(matches.some(m => m.pattern === "missing alt")).toBe(false);
  });
  test("flags an <img> with no alt", () => {
    const matches = detectPatterns(`<img src="logo.png" />`, "Hero.tsx");
    expect(matches.some(m => m.pattern === "missing alt" && m.type === "concern")).toBe(true);
  });
  test("does NOT flag a <div onClick> that has role (role after onClick)", () => {
    const matches = detectPatterns(`<div onClick={go} role="button" tabIndex={0}>Go</div>`, "Btn.tsx");
    expect(matches.some(m => m.pattern === "div with onClick no role")).toBe(false);
  });
  test("does NOT flag a <span onClick> that has role (role before onClick)", () => {
    const matches = detectPatterns(`<span role="button" onClick={go}>Go</span>`, "Btn.tsx");
    expect(matches.some(m => m.pattern === "span with onClick no role")).toBe(false);
  });
  test("does NOT flag an <svg> with role/aria", () => {
    const matches = detectPatterns(`<svg role="img" aria-label="Menu" viewBox="0 0 24 24"></svg>`, "Icon.tsx");
    expect(matches.some(m => m.pattern === "svg without a11y")).toBe(false);
  });
  test("flags a bare <svg> with no a11y", () => {
    const matches = detectPatterns(`<svg viewBox="0 0 24 24"></svg>`, "Icon.tsx");
    expect(matches.some(m => m.pattern === "svg without a11y" && m.type === "concern")).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// COMMENT & STRING HANDLING — rules must not fire on commented-out code
// or prose, but must still fire on real code (and not truncate at // inside
// string literals such as URLs).
// ════════════════════════════════════════════════════════════════
describe("comment & string handling", () => {
  test("ignores a pattern inside a line comment", () => {
    const matches = detectPatterns(`// example: <img src="x" /> has no alt`, "notes.tsx");
    expect(matches.some(m => m.pattern === "missing alt")).toBe(false);
  });
  test("ignores autoplay mentioned in a block comment", () => {
    const matches = detectPatterns(`/* never set autoplay on <video> */\nconst x = 1;`, "Player.tsx");
    expect(matches.some(m => m.pattern === "autoplay media")).toBe(false);
  });
  test("ignores markup inside an HTML comment", () => {
    const matches = detectPatterns(`<!-- <img src="x"> <video autoplay></video> -->`, "page.html");
    expect(matches.some(m => m.pattern === "missing alt")).toBe(false);
    expect(matches.some(m => m.pattern === "autoplay media")).toBe(false);
  });
  test("still flags autoplay in real markup", () => {
    const matches = detectPatterns(`<video autoplay src="v.mp4"></video>`, "Player.tsx");
    expect(matches.some(m => m.pattern === "autoplay media" && m.type === "concern")).toBe(true);
  });
  test("preserves https:// inside a string (does not truncate the line at //)", () => {
    const matches = detectPatterns(`<a href="https://example.com/x">read more</a>`, "Links.tsx");
    expect(matches.some(m => m.pattern === "ambiguous link text")).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// REGRESSION — audit hardening: multi-line tags, child-aware rules,
// file-level signals, and the severity downgrades. Each test below maps to a
// confirmed false positive / false negative the per-line engine produced.
// ════════════════════════════════════════════════════════════════
describe("regression — multi-line tags & child-aware rules", () => {
  // "video without track" used to fire on EVERY <video> — even captioned ones —
  // because its lookahead was bounded to the opening tag and never saw <track>.
  test("does NOT flag a <video> with a <track> child (single line)", () => {
    const matches = detectPatterns(`<video controls src="v.mp4"><track kind="captions" src="c.vtt" /></video>`, "Player.tsx");
    expect(matches.some(m => m.pattern === "video without track")).toBe(false);
  });
  test("does NOT flag a multi-line <video> with a <track> child", () => {
    const code = `<video controls src="v.mp4">\n  <track kind="captions" src="c.vtt" srcLang="en" />\n</video>`;
    expect(detectPatterns(code, "Player.tsx").some(m => m.pattern === "video without track")).toBe(false);
  });
  test("flags a <video> with no <track> child", () => {
    expect(detectPatterns(`<video controls src="v.mp4"></video>`, "Player.tsx")
      .some(m => m.pattern === "video without track" && m.type === "concern")).toBe(true);
  });

  // Per-line matching structurally missed tags whose attributes wrap across lines.
  test("flags a multi-line <img> with no alt", () => {
    const code = `<img\n  src="hero.png"\n  width={640}\n/>`;
    expect(detectPatterns(code, "Hero.tsx").some(m => m.pattern === "missing alt" && m.type === "concern")).toBe(true);
  });
  test("does NOT flag a multi-line <img> that has alt", () => {
    const code = `<img\n  src="hero.png"\n  alt="A hero"\n/>`;
    expect(detectPatterns(code, "Hero.tsx").some(m => m.pattern === "missing alt")).toBe(false);
  });
  test("flags a multi-line bare <svg>", () => {
    const code = `<svg\n  viewBox="0 0 24 24"\n  fill="none"\n>`;
    expect(detectPatterns(code, "Icon.tsx").some(m => m.pattern === "svg without a11y" && m.type === "concern")).toBe(true);
  });
  test("reports the line where a multi-line tag starts", () => {
    const code = `const x = 1;\n<img\n  src="hero.png"\n/>`;
    const matches = detectPatterns(code, "Hero.tsx").filter(m => m.pattern === "missing alt");
    expect(matches[0]?.line).toBe(2);
  });

  // autoPlay={false} is the accessible default and must not be flagged.
  test("does NOT flag autoPlay={false}", () => {
    expect(detectPatterns(`<video autoPlay={false} src="v.mp4" />`, "Player.tsx")
      .some(m => m.pattern === "autoplay media")).toBe(false);
  });
  test("flags a bare autoPlay (JSX boolean true)", () => {
    expect(detectPatterns(`<video autoPlay src="v.mp4" />`, "Player.tsx")
      .some(m => m.pattern === "autoplay media" && m.type === "concern")).toBe(true);
  });
  test("flags lowercase autoplay (HTML)", () => {
    expect(detectPatterns(`<video autoplay src="v.mp4"></video>`, "page.html")
      .some(m => m.pattern === "autoplay media" && m.type === "concern")).toBe(true);
  });
});

describe("regression — file-level & comment handling", () => {
  // hover-without-focus is now a file-level signal: it fires only when a
  // stylesheet has :hover styles but no :focus anywhere — not on every block.
  test("does NOT flag :hover when the file also defines :focus", () => {
    const code = `.btn:hover {\n  background: blue;\n}\n.btn:focus {\n  outline: 2px solid;\n}`;
    expect(detectPatterns(code, "buttons.css").some(m => m.pattern === "hover without focus")).toBe(false);
  });
  test("flags a stylesheet with :hover but no :focus, exactly once", () => {
    const code = `.a:hover { color: red; }\n.b:hover { color: blue; }`;
    expect(detectPatterns(code, "buttons.css").filter(m => m.pattern === "hover without focus").length).toBe(1);
  });
  test("treats :focus-visible as satisfying the focus requirement", () => {
    const code = `.btn:hover { color: red; }\n.btn:focus-visible { outline: 2px solid; }`;
    expect(detectPatterns(code, "buttons.css").some(m => m.pattern === "hover without focus")).toBe(false);
  });

  // `//` is not a comment in plain CSS; a protocol-relative url(//…) must not
  // swallow the rest of the line (which previously hid concerns after it).
  test("does not treat // as a comment in plain CSS (protocol-relative url)", () => {
    const code = `.logo {\n  background: url(//cdn.example.com/x.png);\n  color: #ffffff;\n}`;
    expect(detectPatterns(code, "logo.css").some(m => m.pattern === "hardcoded hex in CSS")).toBe(true);
  });
  test("still treats // as a comment in SCSS", () => {
    const code = `// color: #ffffff;\n.x { color: red; }`;
    expect(detectPatterns(code, "a.scss").some(m => m.pattern === "hardcoded hex in CSS")).toBe(false);
  });
});

describe("regression — Swift @State matcher & severity downgrades", () => {
  // The matcher was written backwards (var … @State) so it never fired; it now
  // matches the real `@State var` order and skips private / @StateObject.
  test("flags a non-private @State var", () => {
    expect(detectPatterns(`@State var counter = 0`, "V.swift")
      .some(m => m.pattern === "non-private @State" && m.type === "concern" && m.category === "patterns")).toBe(true);
  });
  test("does NOT flag @State private var", () => {
    expect(detectPatterns(`@State private var name = ""`, "V.swift")
      .some(m => m.pattern === "non-private @State")).toBe(false);
  });
  test("does NOT flag @StateObject", () => {
    expect(detectPatterns(`@StateObject var vm = VM()`, "V.swift")
      .some(m => m.pattern === "non-private @State")).toBe(false);
  });

  // The three heuristics that fire on common, often-fine code stay concerns but
  // at moderate severity, so they don't trip a `--fail-on serious` gate.
  test("Image / onTapGesture / hover concerns are moderate, not serious", () => {
    const swift = detectPatterns(`Image(systemName: "star")\nText("Hi").onTapGesture { go() }`, "V.swift");
    expect(swift.find(m => m.pattern === "Image without a11y")?.severity).toBe("moderate");
    expect(swift.find(m => m.pattern === "onTapGesture without traits")?.severity).toBe("moderate");
    const css = detectPatterns(`.a:hover { color: red; }`, "x.css");
    expect(css.find(m => m.pattern === "hover without focus")?.severity).toBe("moderate");
  });
});
