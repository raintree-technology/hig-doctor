<p align="center">
  <img src="https://raw.githubusercontent.com/raintree-technology/hig-doctor/main/brand/hig-doctor-mark.svg" alt="HIG Doctor" width="72" height="72" />
</p>

# HIG Doctor skill validator (internal)

Internal linter for this repository's `skills/` directory. Not intended for third-party use — the official Agent Skills reference validator is [skills-ref](https://github.com/agentskills/agentskills).

The audit CLI lives in [`packages/cli`](../cli), the rule engine in [`packages/core`](../core), and the MCP server in [`packages/mcp`](../mcp).

```bash
node packages/skill-validator/src/cli.js . --verbose --strict
```

## What it checks

- `SKILL.md` existence and max line count
- YAML frontmatter fields (`name`, `version`, `description`)
- Naming and semver constraints
- Required section profiles for standard skills vs `hig-project-context`
- `.claude/apple-design-context.md` context-check guidance hint
- `references/` integrity (missing links and unreferenced files)
- `VERSIONS.md` consistency and duplicate rows
- `.claude-plugin/marketplace.json` skill path validity and set matching
- `README.md` skill table drift vs actual `skills/*`

## Options

| Flag | Description |
|------|-------------|
| `--json` | Output full JSON report |
| `--score` | Output 0-100 score only |
| `--strict` | Fail on warnings as well as errors |
| `--verbose` | Include warnings in text output |
| `--tui` | Open interactive Ink terminal UI |
