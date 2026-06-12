#!/usr/bin/env node

import { readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { diagnose } from "./doctor.js"
import { formatTextResult } from "./format.js"

const getCliVersion = () => {
  const packageJsonPath = new URL("../package.json", import.meta.url)
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
  const version = packageJson?.version

  if (typeof version !== "string" || version.length === 0) {
    throw new Error("Unable to resolve package version from package.json")
  }

  return version
}

const printHelp = () => {
  process.stdout.write(
    `Usage: hig-doctor [directory] [options]

Options:
  -v, --version  display version
  --json         output full JSON report
  --score        output only the score
  --strict       treat warnings as failures
  --verbose      show warnings in text output
  --tui          open interactive Ink terminal UI
  -h, --help     display help
`,
  )
}

const parseArgs = (argv) => {
  const flags = {
    json: false,
    score: false,
    strict: false,
    verbose: false,
    tui: false,
  }
  let directory = "."
  let sawDirectory = false

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (token === "-h" || token === "--help") {
      flags.help = true
      continue
    }
    if (token === "-v" || token === "--version") {
      flags.version = true
      continue
    }
    if (token === "--json") {
      flags.json = true
      continue
    }
    if (token === "--score") {
      flags.score = true
      continue
    }
    if (token === "--strict") {
      flags.strict = true
      continue
    }
    if (token === "--verbose") {
      flags.verbose = true
      continue
    }
    if (token === "--tui") {
      flags.tui = true
      continue
    }
    if (token.startsWith("-")) {
      throw new Error(`Unknown option: ${token}`)
    }
    if (sawDirectory) {
      throw new Error(`Unexpected argument: ${token}`)
    }
    directory = token
    sawDirectory = true
  }

  return {
    directory: path.resolve(directory),
    flags,
  }
}

const ensureCompatibleFlagCombination = (flags) => {
  if (!flags.tui) return

  if (flags.json || flags.score) {
    throw new Error("--tui cannot be combined with --json or --score")
  }

  if (!process.stdout.isTTY || !process.stdin.isTTY) {
    throw new Error("--tui requires an interactive TTY terminal")
  }
}

const runTui = async (result) => {
  try {
    const { runTui: runTuiMode } = await import("./tui.js")
    await runTuiMode(result)
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Cannot find package 'ink'") ||
        error.message.includes("Cannot find module 'ink'") ||
        error.message.includes("Cannot find package 'react'") ||
        error.message.includes("Cannot find module 'react'"))
    ) {
      throw new Error(
        "TUI dependencies are missing. Run 'bun install --frozen-lockfile' from the repository root or install the published package dependencies.",
      )
    }

    throw error
  }
}

const main = async () => {
  try {
    const { directory, flags } = parseArgs(process.argv.slice(2))

    if (flags.help) {
      printHelp()
      return
    }

    if (flags.version) {
      process.stdout.write(`${getCliVersion()}\n`)
      return
    }

    ensureCompatibleFlagCombination(flags)

    const result = await diagnose(directory, { strict: flags.strict })

    if (flags.tui) {
      await runTui(result)
    } else if (flags.score) {
      process.stdout.write(`${result.summary.score}\n`)
    } else if (flags.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    } else {
      process.stdout.write(`${formatTextResult(result, { verbose: flags.verbose })}\n`)
    }

    if (!result.summary.passed) {
      process.exitCode = 1
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`hig-doctor: ${message}\n`)
    process.exitCode = 1
  }
}

await main()
