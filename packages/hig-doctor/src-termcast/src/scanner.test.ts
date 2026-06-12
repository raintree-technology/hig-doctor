// scanner.test.ts
import { describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { scanProject } from "./scanner"

describe("scanProject", () => {
  test("discovers swift files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await writeFile(join(dir, "ContentView.swift"), "import SwiftUI\nstruct ContentView: View {}")
      const result = await scanProject(dir)
      expect(result.swiftFiles.length).toBe(1)
      expect(result.swiftFiles[0].relativePath).toBe("ContentView.swift")
      expect(result.codeFiles.length).toBe(1)
      expect(result.frameworks).toContain("swiftui")
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  test("discovers TSX/JSX files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await writeFile(join(dir, "App.tsx"), "export default function App() { return <div/> }")
      await writeFile(join(dir, "package.json"), '{"dependencies":{"react":"^19"}}')
      const result = await scanProject(dir)
      expect(result.codeFiles.length).toBe(1)
      expect(result.codeFiles[0].relativePath).toBe("App.tsx")
      expect(result.configFiles.length).toBe(1)
      expect(result.frameworks).toContain("react")
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  test("discovers CSS files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await writeFile(join(dir, "globals.css"), "body { color: var(--foreground) }")
      const result = await scanProject(dir)
      expect(result.styleFiles.length).toBe(1)
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  test("detects Next.js framework", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await writeFile(join(dir, "next.config.ts"), "export default {}")
      await writeFile(join(dir, "page.tsx"), "<main>Hello</main>")
      const result = await scanProject(dir)
      expect(result.frameworks).toContain("nextjs")
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  test("discovers Info.plist", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await writeFile(join(dir, "Info.plist"), "<plist></plist>")
      const result = await scanProject(dir)
      expect(result.infoPlistPaths.length).toBe(1)
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  test("discovers xcassets directories", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await mkdir(join(dir, "Assets.xcassets"), { recursive: true })
      const result = await scanProject(dir)
      expect(result.assetCatalogs.length).toBe(1)
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  test("ignores .build, node_modules, and .next directories", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await mkdir(join(dir, ".build"), { recursive: true })
      await writeFile(join(dir, ".build", "Generated.swift"), "// generated")
      await mkdir(join(dir, "node_modules"), { recursive: true })
      await writeFile(join(dir, "node_modules", "lib.js"), "module.exports = {}")
      await mkdir(join(dir, ".next"), { recursive: true })
      await writeFile(join(dir, ".next", "build.js"), "// build")
      await writeFile(join(dir, "App.swift"), "import SwiftUI")
      const result = await scanProject(dir)
      expect(result.swiftFiles.length).toBe(1)
      expect(result.codeFiles.length).toBe(1)
    } finally {
      await rm(dir, { recursive: true })
    }
  })
})

describe("scanProject — ignore patterns", () => {
  test("--exclude option skips a matching file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await writeFile(join(dir, "App.tsx"), "export default function App() { return <div/> }")
      await writeFile(join(dir, "fixtures.tsx"), "const bad = `<img src='x' />`")
      const result = await scanProject(dir, { exclude: ["fixtures.tsx"] })
      const paths = result.codeFiles.map((f) => f.relativePath)
      expect(paths).toContain("App.tsx")
      expect(paths).not.toContain("fixtures.tsx")
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  test(".higauditignore file is honored", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await writeFile(join(dir, "App.tsx"), "export default function App() { return <div/> }")
      await writeFile(join(dir, "samples.tsx"), "const bad = `<button></button>`")
      await writeFile(join(dir, ".higauditignore"), "# demo fixtures\nsamples.tsx\n")
      const result = await scanProject(dir)
      const paths = result.codeFiles.map((f) => f.relativePath)
      expect(paths).toContain("App.tsx")
      expect(paths).not.toContain("samples.tsx")
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  test("** glob matches nested files at any depth", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await mkdir(join(dir, "a", "b"), { recursive: true })
      await writeFile(join(dir, "keep.ts"), "export const x = 1")
      await writeFile(join(dir, "a", "b", "demo.stories.tsx"), "export const s = 1")
      const result = await scanProject(dir, { exclude: ["**/*.stories.tsx"] })
      const paths = result.codeFiles.map((f) => f.relativePath)
      expect(paths).toContain("keep.ts")
      expect(paths.some((p) => p.endsWith("demo.stories.tsx"))).toBe(false)
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  test("directory pattern prunes the whole subtree", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await mkdir(join(dir, "examples"), { recursive: true })
      await writeFile(join(dir, "examples", "Bad.tsx"), "const bad = `<img src='x'/>`")
      await writeFile(join(dir, "Good.tsx"), "export const ok = 1")
      const result = await scanProject(dir, { exclude: ["examples"] })
      const paths = result.codeFiles.map((f) => f.relativePath)
      expect(paths).toContain("Good.tsx")
      expect(paths.some((p) => p.startsWith("examples"))).toBe(false)
    } finally {
      await rm(dir, { recursive: true })
    }
  })

  test("a single * does not cross directory boundaries", async () => {
    const dir = await mkdtemp(join(tmpdir(), "hig-test-"))
    try {
      await mkdir(join(dir, "nested"), { recursive: true })
      await writeFile(join(dir, "top.ts"), "export const a = 1")
      await writeFile(join(dir, "nested", "deep.ts"), "export const b = 2")
      // "*.ts" should match only top-level .ts, not nested/deep.ts
      const result = await scanProject(dir, { exclude: ["*.ts"] })
      const paths = result.codeFiles.map((f) => f.relativePath)
      expect(paths).not.toContain("top.ts")
      expect(paths.some((p) => p.endsWith("deep.ts"))).toBe(true)
    } finally {
      await rm(dir, { recursive: true })
    }
  })
})
