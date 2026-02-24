# hig-doctor

Diagnose Apple HIG skill repositories for schema, structure, and repository consistency issues.

## What It Checks

- `SKILL.md` existence and max line count
- YAML frontmatter fields (`name`, `version`, `description`)
- naming and semver constraints
- required section profiles for standard skills vs `hig-project-context`
- `.claude/apple-design-context.md` context-check guidance hint
- `references/` integrity (missing links and unreferenced files)
- `VERSIONS.md` consistency and duplicate rows
- `.claude-plugin/marketplace.json` skill path validity and set matching
- `README.md` skill table drift vs actual `skills/*`

## Install

```bash
npx -y hig-doctor@latest . --verbose
```

## Usage

```bash
hig-doctor [directory] [options]
```

Options:

- `--json` output full JSON report
- `--score` output score only
- `--strict` fail on warnings as well as errors
- `--verbose` include warnings in text output
- `--tui` open interactive Ink terminal UI

## TUI Controls

- `j` / `k` or arrow keys: move selection
- `f`: cycle filter (`all`, `errors`, `warnings`)
- `g`: toggle grouping (`scope` vs severity-first)
- `q`: quit

## GitHub Action

```yaml
- uses: actions/checkout@v4
- uses: raintree-technology/apple-hig-skills@main
  with:
    directory: .
    verbose: "true"
    strict: "true"
```

## Publishing

Repository workflow: `.github/workflows/publish-hig-doctor.yml`

- Trigger manually with Actions UI, or
- Push a tag like `hig-doctor-v0.2.0`

Set `NPM_TOKEN` in repository secrets before publishing.

## Node API

```js
import { diagnose } from "hig-doctor";

const result = await diagnose(".", { strict: false });
console.log(result.summary);
```
