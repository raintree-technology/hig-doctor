# HIG Doctor agent instructions

HIG Doctor combines open-source audit tooling with an attributed snapshot of Apple's
Human Interface Guidelines.

- Keep Apple-platform rules distinguishable from HIG-aligned cross-platform rules.
- Preserve source URLs and attribution in every reference file.
- Treat Apple's live HIG as canonical; drift detection proposes review and must not
  rewrite guidance automatically.
- `packages/core` owns framework detection, the audit rule catalog, structural
  engines, and the audit pipeline. The CLI, MCP server, website, and demos must
  consume that package or generate from it; do not maintain copied audit engines
  or rule catalogs.
- After an audit-engine or rule-catalog change, run
  `bun run --cwd demos/remotion-hig-doctor generate-data` and inspect the generated
  report diff before validation.
- Add a focused fixture and test for every detection-rule behavior change.
- Keep file scanning bounded and preserve symlink, size, and recursion safeguards.
- Use Bun 1.3.11 and Node 24 through Mise.
- Run `bun run validate` while iterating and `bun run validate:full` for release-facing
  changes.
