# Apple HIG Skills Versions

Current versions of all skills. Agents can compare against local versions to check for updates.

| Skill | Version | Last Updated |
|-------|---------|--------------|
| hig-project-context | 1.0.0 | 2025-02-02 |
| hig-platforms | 1.0.0 | 2025-02-02 |
| hig-foundations | 1.0.0 | 2025-02-02 |
| hig-patterns | 1.0.0 | 2025-02-02 |
| hig-components-content | 1.0.0 | 2025-02-02 |
| hig-components-layout | 1.0.0 | 2025-02-02 |
| hig-components-menus | 1.0.0 | 2025-02-02 |
| hig-components-search | 1.0.0 | 2025-02-02 |
| hig-components-dialogs | 1.0.0 | 2025-02-02 |
| hig-components-controls | 1.0.0 | 2025-02-02 |
| hig-components-status | 1.0.0 | 2025-02-02 |
| hig-components-system | 1.0.0 | 2025-02-02 |
| hig-inputs | 1.0.0 | 2025-02-02 |
| hig-technologies | 1.0.0 | 2025-02-02 |

## HIG Source

Content sourced from [Apple's Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) as of February 2, 2025.

## Recent Changes

### 2026-04-24
- **Tooling rework** (no change to skill content versions):
  - Audit CLI replaces the 0-100 score with severity buckets (critical/serious/moderate) and a `--fail-on` CI gate.
  - New MCP stdio server at `packages/hig-doctor/src-mcp/` exposing `hig_list_skills`, `hig_lookup`, and `hig_audit`.
  - GitHub Action repositioned from the internal skill validator to the audit CLI.
  - Website ships `/llms.txt` and `/raw/<slug>` agent-consumable endpoints.
  - Annual post-WWDC re-scan workflow opens a tracking issue each June 20.
  - Legal hardening pass: stripped 1,442 Apple-hosted image references across all 156 reference files and inserted a uniform attribution block under each frontmatter.

### 2025-02-02
- Initial release with 14 skills covering the complete Apple HIG plus project context management
