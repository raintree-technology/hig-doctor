// Guards the README's advertised rule counts against the generated catalog.
// The framework table drifted to 470 rules while the headline said 431, and
// nothing caught it — docs/rules.md is generated and tested, the README is not.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();
const readmePath = path.join(repoRoot, "README.md");
const rulesDocPath = path.join(repoRoot, "docs", "rules.md");

/** Per-framework rule counts from the generated catalog. */
function generatedSections() {
  const doc = readFileSync(rulesDocPath, "utf8");
  return [...doc.matchAll(/^## (.+?) \((\d+) rules/gm)].map(m => ({
    name: m[1],
    rules: Number(m[2]),
  }));
}

/** Rule counts from the README's "Framework | Rules" tables. */
function readmeCounts() {
  const readme = readFileSync(readmePath, "utf8");
  return [...readme.matchAll(/^\| ([^|]*?) \| (\d+) \|/gm)].map(m => ({
    name: m[1].trim(),
    rules: Number(m[2]),
  }));
}

test("README framework table totals the generated rule count", () => {
  const generatedTotal = generatedSections().reduce((sum, s) => sum + s.rules, 0);
  const readmeTotal = readmeCounts().reduce((sum, r) => sum + r.rules, 0);
  assert.equal(
    readmeTotal,
    generatedTotal,
    `README framework table sums to ${readmeTotal} but the catalog has ${generatedTotal} rules — reconcile it with docs/rules.md`,
  );
});

test("README headline rule count and framework count match the catalog", () => {
  const readme = readFileSync(readmePath, "utf8");
  const sections = generatedSections();
  const total = sections.reduce((sum, s) => sum + s.rules, 0);

  const headlines = [...readme.matchAll(/\*\*(\d+)[ -]rules?\*\*/g)].map(m => Number(m[1]));
  assert.ok(headlines.length > 0, "README should state the rule count in bold");
  for (const claimed of headlines) {
    assert.equal(claimed, total, `README claims ${claimed} rules; the catalog has ${total}`);
  }

  const frameworkClaims = [...readme.matchAll(/across (\d+) frameworks/g)].map(m => Number(m[1]));
  for (const claimed of frameworkClaims) {
    assert.equal(
      claimed,
      sections.length,
      `README claims ${claimed} frameworks; the catalog has ${sections.length}`,
    );
  }
});
