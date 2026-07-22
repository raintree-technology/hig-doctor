# Changelog

All notable changes to `hig-mcp` (the Apple HIG Model Context Protocol server)
are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-07-21

### Added

- `hig_search` — BM25 full-text search across every HIG reference topic, so
  agents find guidance by natural language instead of the skill taxonomy.
- `hig_audit_file` — audit a single file (the fast loop after writing code),
  returning per-finding rule ID, severity, fix guidance, HIG citation, and a
  machine-readable suggested edit.
- `hig_explain_finding` — full rule metadata plus an excerpt of the cited HIG
  reference, keyed by rule ID with near-match suggestions.
- Streamable HTTP transport via `--http [port]` alongside stdio.
- Structured (`structuredContent`) output on every tool.

### Changed

- The published package now bundles the skills corpus (`dist/skills`), so
  `npx hig-mcp` works with no clone; `HIG_SKILLS_DIR` becomes an optional override.
- Now built on the extracted `@hig-doctor/core` engine.

## [0.1.0] - 2026-05-28

Initial public release on npm.

### Added

- MCP stdio server exposing the HIG Doctor skills corpus and HIG auditor as
  tools for AI coding agents (Claude Desktop, Cursor, Windsurf, Claude Code).
- Tools:
  - `hig_list_skills` — enumerate available skills with descriptions and reference topics.
  - `hig_lookup` — fetch HIG reference markdown by skill, or skill + topic.
  - `hig_audit` — run the HIG compliance audit on a project directory, returning
    severity counts, a markdown report, and an optional `fail_on` pass/fail gate.
- Skills directory resolution order: `$HIG_SKILLS_DIR`, module-adjacent `skills/`,
  monorepo dev layout, then `$PWD/skills`.
- Input validation: slug arguments are checked against a kebab-case allowlist and
  `hig_audit.directory` must be absolute, before any filesystem access.
- Node 20+ distribution as an esbuild bundle (`dist/index.js`); also runs directly
  under Bun from source.

### Notes

- The published package does not bundle Apple's HIG reference content (Apple IP).
  Point `HIG_SKILLS_DIR` at a local clone's `skills/` directory.
