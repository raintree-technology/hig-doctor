import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { diagnose } from "../src/doctor.js";

const execFileAsync = promisify(execFile);
const testFilePath = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(testFilePath), "..");
const cliPath = path.join(packageRoot, "src", "cli.js");

const runCli = async (args, options = {}) => {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [cliPath, ...args], {
      cwd: packageRoot,
      ...options
    });

    return {
      code: 0,
      stdout,
      stderr
    };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      "stdout" in error &&
      "stderr" in error
    ) {
      return {
        code: typeof error.code === "number" ? error.code : 1,
        stdout: typeof error.stdout === "string" ? error.stdout : "",
        stderr: typeof error.stderr === "string" ? error.stderr : ""
      };
    }

    throw error;
  }
};

const writeRepoCommonFiles = async (rootDirectory, skillNames) => {
  await mkdir(path.join(rootDirectory, ".claude-plugin"), { recursive: true });

  const marketplace = {
    name: "apple-hig-skills",
    plugins: [
      {
        name: "apple-hig-skills",
        source: "./",
        skills: skillNames.map((name) => `./skills/${name}`)
      }
    ]
  };

  await writeFile(
    path.join(rootDirectory, ".claude-plugin", "marketplace.json"),
    `${JSON.stringify(marketplace, null, 2)}\n`,
    "utf8"
  );

  const versionsRows = skillNames
    .map((name) => `| ${name} | 1.0.0 | 2025-02-02 |`)
    .join("\n");

  await writeFile(
    path.join(rootDirectory, "VERSIONS.md"),
    `| Skill | Version | Last Updated |\n| --- | --- | --- |\n${versionsRows}\n`,
    "utf8"
  );

  const readmeRows = skillNames
    .map((name) => `| \`${name}\` | Description |`)
    .join("\n");

  await writeFile(
    path.join(rootDirectory, "README.md"),
    `# Test\n\n## Skills\n\n| Skill | Description |\n| --- | --- |\n${readmeRows}\n`,
    "utf8"
  );
};

const mutateSkill = async (repoPath, skillName, transformFn) => {
  const skillPath = path.join(repoPath, "skills", skillName, "SKILL.md");
  const original = await readFile(skillPath, "utf8");
  await writeFile(skillPath, transformFn(original), "utf8");
};

const createSampleSkill = async (rootDirectory) => {
  const skillDirectory = path.join(rootDirectory, "skills", "hig-sample");
  await mkdir(path.join(skillDirectory, "references"), { recursive: true });

  const skillContent = `---
name: hig-sample
version: 1.0.0
description: Use this skill when the user says sample things.
---

# Apple HIG: Sample Skill

Check for \`.claude/apple-design-context.md\` before asking questions.

## Key Principles

1. Keep it clear.

## Reference Index

| Reference | Topic |
| --- | --- |
| [example.md](references/example.md) | Example |

## Output Format

1. Be structured.

## Questions to Ask

1. What does the user need?

## Related Skills

- **hig-sample** -- Self reference for test fixture.
`;

  await writeFile(path.join(skillDirectory, "SKILL.md"), skillContent, "utf8");
  await writeFile(path.join(skillDirectory, "references", "example.md"), "Example reference", "utf8");
};

const createProjectContextSkill = async (rootDirectory) => {
  const skillDirectory = path.join(rootDirectory, "skills", "hig-project-context");
  await mkdir(skillDirectory, { recursive: true });

  const skillContent = `---
name: hig-project-context
version: 1.0.0
description: Use this skill when the user says set up project context.
---

# Apple HIG: Project Context

Check for \`.claude/apple-design-context.md\` before asking questions.

## Gathering Context

1. Read known files.

## Context Document Template

Use a template.

## Related Skills

- **hig-sample** -- Foundation linkage.
`;

  await writeFile(path.join(skillDirectory, "SKILL.md"), skillContent, "utf8");
};

const createValidRepo = async () => {
  const rootDirectory = await mkdtemp(path.join(os.tmpdir(), "hig-doctor-test-"));
  await mkdir(path.join(rootDirectory, "skills"), { recursive: true });

  await createSampleSkill(rootDirectory);
  await createProjectContextSkill(rootDirectory);
  await writeRepoCommonFiles(rootDirectory, ["hig-sample", "hig-project-context"]);

  return rootDirectory;
};

test("diagnose returns no issues for a valid repository", async () => {
  const repoPath = await createValidRepo();
  try {
    const result = await diagnose(repoPath);
    assert.equal(result.summary.errors, 0);
    assert.equal(result.summary.warnings, 0);
    assert.equal(result.summary.passed, true);
    assert.equal(result.summary.score, 100);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports missing required section in a standard skill", async () => {
  const repoPath = await createValidRepo();
  try {
    const skillPath = path.join(repoPath, "skills", "hig-sample", "SKILL.md");
    const original = await readFile(skillPath, "utf8");
    await writeFile(skillPath, original.replace(/## Questions to Ask[\s\S]*?## Related Skills/, "## Related Skills"), "utf8");

    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((finding) => finding.ruleId === "skill/required-section"));
    assert.ok(result.summary.errors > 0);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports marketplace mismatch", async () => {
  const repoPath = await createValidRepo();
  try {
    const marketplacePath = path.join(repoPath, ".claude-plugin", "marketplace.json");
    const marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));
    marketplace.plugins[0].skills.push("./skills/hig-missing");
    await writeFile(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`, "utf8");

    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((finding) => finding.ruleId === "repo/marketplace-skill-exists"));
    assert.ok(result.summary.errors > 0);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("strict mode fails when only warnings are present", async () => {
  const repoPath = await createValidRepo();
  try {
    const readmePath = path.join(repoPath, "README.md");
    const readme = await readFile(readmePath, "utf8");
    await writeFile(readmePath, readme.replace("| `hig-sample` | Description |", ""), "utf8");

    const nonStrict = await diagnose(repoPath, { strict: false });
    assert.equal(nonStrict.summary.errors, 0);
    assert.ok(nonStrict.summary.warnings > 0);
    assert.equal(nonStrict.summary.passed, true);

    const strict = await diagnose(repoPath, { strict: true });
    assert.equal(strict.summary.errors, 0);
    assert.ok(strict.summary.warnings > 0);
    assert.equal(strict.summary.passed, false);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose includes agent todo items when findings are present", async () => {
  const repoPath = await createValidRepo();
  try {
    const skillPath = path.join(repoPath, "skills", "hig-sample", "SKILL.md");
    const original = await readFile(skillPath, "utf8");
    await writeFile(skillPath, original.replace("## Output Format", "## Output Format Removed"), "utf8");

    const result = await diagnose(repoPath);
    assert.ok(result.findings.length > 0);
    assert.ok(Array.isArray(result.todo));
    assert.ok(result.todo.length > 0);
    assert.equal(result.todo[0].priority, "high");
    assert.match(result.todo[0].task, /^Fix /);
    assert.ok(Array.isArray(result.todo[0].files));
    assert.ok(result.todo[0].files.length > 0);
    assert.match(result.todo[0].doneWhen, /100\/100/);
    assert.match(result.todo[0].verifyCommand, /--json/);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("cli text output includes an Agent TODO section", async () => {
  const repoPath = await createValidRepo();
  try {
    const result = await runCli([repoPath]);
    assert.equal(result.code, 0);
    assert.equal(result.stderr, "");
    assert.match(result.stdout, /Agent TODO/m);
    assert.match(result.stdout, /goal: 100\/100/m);
    assert.match(result.stdout, /No fixes required/m);
    assert.match(result.stdout, /Verify: .*--score/m);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("cli --json includes machine-readable todo items", async () => {
  const repoPath = await createValidRepo();
  try {
    const result = await runCli([repoPath, "--json"]);
    assert.equal(result.code, 0);
    assert.equal(result.stderr, "");
    const report = JSON.parse(result.stdout);
    assert.ok(Array.isArray(report.todo));
    assert.ok(report.todo.length > 0);
    assert.equal(report.todo[0].task, "No fixes required");
    assert.equal(Array.isArray(report.todo[0].files), true);
    assert.match(report.todo[0].verifyCommand, /--score/);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("todo list is not truncated for large finding sets", async () => {
  const repoPath = await createValidRepo();
  try {
    const skillPath = path.join(repoPath, "skills", "hig-sample", "SKILL.md");
    await writeFile(
      skillPath,
      `---
name: bad--skill
version: one
description: Tiny description.
---

# Broken Skill

## Placeholder

[Missing reference](references/nope.md)
`,
      "utf8"
    );

    const result = await diagnose(repoPath);
    const uniqueRuleScopePairs = new Set(result.findings.map((finding) => `${finding.ruleId}:${finding.skill ?? "repo"}`));
    assert.ok(uniqueRuleScopePairs.size > 8);
    assert.equal(result.todo.length, uniqueRuleScopePairs.size);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("nested reference markdown files are discovered recursively", async () => {
  const repoPath = await createValidRepo();
  try {
    const skillDirectory = path.join(repoPath, "skills", "hig-sample");
    const skillPath = path.join(skillDirectory, "SKILL.md");
    const nestedReferencePath = path.join(skillDirectory, "references", "platform", "ios.md");

    await mkdir(path.dirname(nestedReferencePath), { recursive: true });
    await writeFile(nestedReferencePath, "Nested reference", "utf8");

    const skillContent = await readFile(skillPath, "utf8");
    await writeFile(
      skillPath,
      skillContent.replace("references/example.md", "references/platform/ios.md"),
      "utf8"
    );

    await rm(path.join(skillDirectory, "references", "example.md"), { force: true });

    const result = await diagnose(repoPath);
    assert.equal(
      result.findings.some(
        (finding) => finding.ruleId === "skill/references-directory-has-files" && finding.skill === "hig-sample"
      ),
      false
    );
    assert.equal(
      result.findings.some(
        (finding) => finding.ruleId === "skill/reference-file-exists" && finding.skill === "hig-sample"
      ),
      false
    );
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("missing nested reference links still report skill/reference-file-exists", async () => {
  const repoPath = await createValidRepo();
  try {
    const skillPath = path.join(repoPath, "skills", "hig-sample", "SKILL.md");
    const skillContent = await readFile(skillPath, "utf8");
    await writeFile(
      skillPath,
      skillContent.replace("references/example.md", "references/platform/missing.md"),
      "utf8"
    );

    const result = await diagnose(repoPath);
    assert.equal(
      result.findings.some(
        (finding) =>
          finding.ruleId === "skill/reference-file-exists" &&
          finding.skill === "hig-sample" &&
          finding.message.includes("references/platform/missing.md")
      ),
      true
    );
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("cli --version matches packages/hig-doctor/package.json", async () => {
  const packageJsonPath = path.join(packageRoot, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

  const { stdout, stderr } = await runCli(["--version"]);

  assert.equal(stderr, "");
  assert.equal(stdout.trim(), packageJson.version);
});

test("cli --score returns a numeric score and exits 0 on a clean fixture", async () => {
  const repoPath = await createValidRepo();
  try {
    const result = await runCli([repoPath, "--score"]);
    assert.equal(result.code, 0);
    assert.equal(result.stderr, "");
    assert.match(result.stdout.trim(), /^[0-9]+$/);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("cli unknown option exits non-zero with actionable error message", async () => {
  const result = await runCli(["--not-a-real-flag"]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /^hig-doctor: Unknown option: --not-a-real-flag/m);
});

test("cli rejects --tui when combined with --score or --json", async () => {
  for (const args of [["--tui", "--score"], ["--tui", "--json"]]) {
    const result = await runCli(args);
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /^hig-doctor: --tui cannot be combined with --json or --score/m);
  }
});

test("cli strict mode exits non-zero when repository has warnings only", async () => {
  const repoPath = await createValidRepo();
  try {
    const readmePath = path.join(repoPath, "README.md");
    const readme = await readFile(readmePath, "utf8");
    await writeFile(readmePath, readme.replace("| `hig-sample` | Description |", ""), "utf8");

    const baseline = await runCli([repoPath, "--json"]);
    assert.equal(baseline.code, 0);
    assert.equal(baseline.stderr, "");
    const baselineReport = JSON.parse(baseline.stdout);
    assert.equal(baselineReport.summary.errors, 0);
    assert.ok(baselineReport.summary.warnings > 0);

    const strict = await runCli([repoPath, "--strict", "--score"]);
    assert.notEqual(strict.code, 0);
    assert.equal(strict.stderr, "");
    assert.match(strict.stdout.trim(), /^[0-9]+$/);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 1: Repo Structure
// ---------------------------------------------------------------------------

test("diagnose reports repo/versions-file-exists when VERSIONS.md is missing", async () => {
  const repoPath = await createValidRepo();
  try {
    await rm(path.join(repoPath, "VERSIONS.md"));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/versions-file-exists" && f.severity === "error"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports repo/versions-table-populated when VERSIONS.md has no rows", async () => {
  const repoPath = await createValidRepo();
  try {
    await writeFile(
      path.join(repoPath, "VERSIONS.md"),
      "| Skill | Version | Last Updated |\n| --- | --- | --- |\n",
      "utf8"
    );
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/versions-table-populated" && f.severity === "error"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports repo/versions-no-duplicate-rows for duplicate entries", async () => {
  const repoPath = await createValidRepo();
  try {
    const versionsPath = path.join(repoPath, "VERSIONS.md");
    const content = await readFile(versionsPath, "utf8");
    await writeFile(versionsPath, `${content}| hig-sample | 1.0.0 | 2025-02-02 |\n`, "utf8");
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/versions-no-duplicate-rows" && f.message.includes("hig-sample")));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports repo/skills-directory-exists when skills/ is missing", async () => {
  const repoPath = await createValidRepo();
  try {
    await rm(path.join(repoPath, "skills"), { recursive: true, force: true });
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/skills-directory-exists" && f.severity === "error"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports repo/skills-directory-populated when skills/ is empty", async () => {
  const repoPath = await createValidRepo();
  try {
    await rm(path.join(repoPath, "skills", "hig-sample"), { recursive: true, force: true });
    await rm(path.join(repoPath, "skills", "hig-project-context"), { recursive: true, force: true });
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/skills-directory-populated" && f.severity === "error"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 2: VERSIONS.md
// ---------------------------------------------------------------------------

test("diagnose reports versions/entry-has-skill-directory for ghost entry", async () => {
  const repoPath = await createValidRepo();
  try {
    const versionsPath = path.join(repoPath, "VERSIONS.md");
    const content = await readFile(versionsPath, "utf8");
    await writeFile(versionsPath, `${content}| hig-ghost | 1.0.0 | 2025-02-02 |\n`, "utf8");
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "versions/entry-has-skill-directory" && f.message.includes("hig-ghost")));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 3: Marketplace
// ---------------------------------------------------------------------------

test("diagnose reports repo/marketplace-file-exists when marketplace.json is missing", async () => {
  const repoPath = await createValidRepo();
  try {
    await rm(path.join(repoPath, ".claude-plugin", "marketplace.json"));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/marketplace-file-exists" && f.severity === "error"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports repo/marketplace-json-valid for invalid JSON", async () => {
  const repoPath = await createValidRepo();
  try {
    await writeFile(path.join(repoPath, ".claude-plugin", "marketplace.json"), "{ broken json }", "utf8");
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/marketplace-json-valid" && f.severity === "error"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports repo/marketplace-skill-path-format for invalid path", async () => {
  const repoPath = await createValidRepo();
  try {
    const marketplacePath = path.join(repoPath, ".claude-plugin", "marketplace.json");
    const marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));
    marketplace.plugins[0].skills.push("./skills/hig-sample/extra/nested");
    await writeFile(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`, "utf8");
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/marketplace-skill-path-format"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports repo/marketplace-includes-all-skills when skill is missing from marketplace", async () => {
  const repoPath = await createValidRepo();
  try {
    const marketplacePath = path.join(repoPath, ".claude-plugin", "marketplace.json");
    const marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));
    marketplace.plugins[0].skills = marketplace.plugins[0].skills.filter((s) => !s.includes("hig-sample"));
    await writeFile(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`, "utf8");
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/marketplace-includes-all-skills" && f.message.includes("hig-sample")));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 4: README
// ---------------------------------------------------------------------------

test("diagnose reports repo/readme-exists when README.md is missing", async () => {
  const repoPath = await createValidRepo();
  try {
    await rm(path.join(repoPath, "README.md"));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/readme-exists" && f.severity === "warning"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports repo/readme-skills-table-populated when README has no table", async () => {
  const repoPath = await createValidRepo();
  try {
    await writeFile(path.join(repoPath, "README.md"), "# Test\n\nNo table here.\n", "utf8");
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/readme-skills-table-populated" && f.severity === "warning"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports repo/readme-skill-exists for phantom skill in README", async () => {
  const repoPath = await createValidRepo();
  try {
    const readmePath = path.join(repoPath, "README.md");
    const content = await readFile(readmePath, "utf8");
    await writeFile(readmePath, `${content}| \`hig-phantom\` | Does not exist |\n`, "utf8");
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "repo/readme-skill-exists" && f.message.includes("hig-phantom")));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 5: Skill Frontmatter
// ---------------------------------------------------------------------------

test("diagnose reports skill/skill-file-exists when SKILL.md is missing", async () => {
  const repoPath = await createValidRepo();
  try {
    await rm(path.join(repoPath, "skills", "hig-sample", "SKILL.md"));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/skill-file-exists" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/max-lines when SKILL.md exceeds 500 lines", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) => `${content}${"\nfiller".repeat(500)}\n`);
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/max-lines" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/title-format when title lacks Apple HIG prefix", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) => content.replace("# Apple HIG: Sample Skill", "# Sample Skill"));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/title-format" && f.severity === "warning" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/frontmatter-exists when frontmatter is missing", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", () => "# No Frontmatter\n\nJust content.\n");
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/frontmatter-exists" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/context-check-hint when context mention is missing", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) => content.replace(".claude/apple-design-context.md", ""));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/context-check-hint" && f.severity === "warning" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 6: Skill Name Validation
// ---------------------------------------------------------------------------

test("diagnose reports skill/name-required when name field is missing", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) => content.replace(/^name:.*$/m, ""));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/name-required" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/name-matches-directory when name differs from directory", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) => content.replace("name: hig-sample", "name: hig-other"));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/name-matches-directory" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/name-format for invalid name characters", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) => content.replace("name: hig-sample", "name: HIG-Sample"));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/name-format" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/name-no-consecutive-hyphens for double hyphens", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) => content.replace("name: hig-sample", "name: hig--sample"));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/name-no-consecutive-hyphens" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 7: Skill Version Validation
// ---------------------------------------------------------------------------

test("diagnose reports skill/version-required when version field is missing", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) => content.replace(/^version:.*$/m, ""));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/version-required" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/version-semver for invalid semver", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) => content.replace("version: 1.0.0", "version: one"));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/version-semver" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/version-listed-in-versions when skill is not in VERSIONS.md", async () => {
  const repoPath = await createValidRepo();
  try {
    const versionsPath = path.join(repoPath, "VERSIONS.md");
    const content = await readFile(versionsPath, "utf8");
    await writeFile(versionsPath, content.replace(/^.*hig-sample.*$/m, ""), "utf8");
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/version-listed-in-versions" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/version-matches-versions for version mismatch", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) => content.replace("version: 1.0.0", "version: 2.0.0"));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/version-matches-versions" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 8: Skill Description Validation
// ---------------------------------------------------------------------------

test("diagnose reports skill/description-required when description is missing", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) => content.replace(/^description:.*$/m, ""));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/description-required" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/description-max-length for oversized description", async () => {
  const repoPath = await createValidRepo();
  try {
    const longDescription = `Use this skill when ${"x".repeat(1005)}`;
    await mutateSkill(repoPath, "hig-sample", (content) =>
      content.replace(/^description:.*$/m, `description: ${longDescription}`)
    );
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/description-max-length" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/description-trigger-phrases when triggers are absent", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) =>
      content.replace(/^description:.*$/m, "description: Apple HIG guidance for layout and navigation.")
    );
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/description-trigger-phrases" && f.severity === "warning" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 9: Skill Sections (project-context profile)
// ---------------------------------------------------------------------------

test("diagnose reports skill/required-section for project-context profile missing Gathering Context", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-project-context", (content) =>
      content.replace("## Gathering Context", "## Gathering Info")
    );
    const result = await diagnose(repoPath);
    assert.ok(
      result.findings.some(
        (f) => f.ruleId === "skill/required-section" && f.skill === "hig-project-context" && f.message.includes("Gathering Context")
      )
    );
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 10: Skill References
// ---------------------------------------------------------------------------

test("diagnose reports skill/references-directory-exists when references/ is missing", async () => {
  const repoPath = await createValidRepo();
  try {
    await rm(path.join(repoPath, "skills", "hig-sample", "references"), { recursive: true, force: true });
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/references-directory-exists" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/references-directory-has-files when references/ is empty", async () => {
  const repoPath = await createValidRepo();
  try {
    await rm(path.join(repoPath, "skills", "hig-sample", "references", "example.md"));
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/references-directory-has-files" && f.severity === "warning" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/reference-index-links when no reference links exist", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) =>
      content.replace("[example.md](references/example.md)", "No links here")
    );
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/reference-index-links" && f.skill === "hig-sample"));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/reference-file-referenced for orphaned reference file", async () => {
  const repoPath = await createValidRepo();
  try {
    await writeFile(path.join(repoPath, "skills", "hig-sample", "references", "extra.md"), "Orphaned file", "utf8");
    const result = await diagnose(repoPath);
    assert.ok(
      result.findings.some(
        (f) => f.ruleId === "skill/reference-file-referenced" && f.message.includes("extra.md") && f.skill === "hig-sample"
      )
    );
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 11: Related Skills
// ---------------------------------------------------------------------------

test("diagnose reports skill/related-skill-exists for nonexistent related skill", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) =>
      content.replace(/## Related Skills[\s\S]*$/, "## Related Skills\n\n- See hig-nonexistent for details.\n")
    );
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/related-skill-exists" && f.message.includes("hig-nonexistent")));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("diagnose reports skill/related-skill-wildcard-resolves for unmatched wildcard", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) =>
      content.replace("## Related Skills", "## Related Skills\n\n- **hig-unknown-*** -- Wildcard test.")
    );
    const result = await diagnose(repoPath);
    assert.ok(result.findings.some((f) => f.ruleId === "skill/related-skill-wildcard-resolves" && f.message.includes("hig-unknown-*")));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Group 12: Scoring and Edge Cases
// ---------------------------------------------------------------------------

test("score formula applies correctly for warnings only", async () => {
  const repoPath = await createValidRepo();
  try {
    await mutateSkill(repoPath, "hig-sample", (content) =>
      content
        .replace("# Apple HIG: Sample Skill", "# Sample Skill")
        .replace(".claude/apple-design-context.md", "")
    );
    const result = await diagnose(repoPath);
    assert.equal(result.summary.errors, 0);
    assert.equal(result.summary.warnings, 2);
    assert.equal(result.summary.score, 96);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("score never goes below zero", async () => {
  const repoPath = await createValidRepo();
  try {
    await rm(path.join(repoPath, "VERSIONS.md"));
    await rm(path.join(repoPath, "README.md"));
    await rm(path.join(repoPath, ".claude-plugin", "marketplace.json"));
    await rm(path.join(repoPath, "skills", "hig-sample", "SKILL.md"));
    await rm(path.join(repoPath, "skills", "hig-project-context", "SKILL.md"));
    const result = await diagnose(repoPath);
    assert.ok(result.summary.errors >= 3);
    assert.equal(result.summary.score, Math.max(0, 100 - result.summary.errors * 10 - result.summary.warnings * 2));
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});

test("missing SKILL.md does not cascade into frontmatter or section checks", async () => {
  const repoPath = await createValidRepo();
  try {
    await rm(path.join(repoPath, "skills", "hig-sample", "SKILL.md"));
    const result = await diagnose(repoPath);
    const sampleFindings = result.findings.filter((f) => f.skill === "hig-sample");
    assert.ok(sampleFindings.some((f) => f.ruleId === "skill/skill-file-exists"));
    assert.equal(sampleFindings.filter((f) => f.ruleId === "skill/frontmatter-exists").length, 0);
    assert.equal(sampleFindings.filter((f) => f.ruleId === "skill/name-required").length, 0);
    assert.equal(sampleFindings.filter((f) => f.ruleId === "skill/required-section").length, 0);
  } finally {
    await rm(repoPath, { recursive: true, force: true });
  }
});
