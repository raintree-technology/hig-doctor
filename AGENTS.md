# HIG Doctor agent instructions

HIG Doctor combines open-source audit tooling with an attributed snapshot of Apple's
Human Interface Guidelines.

- Keep Apple-platform rules distinguishable from HIG-aligned cross-platform rules.
- Preserve source URLs and attribution in every reference file.
- Treat Apple's live HIG as canonical; drift detection proposes review and must not
  rewrite guidance automatically.
- Add a focused fixture and test for every detection-rule behavior change.
- Keep file scanning bounded and preserve symlink, size, and recursion safeguards.
- Use Bun 1.3.11 and Node 24 through Mise.
- Run `bun run validate` while iterating and `bun run validate:full` for release-facing
  changes.
