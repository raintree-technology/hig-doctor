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
