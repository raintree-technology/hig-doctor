# Changelog

All notable changes to `hig-mcp` (the Apple HIG Model Context Protocol server)
are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-28

Initial public release on npm.

### Added

- MCP stdio server exposing the Apple HIG Skills corpus and the HIG auditor as
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
