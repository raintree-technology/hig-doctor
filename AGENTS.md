# AGENTS.md

Guidelines for AI agents working in this repository.

## Repository Overview

This repository contains **Agent Skills** following the [Agent Skills specification](https://agentskills.io/specification). It provides Apple Human Interface Guidelines reference material structured for AI agent consumption.

- **Name**: Apple HIG Skills
- **Creator**: Raintree
- **GitHub**: [raintree-technology/hig-doctor](https://github.com/raintree-technology/hig-doctor)
- **License**: MIT (structure); Apple HIG content is Apple's IP
- **Source**: [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) (February 2025)

## Repository Structure

```
hig-doctor/
├── .claude-plugin/
│   └── marketplace.json       # Claude Code plugin marketplace manifest
├── packages/
│   └── hig-doctor/
│       ├── src/               # Skill validator (Node.js, npm; internal/unpublished)
│       ├── src-termcast/      # HIG audit CLI — published to npm as `hig-doctor` (TypeScript, Bun)
│       │   └── src/
│       │       ├── cli.ts     # CLI entry point
│       │       ├── audit.ts   # Orchestrator
│       │       ├── scanner.ts # Project file walker + framework detection
│       │       ├── patterns.ts # Detection rules across 12 frameworks (count = RULE_COUNT)
│       │       ├── categorizer.ts # Maps patterns to HIG categories
│       │       └── audit-generator.ts # Markdown report builder
│       └── src-mcp/           # MCP stdio server — published to npm as `hig-mcp` (TypeScript, Bun)
│           └── src/index.ts   # Tools: hig_list_skills, hig_lookup, hig_audit
├── demos/
│   └── remotion-hig-doctor/   # Remotion video demo of audit output
├── skills/                    # Agent Skills (14 skills)
│   └── skill-name/
│       ├── SKILL.md           # Required skill file (<500 lines)
│       └── references/        # HIG content files loaded on demand
├── website/                   # Next.js marketing site
├── scripts/                   # Legal-hardening passes over scraped HIG content
│   ├── legal-hardening.ts      # Strip Apple CDN images + insert attribution block (idempotent)
│   └── legal-hardening-deep.ts # Keep headings + bold principles, drop Apple prose (destructive)
├── AGENTS.md                  # This file
├── CLAUDE.md -> AGENTS.md     # Symlink for Claude Code
├── CONTRIBUTING.md
├── VERSIONS.md
├── LICENSE
└── README.md
```

## Build / Lint / Test Commands

### HIG Audit (universal project scanner)
- Install audit dependencies:
  - `bun install --frozen-lockfile`
- Audit a project:
  - `bun run --cwd packages/hig-doctor/src-termcast audit <directory>`
- Export full report:
  - `bun run --cwd packages/hig-doctor/src-termcast audit <directory> --export`
- JSON output (for CI):
  - `bun run --cwd packages/hig-doctor/src-termcast audit <directory> --json`
- Run audit tests:
  - `bun run test:audit`

### Skill Validator (repository lint)
- Install doctor package dependencies (for local TUI mode):
  - `bun install --frozen-lockfile`
- Validate all skills:
  - `node packages/hig-doctor/src/cli.js . --verbose`
- Output score only (for CI/action outputs):
  - `node packages/hig-doctor/src/cli.js . --score`
- Interactive TUI mode:
  - `node packages/hig-doctor/src/cli.js . --tui`
- Run validator tests:
  - `bun run test:validator`

### MCP Server (`hig-mcp`)
- Install MCP dependencies:
  - `bun install --frozen-lockfile`
- Run the server over stdio (dev):
  - `bun packages/hig-doctor/src-mcp/src/index.ts`
- Build the publishable bundle:
  - `bun run --cwd packages/hig-doctor/src-mcp build`
- When running outside the repo, point it at the skills directory:
  - `HIG_SKILLS_DIR=/path/to/skills hig-mcp`

### Repository-wide guard tests
- Run from the repo root (workflow security + audit-patterns sync):
  - `bun run test:guards`

## Agent Skills Specification

Skills follow the [Agent Skills spec](https://agentskills.io/specification).

### Required Frontmatter

```yaml
---
name: skill-name
version: 1.0.0
description: What this skill does and when to use it. Include trigger phrases.
---
```

### Frontmatter Field Constraints

| Field         | Required | Constraints                                                      |
|---------------|----------|------------------------------------------------------------------|
| `name`        | Yes      | 1-64 chars, lowercase `a-z`, numbers, hyphens. Must match dir.   |
| `version`     | Yes      | Semver string (e.g., `1.0.0`). Must match VERSIONS.md.          |
| `description` | Yes      | 1-1024 chars. Describe what it does and when to use it.          |
| `license`     | No       | License name (default: MIT)                                      |
| `metadata`    | No       | Key-value pairs (author, version, etc.)                          |

### Name Field Rules

- Lowercase letters, numbers, and hyphens only
- Cannot start or end with hyphen
- No consecutive hyphens (`--`)
- Must match parent directory name exactly

### Skill Structure

```
skills/skill-name/
├── SKILL.md        # Required - main instructions (<500 lines)
├── references/     # Optional - HIG content loaded on demand
├── scripts/        # Optional - executable code
└── assets/         # Optional - templates, data files
```

## How These Skills Work

1. **Discovery**: Agent reads `name` and `description` from frontmatter to decide if a skill is relevant
2. **Activation**: Agent loads the full `SKILL.md` body when the skill matches the user's task
3. **Context check**: Skill checks for `.claude/apple-design-context.md` (created by `hig-project-context`) and uses it to tailor guidance
4. **Deep reference**: Agent loads specific files from `references/` based on the reference index table in `SKILL.md`

This progressive disclosure model keeps context usage efficient — agents only load what they need.

## Description Field Best Practices

The `description` is critical for skill discovery. Include:
1. What the skill covers
2. When to use it — include "when the user says" trigger phrases with natural language
3. Cross-references to related skills for scope boundaries

Good example:
```yaml
description: >-
  Apple HIG guidance for layout and navigation components. Use when the user
  asks about sidebars, split views, tab bars, or window design. Also use when
  the user says "how should I organize my app," "what navigation pattern should
  I use," or "my app layout doesn't adapt to iPad." For visual design
  foundations, see hig-foundations. For platform-specific guidance, see
  hig-platforms.
```

Poor example:
```yaml
description: Layout components for Apple platforms.
```

## Writing Style Guidelines

### When Providing HIG Guidance

- **Check for project context first**: If `.claude/apple-design-context.md` exists, read it before asking questions. Use that context and only ask for information not already covered.
- Always cite the specific HIG topic (e.g., "Per Apple's HIG on Color...")
- Provide platform-specific guidance when the user's target platform is known
- Be specific about component names, API references, and design tokens
- Distinguish between requirements ("must") and recommendations ("should", "consider")

### SKILL.md Required Sections

Every SKILL.md should include these H2 sections (validated by `hig-doctor`):

1. **Key Principles** — Numbered list of core guidelines (summarized, not copied)
2. **Reference Index** — Table mapping topics to reference files
3. **Output Format** — How to structure the response
4. **Questions to Ask** — Questions the agent should ask before giving advice
5. **Related Skills** — Cross-references to other HIG skills

Additionally, every skill body should start with the context-check hint:

```
Check for `.claude/apple-design-context.md` before asking questions.
Use existing context and only ask for information not already covered.
```

The `hig-project-context` skill has a different profile with sections: "Gathering Context", "Context Document Template", "Related Skills".

Discovery information ("when to use this skill") belongs in the frontmatter `description` field, not a body section — agents read descriptions to decide relevance before loading the full body.

### Structure

- Keep `SKILL.md` under 500 lines
- Use H2 (`##`) for main sections, H3 (`###`) for subsections
- Use tables for reference indexes
- Short paragraphs (2-4 sentences max)

### Tone

- Direct and instructional
- Second person ("You are an expert in Apple's Human Interface Guidelines")
- Professional and precise

### Formatting

- Bold (`**text**`) for key terms and component names
- Code blocks for API references
- Tables for reference data
- No emojis

## Claude Code Plugin

To use as a Claude Code plugin, clone the repo into your project's `.claude/` directory.

## Checking for Updates

When using any skill from this repository:

1. **Once per session**, on first skill use, check for updates:
   - Fetch `VERSIONS.md` from GitHub: https://raw.githubusercontent.com/raintree-technology/hig-doctor/main/VERSIONS.md
   - Compare versions against local skill files' `version` frontmatter field

2. **Only prompt if meaningful**:
   - 2 or more skills have updates, OR
   - Any skill has a major version bump (e.g., 1.x to 2.x)

3. **Non-blocking notification** at end of response:
   ```
   ---
   Skills update available: X HIG skills have updates.
   Say "update skills" to update automatically, or run `git pull` in your hig-doctor folder.
   ```

4. **If user says "update skills"**:
   - Run `git pull` in the hig-doctor directory
   - Confirm what was updated

## Git Workflow

### Branch Naming

- New skills: `feature/skill-name`
- Improvements: `fix/skill-name-description`
- Content updates: `update/skill-name`
- Documentation: `docs/description`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add hig-new-skill skill`
- `fix: update color references in hig-foundations`
- `docs: update README`
- `update: refresh HIG content from Apple (month year)`

### Pull Request Checklist

- [ ] `name` matches directory name exactly
- [ ] `name` follows naming rules (lowercase, hyphens, no `--`)
- [ ] `version` field present and matches VERSIONS.md
- [ ] `description` is 1-1024 chars with trigger phrases
- [ ] `SKILL.md` is under 500 lines
- [ ] `SKILL.md` includes all required sections (Key Principles, Reference Index, Output Format, Questions to Ask, Related Skills)
- [ ] Reference files are in `references/` directory
- [ ] Cross-references to related skills are accurate
- [ ] No broken links in reference index table

## Skill Categories

| Category | Skills | Purpose |
|----------|--------|---------|
| Meta | `hig-project-context` | Shared project context for all skills |
| Platforms | `hig-platforms` | Platform-specific design guides |
| Foundations | `hig-foundations` | Visual design foundations |
| Patterns | `hig-patterns` | UX patterns and behaviors |
| Components | `hig-components-*` (8 skills) | UI component guidelines |
| Inputs | `hig-inputs` | Input methods and devices |
| Technologies | `hig-technologies` | Apple technology integrations |

## Updating HIG Content

When Apple updates the HIG:

1. Download the updated pages from Apple's HIG site
2. Replace the relevant files in `references/`
3. Update `SKILL.md` if new topics were added or removed
4. Bump version in SKILL.md frontmatter and `VERSIONS.md`
5. Update the date reference in README and AGENTS.md
