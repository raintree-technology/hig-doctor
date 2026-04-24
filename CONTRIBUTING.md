# Contributing

Guide for adding skills, updating reference content, proposing new audit rules, and extending the MCP server.

## Requesting a change

Open an issue at https://github.com/raintree-technology/apple-hig-skills/issues/new for new skills, audit rules, MCP tools, or content corrections.

## Working on skills

### Improving an existing skill

1. Read `SKILL.md` and its `references/` files end to end.
2. Check reference content against Apple's live HIG for drift. Update only what has changed.
3. Preserve the attribution block and canonical `source:` URL in the frontmatter.
4. Bump the skill's row in `VERSIONS.md` (minor for content updates, major for structural changes).

### Adding a new skill

Create the directory, write a `SKILL.md` under 500 lines with required sections, and add reference files under `references/`. Every skill must include:

- **Frontmatter** — `name` (must match directory name exactly, kebab-case, `hig-` prefix), `version` (semver), `description` (1-1024 chars, include trigger phrases and cross-references).
- **Body sections** — Key Principles, Reference Index, Output Format, Questions to Ask, Related Skills.
- **Context-check hint** — `Check for .claude/apple-design-context.md before asking questions.`

```
skills/hig-your-topic/
├── SKILL.md
└── references/
    ├── topic-a.md
    └── topic-b.md
```

After editing, run the validator:

```bash
npm --prefix packages/hig-doctor install
node packages/hig-doctor/src/cli.js . --verbose --strict
```

### Running the legal-hardening pass

Reference files have a uniform attribution block and must not embed Apple-hosted images. If a re-scan adds new files or content, run:

```bash
bun scripts/legal-hardening.ts
```

The script is idempotent and rewrites the attribution block in place.

## Working on the audit CLI

Source: [packages/hig-doctor/src-termcast/](packages/hig-doctor/src-termcast/)

### Adding a detection rule

1. Add a `PatternRule` to the relevant framework array in [patterns.ts](packages/hig-doctor/src-termcast/src/patterns.ts). Use a clear, unique `pattern` name — the severity classifier keys on it.
2. For concern rules that are accessibility-breaking, add the pattern name to `CRITICAL_CONCERNS`. For rules that cause significant UX degradation, add to `SERIOUS_CONCERNS`. Otherwise the rule defaults to `moderate`.
3. Use `skipInBlock` for context-aware CSS rules (e.g., `outline: none` inside `:focus:not(:focus-visible)`).
4. Add a matching test case to [patterns.test.ts](packages/hig-doctor/src-termcast/src/patterns.test.ts).
5. Run `bun test` in `packages/hig-doctor/src-termcast/`.

### Mapping a rule to a category

Rules use `category` + `subcategory` fields. If a rule belongs to a new category, update `CATEGORY_TO_SKILL` and `CATEGORY_LABELS` in [categorizer.ts](packages/hig-doctor/src-termcast/src/categorizer.ts).

### Smoke-test on real projects

```bash
cd packages/hig-doctor/src-termcast
bun run audit ../../../website
bun run audit ../../../website --fail-on critical
bun run audit ../../../website --json | jq '.severities'
```

## Working on the MCP server

Source: [packages/hig-doctor/src-mcp/](packages/hig-doctor/src-mcp/)

### Adding a tool

1. Add a new tool entry to the `ListToolsRequestSchema` handler with name, description, and JSON Schema for `inputSchema`.
2. Add the matching branch to the `CallToolRequestSchema` handler.
3. Validate inputs (use `assertSlug` for path-safe identifiers).
4. Test with a stdio handshake:

```bash
cd packages/hig-doctor/src-mcp
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0"}}}\n{"jsonrpc":"2.0","method":"notifications/initialized"}\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"your_tool","arguments":{}}}\n' | bun src/index.ts
```

## Before opening a PR

```bash
# Skills
node packages/hig-doctor/src/cli.js . --verbose --strict

# Audit
cd packages/hig-doctor/src-termcast && bun test

# MCP handshake smoke
cd packages/hig-doctor/src-mcp && bun install

# Security checks
npm test
```

## PR checklist

- [ ] Skill `name` matches directory name, `hig-` prefix, valid kebab-case
- [ ] Skill `description` includes trigger phrases and cross-references
- [ ] `SKILL.md` is under 500 lines
- [ ] Reference index table covers all files in `references/`
- [ ] Audit rules have tests and a clear `pattern` name
- [ ] Concern severity is classified (critical/serious in the allow-set, moderate otherwise)
- [ ] MCP tool descriptions include when to use the tool
- [ ] `VERSIONS.md` updated for skill content changes
- [ ] No new Apple-hosted image URLs (run `bun scripts/legal-hardening.ts`)
- [ ] Tests pass: `npm test` and `bun test` in the audit package
