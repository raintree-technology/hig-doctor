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
    path.join(repoRoot, "packages/hig-doctor/src-termcast/src/patterns.ts"),
    "utf8",
  );
  const websiteCopy = readFileSync(
    path.join(repoRoot, "website/lib/audit/patterns.ts"),
    "utf8",
  );

  assert.equal(
    websiteCopy,
    canonical,
    "website/lib/audit/patterns.ts has drifted from packages/hig-doctor/src-termcast/src/patterns.ts. Re-run `npm run sync:audit-patterns` at the repo root.",
  );
});
