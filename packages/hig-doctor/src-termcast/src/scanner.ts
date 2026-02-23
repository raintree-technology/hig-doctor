// scanner.ts
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

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

async function walkDir(dir: string, rootDir: string, result: ScanResult): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = relative(rootDir, fullPath);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (entry.name.endsWith(".xcassets")) { result.assetCatalogs.push(relPath); continue; }
      if (entry.name.endsWith(".xcodeproj") || entry.name.endsWith(".xcworkspace")) { result.xcodeProjects.push(relPath); continue; }
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
  const result: ScanResult = { directory, swiftFiles: [], infoPlistPaths: [], assetCatalogs: [], storyboards: [], xcodeProjects: [], packageSwift: null };
  await walkDir(directory, directory, result);
  return result;
}
