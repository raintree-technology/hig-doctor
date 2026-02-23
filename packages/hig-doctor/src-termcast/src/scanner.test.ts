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
  test("ignores .build and Pods directories", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"));
    try {
      await mkdir(join(dir, ".build"), { recursive: true });
      await writeFile(join(dir, ".build", "Generated.swift"), "// generated");
      await writeFile(join(dir, "App.swift"), "import SwiftUI");
      const result = await scanProject(dir);
      expect(result.swiftFiles.length).toBe(1);
    } finally { await rm(dir, { recursive: true }); }
  });
});
