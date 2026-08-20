# Product Marketing Context

*Last updated: 2026-08-20 · Auto-drafted from repository evidence*

## Product Overview

**One-liner:** HIG Doctor finds reviewable interface issues in Apple-platform, web, and cross-platform source before release.

**What it does:** A shared rule engine powers a CLI, MCP server, embeddable package, and agent skills. Findings include severity, location, rule ID, fix direction, and a source reference; baselines and suppressions support gradual adoption.

**Product category:** Interface-quality and accessibility static analysis

**Product type:** MIT-licensed open-source developer tool with attributed Apple reference material

**Business model:** Free open-source tooling. No paid offer or commercial adoption claim is established in this repository.

## Target Audience

**Primary users:** Apple-platform developers, frontend teams, design engineers, accessibility reviewers, and coding-agent users.

**Primary use case:** Scan source code for concerns that deserve human review, then use cited guidance to decide and implement a fix.

**Jobs to be done:**

- Catch common interface and accessibility mistakes before review or release.
- Gate new findings without requiring an immediate cleanup of existing debt.
- Give agents bounded, source-linked interface guidance.
- Run the same catalog through CLI, CI, MCP, and embedded workflows.

## Problems and Alternatives

**Core problem:** Interface guidance is broad and contextual, while recurring source-level mistakes are easy to miss and expensive to rediscover during review.

**Alternatives:** Platform linters, accessibility testing, design review, and manual HIG reading remain necessary. HIG Doctor adds a cross-framework, reference-linked source audit; it does not replace those controls.

## Differentiation

- Apple-platform rules are distinguished from HIG-aligned cross-platform rules.
- Every finding reports which analysis engine produced it.
- Configuration, content-based baselines, SARIF, and narrow suppressions support staged adoption.
- A frozen reference snapshot is monitored for drift but never rewritten automatically from a hash change.
- The public rule inventory connects findings to fix guidance and sources.

## Objections and Fit

| Question | Answer |
| --- | --- |
| Does a clean scan prove HIG or accessibility conformance? | No. Findings support review and cannot prove design quality or conformance. |
| Are all 431 rules direct Apple HIG checks? | No. Web and cross-platform rules use aligned accessibility and interface-quality principles. |
| Is the bundled Apple material MIT licensed? | No. Apple retains ownership; the MIT license covers Raintree's original tooling and organization. |

**Anti-persona:** Teams seeking automatic design approval, exhaustive runtime accessibility testing, or permission to republish Apple content.

## Customer Language

No verified interviews or testimonials are recorded. Use: reviewable concern, source reference, baseline, gradual adoption, framework coverage, HIG-aligned, and human review. Avoid: HIG certified, complete accessibility coverage, guaranteed conformance, and official Apple tool.

## Brand Voice

**Tone:** Precise, practical, respectful of platform authority, and explicit about uncertainty

**Style:** Show one finding, its source basis, the recommended action, and the limits of automation.

## Proof Points

- 431 cataloged rules across 14 frameworks, generated and checked in CI.
- CLI, MCP, core package, and 14 agent-skill surfaces.
- Current fixture benchmark covers 27 known fixtures across six frameworks with no observed false positives or false negatives; this is fixture evidence, not field performance.
- Nightly drift checks compare the frozen corpus with Apple DocC JSON for human review.

## Goals

**Primary goal:** Make HIG Doctor the first source-audit step for teams reviewing interface code with humans or agents.

**Conversion action:** Run `npx hig-doctor .`, inspect one finding, and follow its source reference.

## Messaging Guardrails

- Keep direct Apple HIG rules distinct from aligned universal checks.
- Never imply Apple endorsement, certification, or ownership of Raintree tooling.
- Qualify fixture metrics with corpus size and scope.
- Treat suppressions as reviewed exceptions, not proof that a concern is harmless.
