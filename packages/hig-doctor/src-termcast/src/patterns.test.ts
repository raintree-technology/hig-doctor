import { describe, test, expect } from "bun:test";
import { detectPatterns } from "./patterns";

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
});

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
});

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
});
