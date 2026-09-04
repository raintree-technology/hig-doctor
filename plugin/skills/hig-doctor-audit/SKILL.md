---
name: hig-doctor-audit
description: Audit interface source with HIG Doctor when the user asks to scan, lint, review, or remediate Swift, UIKit, AppKit, React, Vue, Svelte, Angular, Compose, Android XML, Flutter, CSS, or HTML for HIG-aligned interface and accessibility concerns. Do not activate for general design advice without source to audit; use the relevant HIG guidance skill instead.
---

# HIG Doctor audit

Use HIG Doctor findings as review evidence, not certification.

## Audit workflow

1. Confirm the target repository or directory. Keep the scan within that scope.
2. Run `npx -y hig-doctor@2.0.3 <target> --json` for machine-readable findings.
3. Report the detected frameworks, severity counts, rule IDs, locations, and
   material analysis limits.
4. Use `hig_explain_finding` or the relevant bundled HIG skill when a finding
   needs its cited guidance and context.
5. Before editing, distinguish mechanical fixes from changes that require
   product, design, accessibility, or platform judgment.
6. If the user authorized remediation, preserve justified suppressions and
   rerun the audit plus the repository's relevant checks.

## Gates and baselines

- Use `--fail-on <critical|serious|moderate>` only when the requested workflow
  needs a gate.
- Use `--write-baseline` only when the user asks to adopt a baseline. A baseline
  records accepted existing findings; it does not resolve them.
- Do not delete or weaken configuration, inline suppressions, or baselines merely
  to produce a clean result.

## Failure handling

If `npx` or the package cannot run, state the failed command and the missing
prerequisite. Ask the user to install a supported Node.js runtime or restore
package-registry access. Do not substitute an unversioned audit command.

## Output

Lead with the audit result. Separate confirmed findings, judgment-dependent
warnings, preserved exceptions, checks run, and missing evidence. Never claim
that an automated scan proves HIG compliance or accessibility.
