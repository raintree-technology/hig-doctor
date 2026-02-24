// scanner.ts — Framework-agnostic project scanner
import { readdir, readFile } from "node:fs/promises";
import { join, relative, extname } from "node:path";

export interface ScannedFile {
  relativePath: string;
  absolutePath: string;
  content: string;
}

export type Framework = "swiftui" | "uikit" | "react" | "nextjs" | "react-native" | "flutter" | "html" | "unknown";

export interface ScanResult {
  directory: string;
  frameworks: Framework[];
  // Universal collections
  codeFiles: ScannedFile[];
  styleFiles: ScannedFile[];
  configFiles: ScannedFile[];
  markupFiles: ScannedFile[];
  // Swift-specific (backward compat)
  swiftFiles: ScannedFile[];
  infoPlistPaths: string[];
  assetCatalogs: string[];
  storyboards: ScannedFile[];
  xcodeProjects: string[];
  packageSwift: ScannedFile | null;
}

const IGNORED_DIRS = new Set([
  ".build", ".git", "node_modules", "Pods", "DerivedData",
  ".swiftpm", "Carthage", "Build", ".next", ".nuxt", ".output",
  "dist", "build", ".cache", ".turbo", "coverage", "__pycache__",
  ".dart_tool", ".pub-cache", "android", "ios", "macos", "linux", "windows",
]);

const CODE_EXTENSIONS = new Set([
  ".swift", ".tsx", ".jsx", ".ts", ".js",
  ".vue", ".svelte", ".dart", ".kt", ".java",
]);

const STYLE_EXTENSIONS = new Set([
  ".css", ".scss", ".sass", ".less", ".styl",
]);

const MARKUP_EXTENSIONS = new Set([
  ".html", ".htm", ".xml", ".storyboard", ".xib",
]);

const CONFIG_FILES = new Set([
  "tailwind.config.ts", "tailwind.config.js", "tailwind.config.mjs",
  "next.config.ts", "next.config.js", "next.config.mjs",
  "package.json", "tsconfig.json",
  "Info.plist", "Package.swift", "pubspec.yaml",
  "app.json", "expo.json", "eas.json",
  "components.json",
]);

async function walkDir(dir: string, rootDir: string, result: ScanResult): Promise<void> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relPath = relative(rootDir, fullPath);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (entry.name.endsWith(".xcassets")) { result.assetCatalogs.push(relPath); continue; }
      if (entry.name.endsWith(".xcodeproj") || entry.name.endsWith(".xcworkspace")) { result.xcodeProjects.push(relPath); continue; }
      await walkDir(fullPath, rootDir, result);
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      const isConfig = CONFIG_FILES.has(entry.name);

      // Config files are always collected (and may also be code)
      if (isConfig) {
        const content = await readFile(fullPath, "utf-8");
        const file: ScannedFile = { relativePath: relPath, absolutePath: fullPath, content };
        result.configFiles.push(file);
        if (entry.name === "Info.plist") result.infoPlistPaths.push(relPath);
        if (entry.name === "Package.swift") result.packageSwift = file;
        // Config files with code extensions also go into codeFiles
        if (CODE_EXTENSIONS.has(ext)) {
          result.codeFiles.push(file);
          if (ext === ".swift") result.swiftFiles.push(file);
        }
      } else if (CODE_EXTENSIONS.has(ext)) {
        const content = await readFile(fullPath, "utf-8");
        const file: ScannedFile = { relativePath: relPath, absolutePath: fullPath, content };
        result.codeFiles.push(file);
        if (ext === ".swift") result.swiftFiles.push(file);
      } else if (STYLE_EXTENSIONS.has(ext)) {
        const content = await readFile(fullPath, "utf-8");
        result.styleFiles.push({ relativePath: relPath, absolutePath: fullPath, content });
      } else if (MARKUP_EXTENSIONS.has(ext)) {
        const content = await readFile(fullPath, "utf-8");
        const file: ScannedFile = { relativePath: relPath, absolutePath: fullPath, content };
        result.markupFiles.push(file);
        if (ext === ".storyboard" || ext === ".xib") result.storyboards.push(file);
      }
    }
  }
}

function detectFrameworks(result: ScanResult): Framework[] {
  const frameworks: Framework[] = [];
  const hasExt = (ext: string) => result.codeFiles.some(f => f.relativePath.endsWith(ext));
  const hasConfig = (name: string) => result.configFiles.some(f => f.relativePath.endsWith(name));
  const configContains = (name: string, text: string) => {
    const file = result.configFiles.find(f => f.relativePath.endsWith(name));
    return file?.content.includes(text) ?? false;
  };

  // Swift
  if (hasExt(".swift")) {
    const hasSwiftUI = result.codeFiles.some(f => f.content.includes("import SwiftUI"));
    const hasUIKit = result.codeFiles.some(f => f.content.includes("import UIKit"));
    if (hasSwiftUI) frameworks.push("swiftui");
    if (hasUIKit) frameworks.push("uikit");
    if (!hasSwiftUI && !hasUIKit) frameworks.push("swiftui"); // default for Swift
  }

  // Next.js
  if (hasConfig("next.config.ts") || hasConfig("next.config.js") || hasConfig("next.config.mjs")) {
    frameworks.push("nextjs");
  }
  // React (not Next.js)
  else if ((hasExt(".tsx") || hasExt(".jsx")) && configContains("package.json", "\"react\"")) {
    // React Native
    if (configContains("package.json", "\"react-native\"") || hasConfig("app.json")) {
      frameworks.push("react-native");
    } else {
      frameworks.push("react");
    }
  }

  // Flutter
  if (hasExt(".dart") || hasConfig("pubspec.yaml")) {
    frameworks.push("flutter");
  }

  // Plain HTML
  if (frameworks.length === 0 && result.markupFiles.some(f => f.relativePath.endsWith(".html"))) {
    frameworks.push("html");
  }

  if (frameworks.length === 0) frameworks.push("unknown");
  return frameworks;
}

export async function scanProject(directory: string): Promise<ScanResult> {
  const result: ScanResult = {
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
    packageSwift: null,
  };
  await walkDir(directory, directory, result);
  result.frameworks = detectFrameworks(result);
  return result;
}
