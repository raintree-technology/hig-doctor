# hig-mcp

Model Context Protocol stdio server that exposes the [Apple HIG Skills](https://github.com/raintree-technology/apple-hig-skills) corpus and the universal HIG compliance auditor as tools for AI coding agents.

Runs under Node 20+ (after build) or Bun (directly from source). Works with Claude Desktop, Cursor, Windsurf, and Claude Code.

## Tools

| Tool | Purpose |
|------|---------|
| `hig_list_skills` | Enumerate available skills with descriptions and reference topics. Call first to discover the corpus. |
| `hig_lookup` | Fetch HIG reference markdown. Provide a skill name (e.g. `hig-foundations`) or skill + topic (e.g. `skill=hig-foundations, topic=color`). |
| `hig_audit` | Run the HIG compliance audit on a project directory. Returns severity counts (critical/serious/moderate), a markdown report, and an optional pass/fail gate via `fail_on`. |

All output is JSON or markdown text. Content is from Apple's HIG, snapshot dated 2025-02-02; canonical source at https://developer.apple.com/design/human-interface-guidelines/.

## Install

### Via git clone (recommended while unpublished)

```bash
git clone https://github.com/raintree-technology/apple-hig-skills.git
cd apple-hig-skills/packages/hig-doctor/src-mcp
bun install  # or: npm install
```

Run directly with Bun (no build):

```bash
bun src/index.ts
```

Or build for Node:

```bash
npm run build   # writes dist/index.js (bundled, Node 20+)
node dist/index.js
```

### Via npm (once published)

```bash
npm install -g hig-mcp
HIG_SKILLS_DIR=/path/to/apple-hig-skills/skills hig-mcp
```

The published npm package does **not** bundle the skills corpus (Apple IP — kept pinned to the git repository). Set `HIG_SKILLS_DIR` to a local clone's `skills/` directory.

## Claude Desktop config

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hig-doctor": {
      "command": "bun",
      "args": [
        "/absolute/path/to/apple-hig-skills/packages/hig-doctor/src-mcp/src/index.ts"
      ]
    }
  }
}
```

Or if using the built Node artifact:

```json
{
  "mcpServers": {
    "hig-doctor": {
      "command": "node",
      "args": [
        "/absolute/path/to/apple-hig-skills/packages/hig-doctor/src-mcp/dist/index.js"
      ],
      "env": {
        "HIG_SKILLS_DIR": "/absolute/path/to/apple-hig-skills/skills"
      }
    }
  }
}
```

## Cursor / Windsurf / Claude Code

All three honor the MCP stdio protocol via each editor's `mcpServers` config. Point `command` and `args` at the Bun or Node entry point above.

## Skills directory resolution

The server resolves the skills corpus in this order:

1. `$HIG_SKILLS_DIR` — explicit override
2. `<module-dir>/skills` — bundled alongside the built artifact (not used for the npm distribution)
3. Monorepo dev layout — `../../../../skills` from the source file
4. `$PWD/skills` — current working directory

If none match, tool calls throw a clear error telling the user to set `HIG_SKILLS_DIR`.

## Smoke-test the server

Send a handshake + `tools/list` request over stdio:

```bash
(
  printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0"}}}\n'
  printf '{"jsonrpc":"2.0","method":"notifications/initialized"}\n'
  printf '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}\n'
  sleep 1
) | bun src/index.ts
```

You should see one response confirming protocol version and a second listing `hig_list_skills`, `hig_lookup`, and `hig_audit`.

## Input validation

Slug arguments (`skill`, `topic`) are validated against a kebab-case allowlist (`/^[a-z0-9-]+$/`) before being used to construct filesystem paths. `hig_audit.directory` must be an absolute path. Invalid inputs throw before any filesystem access.

## License

MIT for this package. Apple HIG reference content read by `hig_lookup` is © Apple Inc. — see the repository root [LICENSE](../../../LICENSE) for the full attribution.
