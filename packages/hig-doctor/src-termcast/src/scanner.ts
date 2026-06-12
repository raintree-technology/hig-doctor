// scanner.ts — Framework-agnostic project scanner
import { readdir, readFile, stat } from "node:fs/promises"
import { extname, join, relative, sep } from "node:path"

export interface ScannedFile {
  relativePath: string
  absolutePath: string
  content: string
}

export type Framework =
  | "swiftui"
  | "uikit"
  | "react"
  | "nextjs"
  | "react-native"
  | "vue"
  | "nuxt"
  | "svelte"
  | "sveltekit"
  | "angular"
  | "flutter"
  | "compose"
  | "android"
  | "html"
  | "unknown"

export interface ScanResult {
  directory: string
  frameworks: Framework[]
  // Universal collections
  codeFiles: ScannedFile[]
  styleFiles: ScannedFile[]
  configFiles: ScannedFile[]
  markupFiles: ScannedFile[]
  // Swift-specific (backward compat)
  swiftFiles: ScannedFile[]
  infoPlistPaths: string[]
  assetCatalogs: string[]
  storyboards: ScannedFile[]
  xcodeProjects: string[]
  packageSwift: ScannedFile | null
}

const IGNORED_DIRS = new Set([
  ".build",
  ".git",
  "node_modules",
  "Pods",
  "DerivedData",
  ".swiftpm",
  "Carthage",
  "Build",
  ".next",
  ".nuxt",
  ".output",
  "dist",
  "build",
  ".cache",
  ".turbo",
  "coverage",
  "__pycache__",
  ".dart_tool",
  ".pub-cache",
  "android",
  "ios",
  "macos",
  "linux",
  "windows",
])

// Skip files larger than this — generated bundles, minified assets, and data
// blobs cost memory and regex time without yielding real findings. The auditor
// runs on arbitrary paths (including via the MCP server), so this is also a DoS
// guard against being pointed at a multi-GB file with a code extension.
const MAX_FILE_BYTES = 1_500_000
// Bound recursion depth so pathological or cyclic trees can't hang the walker.
const MAX_DEPTH = 25
// Skip obviously generated files regardless of size.
const GENERATED_FILE = /\.(min|bundle|chunk)\.(js|css|mjs|cjs)$/i

const CODE_EXTENSIONS = new Set([".swift", ".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte", ".dart", ".kt", ".java"])

const STYLE_EXTENSIONS = new Set([".css", ".scss", ".sass", ".less", ".styl"])

const MARKUP_EXTENSIONS = new Set([".html", ".htm", ".xml", ".storyboard", ".xib"])

const CONFIG_FILES = new Set([
  "tailwind.config.ts",
  "tailwind.config.js",
  "tailwind.config.mjs",
  "next.config.ts",
  "next.config.js",
  "next.config.mjs",
  "nuxt.config.ts",
  "nuxt.config.js",
  "svelte.config.js",
  "svelte.config.ts",
  "angular.json",
  "package.json",
  "tsconfig.json",
  "Info.plist",
  "Package.swift",
  "pubspec.yaml",
  "app.json",
  "expo.json",
  "eas.json",
  "components.json",
  "build.gradle",
  "build.gradle.kts",
  "AndroidManifest.xml",
])

export interface ScanOptions {
  /** Path globs (relative to the scanned root) to skip. Merged with `.higauditignore`. */
  exclude?: string[]
}

const IGNORE_FILE = ".higauditignore"

// Convert a path glob to an anchored predicate. Semantics (path-based, not gitignore):
//   *   → any run of characters except "/"
//   **  → any run of characters including "/"
//   **/ → zero or more leading path segments
//   ?   → a single character except "/"
// Patterns match the POSIX relative path from the scan root.
function compileGlob(glob: string): (path: string) => boolean {
  const g = glob.replace(/^\.\//, "").replace(/^\/+/, "").replace(/\/+$/, "")

  return (path: string): boolean => {
    const memo = new Map<string, boolean>()

    const matches = (patternIndex: number, pathIndex: number): boolean => {
      const key = `${patternIndex}:${pathIndex}`
      const cached = memo.get(key)
      if (cached !== undefined) return cached

      let result = false
      const ch = g[patternIndex]

      if (patternIndex === g.length) {
        result = pathIndex === path.length
      } else if (ch === "*") {
        if (g[patternIndex + 1] === "*") {
          if (g[patternIndex + 2] === "/") {
            result = matches(patternIndex + 3, pathIndex)
            for (let next = pathIndex; !result && next < path.length; next++) {
              if (path[next] === "/") result = matches(patternIndex + 3, next + 1)
            }
          } else {
            for (let next = pathIndex; !result && next <= path.length; next++) {
              result = matches(patternIndex + 2, next)
            }
          }
        } else {
          for (let next = pathIndex; !result; next++) {
            result = matches(patternIndex + 1, next)
            if (next >= path.length || path[next] === "/") break
          }
        }
      } else if (ch === "?") {
        result = pathIndex < path.length && path[pathIndex] !== "/" && matches(patternIndex + 1, pathIndex + 1)
      } else {
        result = path[pathIndex] === ch && matches(patternIndex + 1, pathIndex + 1)
      }

      memo.set(key, result)
      return result
    }

    return matches(0, 0)
  }
}

async function loadIgnorePatterns(directory: string): Promise<string[]> {
  try {
    const content = await readFile(join(directory, IGNORE_FILE), "utf-8")
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
  } catch {
    return []
  }
}

function buildIgnoreMatcher(patterns: string[]): (relPath: string) => boolean {
  const matchers = patterns.map(compileGlob)
  if (matchers.length === 0) return () => false
  return (relPath: string) => {
    const posix = relPath.split(sep).join("/")
    return matchers.some((matches) => matches(posix))
  }
}

// Read a UTF-8 file, skipping anything too large to be worth scanning. Returns
// null on oversized files or read errors so callers can simply skip.
async function readText(path: string): Promise<string | null> {
  try {
    const info = await stat(path)
    if (info.size > MAX_FILE_BYTES) return null
    return await readFile(path, "utf-8")
  } catch {
    return null
  }
}

async function walkDir(
  dir: string,
  rootDir: string,
  result: ScanResult,
  isIgnored: (relPath: string) => boolean,
  depth = 0,
): Promise<void> {
  if (depth > MAX_DEPTH) return
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relPath = relative(rootDir, fullPath)
    // Never follow symlinks: avoids escaping the scanned tree (e.g. a link to /)
    // and breaks any directory cycles.
    if (entry.isSymbolicLink()) continue
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue
      if (isIgnored(relPath)) continue
      if (entry.name.endsWith(".xcassets")) {
        result.assetCatalogs.push(relPath)
        continue
      }
      if (entry.name.endsWith(".xcodeproj") || entry.name.endsWith(".xcworkspace")) {
        result.xcodeProjects.push(relPath)
        continue
      }
      await walkDir(fullPath, rootDir, result, isIgnored, depth + 1)
    } else if (entry.isFile()) {
      const ext = extname(entry.name)
      // Skip test/spec files — they contain example code that triggers false positives
      if (/\.(test|spec)\.[^.]+$/.test(entry.name)) continue
      // Skip generated/minified files regardless of size
      if (GENERATED_FILE.test(entry.name)) continue
      // Skip files matching .higauditignore / --exclude globs
      if (isIgnored(relPath)) continue

      const isConfig = CONFIG_FILES.has(entry.name)
      const wantCode = CODE_EXTENSIONS.has(ext)
      const wantStyle = STYLE_EXTENSIONS.has(ext)
      const wantMarkup = MARKUP_EXTENSIONS.has(ext)
      if (!isConfig && !wantCode && !wantStyle && !wantMarkup) continue

      const content = await readText(fullPath)
      if (content === null) continue // oversized or unreadable — skip
      const file: ScannedFile = { relativePath: relPath, absolutePath: fullPath, content }

      // Config files are always collected (and may also be code)
      if (isConfig) {
        result.configFiles.push(file)
        if (entry.name === "Info.plist") result.infoPlistPaths.push(relPath)
        if (entry.name === "Package.swift") result.packageSwift = file
        if (wantCode) {
          result.codeFiles.push(file)
          if (ext === ".swift") result.swiftFiles.push(file)
        }
      } else if (wantCode) {
        result.codeFiles.push(file)
        if (ext === ".swift") result.swiftFiles.push(file)
      } else if (wantStyle) {
        result.styleFiles.push(file)
      } else if (wantMarkup) {
        result.markupFiles.push(file)
        if (ext === ".storyboard" || ext === ".xib") result.storyboards.push(file)
      }
    }
  }
}

function detectFrameworks(result: ScanResult): Framework[] {
  const frameworks: Framework[] = []
  const hasExt = (ext: string) => result.codeFiles.some((f) => f.relativePath.endsWith(ext))
  const hasConfig = (name: string) => result.configFiles.some((f) => f.relativePath.endsWith(name))
  const configContains = (name: string, text: string) => {
    const file = result.configFiles.find((f) => f.relativePath.endsWith(name))
    return file?.content.includes(text) ?? false
  }

  // Swift
  if (hasExt(".swift")) {
    const hasSwiftUI = result.codeFiles.some((f) => f.content.includes("import SwiftUI"))
    const hasUIKit = result.codeFiles.some((f) => f.content.includes("import UIKit"))
    if (hasSwiftUI) frameworks.push("swiftui")
    if (hasUIKit) frameworks.push("uikit")
    if (!hasSwiftUI && !hasUIKit) frameworks.push("swiftui") // default for Swift
  }

  // Next.js
  if (hasConfig("next.config.ts") || hasConfig("next.config.js") || hasConfig("next.config.mjs")) {
    frameworks.push("nextjs")
  }
  // React (not Next.js)
  else if ((hasExt(".tsx") || hasExt(".jsx")) && configContains("package.json", '"react"')) {
    // React Native
    if (configContains("package.json", '"react-native"') || hasConfig("app.json")) {
      frameworks.push("react-native")
    } else {
      frameworks.push("react")
    }
  }

  // Vue / Nuxt
  if (hasExt(".vue")) {
    if (hasConfig("nuxt.config.ts") || hasConfig("nuxt.config.js")) {
      frameworks.push("nuxt")
    } else {
      frameworks.push("vue")
    }
  }

  // Svelte / SvelteKit
  if (hasExt(".svelte")) {
    if (hasConfig("svelte.config.js") || hasConfig("svelte.config.ts")) {
      frameworks.push("sveltekit")
    } else {
      frameworks.push("svelte")
    }
  }

  // Angular
  if (hasConfig("angular.json") || configContains("package.json", '"@angular/core"')) {
    frameworks.push("angular")
  }

  // Flutter
  if (hasExt(".dart") || hasConfig("pubspec.yaml")) {
    frameworks.push("flutter")
  }

  // Kotlin / Jetpack Compose / Android
  if (hasExt(".kt")) {
    const hasCompose = result.codeFiles.some((f) => f.content.includes("androidx.compose"))
    if (hasCompose) {
      frameworks.push("compose")
    } else {
      frameworks.push("android")
    }
  } else if (result.markupFiles.some((f) => f.relativePath.endsWith(".xml") && f.content.includes("android:"))) {
    frameworks.push("android")
  }

  // Plain HTML
  if (frameworks.length === 0 && result.markupFiles.some((f) => f.relativePath.endsWith(".html"))) {
    frameworks.push("html")
  }

  if (frameworks.length === 0) frameworks.push("unknown")
  return frameworks
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
  }
  const patterns = [...(await loadIgnorePatterns(directory)), ...(options.exclude ?? [])]
  const isIgnored = buildIgnoreMatcher(patterns)
  await walkDir(directory, directory, result, isIgnored)
  result.frameworks = detectFrameworks(result)
  return result
}
