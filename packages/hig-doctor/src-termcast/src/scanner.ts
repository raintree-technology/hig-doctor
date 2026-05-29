// scanner.ts — Framework-agnostic project scanner
import { readdir, readFile } from "node:fs/promises";
import { join, relative, extname, sep } from "node:path";

export interface ScannedFile {
  relativePath: string;
  absolutePath: string;
  content: string;
}

export type Framework = "swiftui" | "uikit" | "react" | "nextjs" | "react-native" | "vue" | "nuxt" | "svelte" | "sveltekit" | "angular" | "flutter" | "compose" | "android" | "html" | "unknown";

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
  "nuxt.config.ts", "nuxt.config.js",
  "svelte.config.js", "svelte.config.ts",
  "angular.json",
  "package.json", "tsconfig.json",
  "Info.plist", "Package.swift", "pubspec.yaml",
  "app.json", "expo.json", "eas.json",
  "components.json",
  "build.gradle", "build.gradle.kts", "AndroidManifest.xml",
]);

export interface ScanOptions {
  /** Path globs (relative to the scanned root) to skip. Merged with `.higauditignore`. */
  exclude?: string[];
}

const IGNORE_FILE = ".higauditignore";

// Convert a path glob to an anchored RegExp. Semantics (path-based, not gitignore):
//   *   → any run of characters except "/"
//   **  → any run of characters including "/"
//   **/ → zero or more leading path segments
//   ?   → a single character except "/"
// Patterns match the POSIX relative path from the scan root.
function globToRegExp(glob: string): RegExp {
  const g = glob.replace(/^\.\//, "").replace(/^\/+/, "").replace(/\/+$/, "");
  let re = "";
  for (let i = 0; i < g.length; i++) {
    const ch = g[i];
    if (ch === "*") {
      if (g[i + 1] === "*") {
        if (g[i + 2] === "/") { re += "(?:.*/)?"; i += 2; }
        else { re += ".*"; i += 1; }
      } else {
        re += "[^/]*";
      }
    } else if (ch === "?") {
      re += "[^/]";
    } else if ("\\^$.|+()[]{}".includes(ch)) {
      re += "\\" + ch;
    } else {
      re += ch;
    }
  }
  return new RegExp("^" + re + "$");
}

async function loadIgnorePatterns(directory: string): Promise<string[]> {
  try {
    const content = await readFile(join(directory, IGNORE_FILE), "utf-8");
    return content
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith("#"));
  } catch {
    return [];
  }
}

function buildIgnoreMatcher(patterns: string[]): (relPath: string) => boolean {
  const regexps = patterns.map(globToRegExp);
  if (regexps.length === 0) return () => false;
  return (relPath: string) => {
    const posix = relPath.split(sep).join("/");
    return regexps.some(re => re.test(posix));
  };
}

async function walkDir(dir: string, rootDir: string, result: ScanResult, isIgnored: (relPath: string) => boolean): Promise<void> {
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
      if (isIgnored(relPath)) continue;
      if (entry.name.endsWith(".xcassets")) { result.assetCatalogs.push(relPath); continue; }
      if (entry.name.endsWith(".xcodeproj") || entry.name.endsWith(".xcworkspace")) { result.xcodeProjects.push(relPath); continue; }
      await walkDir(fullPath, rootDir, result, isIgnored);
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      // Skip test/spec files — they contain example code that triggers false positives
      if (/\.(test|spec)\.[^.]+$/.test(entry.name)) continue;
      // Skip files matching .higauditignore / --exclude globs
      if (isIgnored(relPath)) continue;
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

  // Vue / Nuxt
  if (hasExt(".vue")) {
    if (hasConfig("nuxt.config.ts") || hasConfig("nuxt.config.js")) {
      frameworks.push("nuxt");
    } else {
      frameworks.push("vue");
    }
  }

  // Svelte / SvelteKit
  if (hasExt(".svelte")) {
    if (hasConfig("svelte.config.js") || hasConfig("svelte.config.ts")) {
      frameworks.push("sveltekit");
    } else {
      frameworks.push("svelte");
    }
  }

  // Angular
  if (hasConfig("angular.json") || configContains("package.json", "\"@angular/core\"")) {
    frameworks.push("angular");
  }

  // Flutter
  if (hasExt(".dart") || hasConfig("pubspec.yaml")) {
    frameworks.push("flutter");
  }

  // Kotlin / Jetpack Compose / Android
  if (hasExt(".kt")) {
    const hasCompose = result.codeFiles.some(f => f.content.includes("androidx.compose"));
    if (hasCompose) {
      frameworks.push("compose");
    } else {
      frameworks.push("android");
    }
  } else if (result.markupFiles.some(f => f.relativePath.endsWith(".xml") && f.content.includes("android:"))) {
    frameworks.push("android");
  }

  // Plain HTML
  if (frameworks.length === 0 && result.markupFiles.some(f => f.relativePath.endsWith(".html"))) {
    frameworks.push("html");
  }

  if (frameworks.length === 0) frameworks.push("unknown");
  return frameworks;
}

export async function scanProject(directory: string, options: ScanOptions = {}): Promise<ScanResult> {
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
  const patterns = [...(await loadIgnorePatterns(directory)), ...(options.exclude ?? [])];
  const isIgnored = buildIgnoreMatcher(patterns);
  await walkDir(directory, directory, result, isIgnored);
  result.frameworks = detectFrameworks(result);
  return result;
}
