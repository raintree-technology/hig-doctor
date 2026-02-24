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
      expect(result.codeFiles.length).toBe(1);
      expect(result.frameworks).toContain("swiftui");
    } finally { await rm(dir, { recursive: true }); }
  });

  test("discovers TSX/JSX files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"));
    try {
      await writeFile(join(dir, "App.tsx"), "export default function App() { return <div/> }");
      await writeFile(join(dir, "package.json"), '{"dependencies":{"react":"^19"}}');
      const result = await scanProject(dir);
      expect(result.codeFiles.length).toBe(1);
      expect(result.codeFiles[0].relativePath).toBe("App.tsx");
      expect(result.configFiles.length).toBe(1);
      expect(result.frameworks).toContain("react");
    } finally { await rm(dir, { recursive: true }); }
  });

  test("discovers CSS files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"));
    try {
      await writeFile(join(dir, "globals.css"), "body { color: var(--foreground) }");
      const result = await scanProject(dir);
      expect(result.styleFiles.length).toBe(1);
    } finally { await rm(dir, { recursive: true }); }
  });

  test("detects Next.js framework", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"));
    try {
      await writeFile(join(dir, "next.config.ts"), "export default {}");
      await writeFile(join(dir, "page.tsx"), "<main>Hello</main>");
      const result = await scanProject(dir);
      expect(result.frameworks).toContain("nextjs");
    } finally { await rm(dir, { recursive: true }); }
  });

  test("discovers Info.plist", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"));
    try {
      await writeFile(join(dir, "Info.plist"), "<plist></plist>");
      const result = await scanProject(dir);
      expect(result.infoPlistPaths.length).toBe(1);
    } finally { await rm(dir, { recursive: true }); }
  });

  test("discovers xcassets directories", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"));
    try {
      await mkdir(join(dir, "Assets.xcassets"), { recursive: true });
      const result = await scanProject(dir);
      expect(result.assetCatalogs.length).toBe(1);
    } finally { await rm(dir, { recursive: true }); }
  });

  test("ignores .build, node_modules, and .next directories", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"));
    try {
      await mkdir(join(dir, ".build"), { recursive: true });
      await writeFile(join(dir, ".build", "Generated.swift"), "// generated");
      await mkdir(join(dir, "node_modules"), { recursive: true });
      await writeFile(join(dir, "node_modules", "lib.js"), "module.exports = {}");
      await mkdir(join(dir, ".next"), { recursive: true });
      await writeFile(join(dir, ".next", "build.js"), "// build");
      await writeFile(join(dir, "App.swift"), "import SwiftUI");
      const result = await scanProject(dir);
      expect(result.swiftFiles.length).toBe(1);
      expect(result.codeFiles.length).toBe(1);
    } finally { await rm(dir, { recursive: true }); }
  });
});
