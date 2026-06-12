# Contributing

Guide for adding skills, updating reference content, proposing new audit rules, and extending the MCP server.

## Requesting a change

Open an issue at https://github.com/raintree-technology/hig-doctor/issues/new for new skills, audit rules, MCP tools, or content corrections.

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
bun install --frozen-lockfile
node packages/hig-doctor/src/cli.js . --verbose --strict
```

### Running the legal-hardening pass

Reference files have a uniform attribution block and must not embed Apple-hosted images. If a re-scan adds new files or content, run:

```bash
bun scripts/legal-hardening.ts
```

The script is idempotent and rewrites the attribution block in place.

For a deeper transform that drops Apple's expository prose — keeping only headings, bold "principle" sentences, and list items — use the separate deep pass. It is destructive, so it dry-runs by default; review the diff before applying:

```bash
bun scripts/legal-hardening-deep.ts          # dry-run: prints a diff summary
bun scripts/legal-hardening-deep.ts --apply   # writes the transform
```

## Working on the audit CLI

Source: [packages/hig-doctor/src-termcast/](packages/hig-doctor/src-termcast/)

### Adding a detection rule

1. Add a `PatternRule` to the relevant framework array in [patterns.ts](packages/hig-doctor/src-termcast/src/patterns.ts). Use a clear, unique `pattern` name — the severity classifier keys on it.
2. For concern rules that are accessibility-breaking, add the pattern name to `CRITICAL_CONCERNS`. For rules that cause significant UX degradation, add to `SERIOUS_CONCERNS`. Otherwise the rule defaults to `moderate`.
3. Use `skipInBlock` for context-aware CSS rules (e.g., `outline: none` inside `:focus:not(:focus-visible)`).
4. Add a matching test case to [patterns.test.ts](packages/hig-doctor/src-termcast/src/patterns.test.ts).
5. Run `bun run test:audit` from the repository root.

### Mapping a rule to a category

Rules use `category` + `subcategory` fields. If a rule belongs to a new category, update `CATEGORY_TO_SKILL` and `CATEGORY_LABELS` in [categorizer.ts](packages/hig-doctor/src-termcast/src/categorizer.ts).

### Smoke-test on real projects

```bash
bun run --cwd packages/hig-doctor/src-termcast audit website
bun run --cwd packages/hig-doctor/src-termcast audit website --fail-on critical
bun run --cwd packages/hig-doctor/src-termcast audit website --json | jq '.severities'
```

## Working on the MCP server

Source: [packages/hig-doctor/src-mcp/](packages/hig-doctor/src-mcp/)

### Adding a tool

1. Add a new tool entry to the `ListToolsRequestSchema` handler with name, description, and JSON Schema for `inputSchema`.
2. Add the matching branch to the `CallToolRequestSchema` handler.
3. Validate inputs (use `assertSlug` for path-safe identifiers).
4. Test with a stdio handshake:

```bash
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0"}}}\n{"jsonrpc":"2.0","method":"notifications/initialized"}\n{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"your_tool","arguments":{}}}\n' | bun packages/hig-doctor/src-mcp/src/index.ts
```

## Before opening a PR

```bash
# Skills
node packages/hig-doctor/src/cli.js . --verbose --strict

# Audit
bun run test:audit

# MCP handshake smoke
bun run smoke

# Security checks
bun run test
```

## Releasing

There are **five independent version surfaces**; do not assume one bump implies another:

| Surface | Version lives in | Tracks |
|---------|------------------|--------|
| Audit CLI (`hig-doctor` on npm) | `packages/hig-doctor/src-termcast/package.json` | CLI + audit engine |
| MCP server (`hig-mcp` on npm) | `packages/hig-doctor/src-mcp/package.json` | MCP server |
| Skill validator | `packages/hig-doctor/package.json` (`private`, unpublished) | internal tooling |
| Skill content | `VERSIONS.md` + each `SKILL.md` `version` | HIG reference corpus only |
| Plugin marketplace | `.claude-plugin/marketplace.json` | Claude Code plugin |

**`VERSIONS.md` tracks skill *content* only** — it is unrelated to the npm package versions, which release on their own cadence.

### Publishing an npm package

Both npm packages publish via GitHub Actions using npm **trusted publishing** (OIDC + provenance — no long-lived token). To cut a release:

1. Bump `version` in that package's `package.json`.
2. Add a dated entry to that package's `CHANGELOG.md`.
3. Open a PR; merge once CI is green.
4. Tag the merge commit and push the tag. **The tag prefix selects the package and its version must match the manifest:**
   - Audit CLI → `hig-doctor-v<version>` (e.g. `hig-doctor-v1.2.0`) → runs `publish-hig-doctor.yml`
   - MCP server → `hig-mcp-v<version>` (e.g. `hig-mcp-v0.2.0`) → runs `publish-hig-mcp.yml`

```bash
git tag hig-doctor-v1.2.0 && git push origin hig-doctor-v1.2.0
```

A bare `vX.Y.Z` tag triggers **nothing** — only the prefixed patterns above are wired to a publish workflow. Either workflow can also be run manually via **workflow_dispatch** for a re-run.

> Note: the publish workflows assert that the pushed tag's version matches `package.json` and that the package version is not already published to npm.

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
- [ ] Tests pass: `bun run test`
