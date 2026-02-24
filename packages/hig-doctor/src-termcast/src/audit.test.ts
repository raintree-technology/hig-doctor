import { describe, test, expect } from "bun:test";
import { audit } from "./audit";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("audit", () => {
  test("audits a Swift project", async () => {
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
      expect(result.scanResult.frameworks).toContain("swiftui");

      const foundations = result.categories.find(c => c.skillName === "hig-foundations");
      expect(foundations).toBeDefined();
      expect(foundations!.concerns).toBeGreaterThan(0);
    } finally {
      await rm(dir, { recursive: true });
    }
  });

  test("audits a web/React project", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-web-"));
    try {
      await writeFile(join(dir, "next.config.ts"), "export default {}");
      await writeFile(join(dir, "package.json"), '{"dependencies":{"react":"^19","next":"^16"}}');
      await writeFile(join(dir, "Header.tsx"), `
"use client"
export function Header() {
  return (
    <header>
      <nav aria-label="Main">
        <a href="/" aria-current="page">Home</a>
      </nav>
      <button aria-label="Menu" aria-expanded={open}>
        <span className="sr-only">Open menu</span>
      </button>
    </header>
  )
}
`);
      await writeFile(join(dir, "globals.css"), `
:root {
  --background: 225 10% 6%;
  --foreground: 0 0% 95%;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-size: 1.0625rem;
}
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
@media (prefers-color-scheme: dark) {
  :root { --background: 0 0% 5%; }
}
button:focus-visible {
  outline: 3px solid var(--ring);
}
`);
      const result = await audit(dir);
      expect(result.scanResult.frameworks).toContain("nextjs");
      expect(result.scanResult.codeFiles.length).toBeGreaterThanOrEqual(1);
      expect(result.scanResult.styleFiles.length).toBe(1); // globals.css
      expect(result.categories.length).toBeGreaterThan(0);

      // Should find accessibility positives
      const foundations = result.categories.find(c => c.skillName === "hig-foundations");
      expect(foundations).toBeDefined();
      expect(foundations!.positives).toBeGreaterThan(0);

      // Should find layout patterns
      const layout = result.categories.find(c => c.skillName === "hig-components-layout");
      expect(layout).toBeDefined();
    } finally {
      await rm(dir, { recursive: true });
    }
  });

  test("handles empty project gracefully", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-empty-"));
    try {
      const result = await audit(dir);
      expect(result.scanResult.codeFiles.length).toBe(0);
      expect(result.categories.length).toBe(0);
      expect(result.markdown).toContain("# HIG Audit");
    } finally {
      await rm(dir, { recursive: true });
    }
  });

  test("loads skill content when skills directory available", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-skills-"));
    try {
      await writeFile(join(dir, "View.swift"), `.foregroundColor(.red)`);
      const skillsDir = join(import.meta.dir, "..", "..", "..", "..", "skills");
      const result = await audit(dir, skillsDir);
      const foundations = result.categories.find(c => c.skillName === "hig-foundations");
      expect(foundations).toBeDefined();
      expect(result.markdown).not.toContain("*Load reference from skill: hig-foundations*");
    } finally {
      await rm(dir, { recursive: true });
    }
  });
});
