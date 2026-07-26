import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();

// The website ships a client-side copy of patterns.ts for the browser audit
// demo (Turbopack cannot import from outside the website project root). This
// test enforces byte-identical sync between the canonical module and the copy.

test("website/lib/audit/patterns.ts matches the canonical audit patterns module", () => {
  const canonical = readFileSync(
    path.join(repoRoot, "packages/core/src/patterns.ts"),
    "utf8",
  );
  const websiteCopy = readFileSync(
    path.join(repoRoot, "website/lib/audit/patterns.ts"),
    "utf8",
  );

  assert.equal(
    websiteCopy,
    canonical,
    "website/lib/audit/patterns.ts has drifted from packages/core/src/patterns.ts. Re-run `npm run sync:audit-patterns` at the repo root.",
  );
});

// The demo also runs the Swift structural tier, so the "HIG-aligned" samples
// stay clean in the browser exactly as they do in the CLI. The copy lives under
// engines/ so its `../patterns` import resolves without any rewriting, which
// keeps the sync byte-identical.
test("website/lib/audit/engines/swift-structural.ts matches the canonical engine", () => {
  const canonical = readFileSync(
    path.join(repoRoot, "packages/core/src/engines/swift-structural.ts"),
    "utf8",
  );
  const websiteCopy = readFileSync(
    path.join(repoRoot, "website/lib/audit/engines/swift-structural.ts"),
    "utf8",
  );

  assert.equal(
    websiteCopy,
    canonical,
    "website/lib/audit/engines/swift-structural.ts has drifted from packages/core/src/engines/swift-structural.ts. Re-run `npm run sync:audit-patterns` at the repo root.",
  );
});
