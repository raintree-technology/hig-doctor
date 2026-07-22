import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CLI = join(import.meta.dir, "cli.ts");

function runCli(args: string[]): { stdout: string; stderr: string; exitCode: number } {
  const proc = Bun.spawnSync(["bun", CLI, ...args], { stdout: "pipe", stderr: "pipe" });
  return {
    stdout: proc.stdout.toString(),
    stderr: proc.stderr.toString(),
    exitCode: proc.exitCode ?? -1,
  };
}

let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "hig-cli-"));
  await writeFile(join(dir, "View.swift"), `.foregroundColor(.red)\nNavigationView {\n`);
  await mkdir(join(dir, "legacy"));
  await writeFile(join(dir, "legacy", "Old.swift"), `.foregroundColor(.blue)\n`);
});

afterAll(async () => {
  await rm(dir, { recursive: true });
});

describe("hig-doctor CLI", () => {
  test("--json reports severities, config block, and exits 0 without a gate", () => {
    const { stdout, exitCode } = runCli([dir, "--json"]);
    expect(exitCode).toBe(0);
    const json = JSON.parse(stdout);
    expect(json.schemaVersion).toBe(2);
    expect(json.config.path).toBeNull();
    expect(json.severities.moderate).toBeGreaterThan(0);
  });

  test("--fail-on moderate trips the gate with exit 1", () => {
    const { exitCode } = runCli([dir, "--json", "--fail-on", "moderate"]);
    expect(exitCode).toBe(1);
  });

  test("--exclude removes files from the scan", () => {
    const all = JSON.parse(runCli([dir, "--json"]).stdout);
    const excluded = JSON.parse(runCli([dir, "--json", "--exclude", "legacy/**"]).stdout);
    expect(excluded.files.code).toBe(all.files.code - 1);
  });

  test("config file disables rules and is reported in JSON", async () => {
    const cfg = join(dir, "hig-doctor.config.json");
    await writeFile(cfg, JSON.stringify({ rules: { "swift/hardcoded-color": "off" } }));
    try {
      const json = JSON.parse(runCli([dir, "--json"]).stdout);
      expect(json.config.path).toContain("hig-doctor.config.json");
      const noConfig = JSON.parse(runCli([dir, "--json", "--no-config"]).stdout);
      expect(noConfig.severities.moderate).toBeGreaterThan(json.severities.moderate);
    } finally {
      await rm(cfg);
    }
  });

  test("unknown rule IDs in config produce a warning on stderr", async () => {
    const cfg = join(dir, "hig-doctor.config.json");
    await writeFile(cfg, JSON.stringify({ rules: { "swift/no-such-rule": "off" } }));
    try {
      const { stderr, exitCode } = runCli([dir, "--json"]);
      expect(exitCode).toBe(0);
      expect(stderr).toContain("swift/no-such-rule");
    } finally {
      await rm(cfg);
    }
  });

  test("--write-baseline snapshots concerns; next run absorbs them and gate passes", async () => {
    const baseline = join(dir, ".hig-baseline.json");
    try {
      const gateBefore = runCli([dir, "--json", "--fail-on", "moderate"]);
      expect(gateBefore.exitCode).toBe(1);

      const write = runCli([dir, "--write-baseline"]);
      expect(write.exitCode).toBe(0);
      expect(write.stderr).toContain(".hig-baseline.json");

      const after = runCli([dir, "--json", "--fail-on", "moderate"]);
      expect(after.exitCode).toBe(0);
      const json = JSON.parse(after.stdout);
      expect(json.baseline.absorbed).toBeGreaterThan(0);
      expect(json.concerns).toEqual([]);

      const noBaseline = runCli([dir, "--json", "--fail-on", "moderate", "--no-baseline"]);
      expect(noBaseline.exitCode).toBe(1);
    } finally {
      await rm(baseline, { force: true });
    }
  });

  test("--format sarif emits a 2.1.0 log with results", () => {
    const { stdout, exitCode } = runCli([dir, "--format", "sarif"]);
    expect(exitCode).toBe(0);
    const sarif = JSON.parse(stdout);
    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0].tool.driver.name).toBe("hig-doctor");
    expect(sarif.runs[0].results.length).toBeGreaterThan(0);
  });

  test("--json concerns carry ruleId, fix, and hig citation", () => {
    const json = JSON.parse(runCli([dir, "--json"]).stdout);
    const colorConcern = json.concerns.find((f: any) => f.ruleId === "swift/hardcoded-color");
    expect(colorConcern).toBeDefined();
    expect(colorConcern.fix).toContain("semantic");
    expect(colorConcern.hig).toContain("human-interface-guidelines");
  });

  test("invalid config is an internal error with exit 3", async () => {
    const cfg = join(dir, "hig-doctor.config.json");
    await writeFile(cfg, `{"rules": {"swift/hardcoded-color": "loud"}}`);
    try {
      const { exitCode, stderr } = runCli([dir, "--json"]);
      expect(exitCode).toBe(3);
      expect(stderr).toContain("invalid setting");
    } finally {
      await rm(cfg);
    }
  });
});
