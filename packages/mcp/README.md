<p align="center">
  <img src="https://raw.githubusercontent.com/raintree-technology/hig-doctor/main/brand/hig-doctor-mark.svg" alt="HIG Doctor" width="72" height="72" />
</p>

# HIG Doctor MCP server

Model Context Protocol server that exposes the [HIG Doctor](https://github.com/raintree-technology/hig-doctor) skills corpus and universal HIG compliance auditor as tools for AI coding agents.

Runs under Node 20+ (after build) or Bun (directly from source). Works with Claude Desktop, Cursor, Windsurf, and Claude Code. Transports: stdio (default) and streamable HTTP (`--http`).

## Tools

| Tool | Purpose |
|------|---------|
| `hig_list_skills` | Enumerate available skills with descriptions and reference topics. Call first to discover the corpus. |
| `hig_lookup` | Fetch HIG reference markdown. Provide a skill name (e.g. `hig-foundations`) or skill + topic (e.g. `skill=hig-foundations, topic=color`). |
| `hig_search` | BM25 full-text search across every reference topic. Ask in natural language (e.g. "minimum touch target size") and get ranked topics with snippets. |
| `hig_audit` | Run the HIG compliance audit on a project directory. Returns severity counts, per-category breakdown, a markdown report, config/baseline status, and an optional `fail_on` gate. |
| `hig_audit_file` | Audit a single file — the fast inner loop after writing or editing code. Returns each finding with rule ID, severity, line, fix guidance, and HIG citation. |
| `hig_explain_finding` | Explain a finding: full rule metadata plus an excerpt of the cited Apple HIG reference. Pass a `ruleId` from an audit result. |

Every tool returns `structuredContent` (parsed JSON) alongside the text mirror, so agents can consume structure directly. Content is from Apple's HIG, snapshot dated 2025-02-02; canonical source at https://developer.apple.com/design/human-interface-guidelines/.

## Install

### Via npx (no clone)

The published package bundles the HIG skills corpus, so it runs with zero configuration:

```bash
npx hig-mcp
```

### Via git clone

```bash
git clone https://github.com/raintree-technology/hig-doctor.git
cd hig-doctor/packages/mcp
bun install            # or: npm install
bun src/index.ts       # run directly (no build), or:
npm run build && node dist/index.js
```

## Claude Desktop config

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hig-doctor": {
      "command": "npx",
      "args": ["-y", "hig-mcp"]
    }
  }
}
```

For a local checkout, point `command`/`args` at the Bun source (`bun /abs/path/packages/mcp/src/index.ts`) or the built Node artifact (`node /abs/path/packages/mcp/dist/index.js`).

## Streamable HTTP transport

For remote or multi-client setups, start the server over HTTP instead of stdio:

```bash
hig-mcp --http 3845      # POST /mcp on the given port (default 3845)
```

Each request is handled statelessly, so concurrent clients are safe.

## Cursor / Windsurf / Claude Code

All honor the MCP stdio protocol via each editor's `mcpServers` config. Point `command`/`args` at `npx hig-mcp`, or at the Bun/Node entry point of a local checkout.

## Skills directory resolution

The server resolves the skills corpus in this order:

1. `$HIG_SKILLS_DIR` — explicit override (point at a newer local copy)
2. `<module-dir>/skills` — bundled alongside the built artifact (the npm distribution)
3. Monorepo dev layout — `../../../skills` from the source file
4. `$PWD/skills` — current working directory

The published npm package bundles the corpus at `dist/skills`, so `$HIG_SKILLS_DIR` is only needed to override it.

## Input validation

Slug arguments (`skill`, `topic`) are validated against a kebab-case allowlist (`/^[a-z0-9-]+$/`) before being used to construct filesystem paths. `hig_audit.directory` and `hig_audit_file.file` must be absolute paths. Invalid inputs throw before any filesystem access.

## License

MIT for this package. Apple HIG reference content read by `hig_lookup`/`hig_search` is © Apple Inc. — see the repository root [LICENSE](../../../LICENSE) for the full attribution.
