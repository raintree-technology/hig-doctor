import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = process.cwd();

const readRepoFile = (relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), "utf8");

const workflowFiles = [
  ".github/workflows/annual-hig-rescan.yml",
  ".github/workflows/build-website.yml",
  ".github/workflows/hig-doctor-ci.yml",
  ".github/workflows/publish-hig-doctor.yml",
  ".github/workflows/publish-hig-mcp.yml",
  ".github/workflows/validate-skills.yml",
];

const pinnedActionPattern =
  /^\s*-\s+uses:\s+[A-Za-z0-9._/-]+@[0-9a-f]{40}(?:\s+#.*)?$/;

test("all GitHub workflows pin third-party actions to immutable SHAs", () => {
  for (const workflowFile of workflowFiles) {
    const content = readRepoFile(workflowFile);
    const usesLines = content
      .split("\n")
      .filter((line) => line.trimStart().startsWith("- uses:"));

    assert.ok(usesLines.length > 0, `${workflowFile} should declare actions`);
    for (const line of usesLines) {
      assert.match(
        line,
        pinnedActionPattern,
        `${workflowFile} contains an unpinned action reference: ${line.trim()}`,
      );
    }
  }
});

test("repo workflows declare least-privilege contents permissions", () => {
  for (const workflowFile of workflowFiles) {
    const content = readRepoFile(workflowFile);
    assert.match(
      content,
      /\n\s+permissions:\n\s+contents:\s+read\n/,
      `${workflowFile} should declare contents: read permissions`,
    );
  }
});

test("website CI no longer self-mutates the repository", () => {
  const content = readRepoFile(".github/workflows/build-website.yml");
  assert.doesNotMatch(content, /\bgit\s+push\b/);
  assert.doesNotMatch(content, /\bgit\s+commit\b/);
});

test("npm publish uses trusted publishing instead of a long-lived token", () => {
  for (const file of [
    ".github/workflows/publish-hig-doctor.yml",
    ".github/workflows/publish-hig-mcp.yml",
  ]) {
    const content = readRepoFile(file);
    assert.match(content, /\n\s+id-token:\s+write\n/, `${file} missing id-token`);
    assert.match(content, /npm publish --provenance --access public/, `${file} missing provenance flags`);
    assert.doesNotMatch(content, /NODE_AUTH_TOKEN|NPM_TOKEN/, `${file} references a long-lived token`);
  }
});

test("composite action pins third-party action references", () => {
  const content = readRepoFile("action.yml");
  const usesLines = content
    .split("\n")
    .filter((line) => line.trimStart().startsWith("- uses:"));
  assert.ok(usesLines.length > 0, "action.yml should declare at least one action");
  for (const line of usesLines) {
    assert.match(
      line,
      pinnedActionPattern,
      `action.yml contains an unpinned action reference: ${line.trim()}`,
    );
  }
});
