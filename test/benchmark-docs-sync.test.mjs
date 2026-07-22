// Guards docs/benchmark.md against drifting from the fixture corpus.
// Regenerate with: bun scripts/generate-benchmark.ts
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();

test("docs/benchmark.md is regenerated after benchmark changes", () => {
  const docsPath = path.join(repoRoot, "docs", "benchmark.md");
  const before = readFileSync(docsPath, "utf8");
  execFileSync("bun", [path.join(repoRoot, "scripts", "generate-benchmark.ts")], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  const after = readFileSync(docsPath, "utf8");
  assert.equal(
    before,
    after,
    "docs/benchmark.md is stale — run `bun scripts/generate-benchmark.ts` and commit the result",
  );
});
