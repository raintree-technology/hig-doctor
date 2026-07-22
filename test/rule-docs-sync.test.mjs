// Guards docs/rules.md against drifting from the rule catalog. Regenerate with:
//   bun scripts/generate-rule-docs.ts
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();

test("docs/rules.md is regenerated after rule catalog changes", () => {
  const docsPath = path.join(repoRoot, "docs", "rules.md");
  const before = readFileSync(docsPath, "utf8");
  execFileSync("bun", [path.join(repoRoot, "scripts", "generate-rule-docs.ts")], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  const after = readFileSync(docsPath, "utf8");
  assert.equal(
    before,
    after,
    "docs/rules.md is stale — run `bun scripts/generate-rule-docs.ts` and commit the result",
  );
});
