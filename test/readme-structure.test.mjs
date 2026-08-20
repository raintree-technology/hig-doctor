import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

function h1Count(markdown) {
  let fenced = false;
  return markdown.split("\n").filter((line) => {
    if (line.startsWith("```")) {
      fenced = !fenced;
      return false;
    }
    return !fenced && line.startsWith("# ");
  }).length;
}

test("README keeps the public project contract", () => {
  for (const required of [
    "<!-- project-record: hig-doctor -->",
    "**Active open-source project",
    "## Run an audit",
    "## Limits and evidence boundary",
    "## Raintree open-source system",
    "## Project policies",
  ]) {
    assert.ok(readme.includes(required), `README is missing ${required}`);
  }
  assert.equal(h1Count(readme), 1);
  assert.ok(readme.indexOf("npx hig-doctor .") < readme.indexOf("npx -y hig-mcp"));
});

test("README audit proof matches the committed fixture", () => {
  const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
  const result = spawnSync(
    "bun",
    ["packages/cli/src/cli.ts", "test/fixtures/readme-audit", "--json"],
    { cwd: repositoryRoot, encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  const audit = JSON.parse(result.stdout);
  assert.equal(audit.severities.moderate, 2);
  assert.deepEqual(audit.frameworks, ["swiftui"]);
  assert.equal(audit.files.code, 1);

  const proof = [
    `${audit.severities.moderate} moderate concerns · ${audit.frameworks[0]} · ${audit.files.code} file`,
    ...audit.concerns.map((concern) => `${concern.file}:${concern.line} · ${concern.ruleId}`),
  ];
  for (const line of proof) {
    assert.ok(readme.includes(line), `README audit proof is missing: ${line}`);
  }
});

for (const path of [
  "../packages/cli/README.md",
  "../packages/core/README.md",
  "../packages/mcp/README.md",
]) {
  test(`${path} keeps the published-package contract`, () => {
    const packageReadme = readFileSync(new URL(path, import.meta.url), "utf8");
    for (const required of ["**Active", "## Install", "Expected result", "limit"]) {
      assert.ok(packageReadme.toLowerCase().includes(required.toLowerCase()));
    }
    assert.equal(h1Count(packageReadme), 1);
  });
}
