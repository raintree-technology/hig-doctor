# HIG Doctor Codex plugin recipe

This directory defines the product-owned Codex packaging layer for HIG Doctor
2.0.3. The public Raintree marketplace combines this directory with the 14
canonical root skills. It does not maintain a copied HIG corpus.

The plugin starts `hig-mcp@0.2.3` through `npx` and runs source audits with
`hig-doctor@2.0.3`. Both commands require Node.js and network access on first use.

Automated findings support review. They do not certify HIG or accessibility
conformance.
