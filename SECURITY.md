# Security Policy

## Reporting a vulnerability

Please report security issues **privately** rather than opening a public issue:

- Open a private security advisory: <https://github.com/raintree-technology/hig-doctor/security/advisories/new>
- Or contact the maintainers via <https://raintree.technology>

Include reproduction steps, affected versions, and impact. We aim to acknowledge
reports within 5 business days.

## Scope

This project ships software that runs in other people's environments, so the
following are in scope:

- **Audit CLI** (`hig-doctor`) and **MCP server** (`hig-mcp`) read files from
  arbitrary, caller-supplied paths. The scanner skips symlinks, caps per-file
  size, and bounds recursion depth — reports of path traversal, sandbox escape,
  or denial-of-service that get past those guards are in scope.
- **GitHub Action** executes inside consumers' CI. Command injection or
  privilege escalation through audit inputs is in scope.

Apple HIG reference **content** is Apple's intellectual property and is out of
scope for security reports (see [LICENSE](LICENSE)).

## Supported versions

Security fixes are applied to the latest published version of each npm package
(`hig-doctor`, `hig-mcp`). Older versions are not maintained.
