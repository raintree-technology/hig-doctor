import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let fixtureFile: string;
let fixtureDir: string;

beforeAll(async () => {
  fixtureDir = await mkdtemp(join(tmpdir(), "hig-mcp-fix-"));
  fixtureFile = join(fixtureDir, "swatch.swift");
  await writeFile(fixtureFile, ".foregroundColor(.red)\n");
});

afterAll(async () => {
  await rm(fixtureDir, { recursive: true, force: true });
});

type JsonRpcMessage = {
  id?: number;
  method?: string;
  result?: {
    tools?: Array<{ name: string }>;
    content?: Array<{ type: string; text: string }>;
    structuredContent?: Record<string, unknown>;
    isError?: boolean;
  };
};

function callTool(id: number, name: string, args: Record<string, unknown>) {
  return { jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } };
}

const initialize = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test", version: "0" },
  },
};

const initialized = {
  jsonrpc: "2.0",
  method: "notifications/initialized",
};

async function runMcp(requests: unknown[]): Promise<JsonRpcMessage[]> {
  const proc = Bun.spawn(["bun", "src/index.ts"], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  for (const request of requests) {
    proc.stdin.write(`${JSON.stringify(request)}\n`);
  }
  proc.stdin.end();

  await Bun.sleep(500);
  proc.kill();
  const output = await new Response(proc.stdout).text();
  await proc.exited.catch(() => {});

  return output
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as JsonRpcMessage);
}

describe("hig-mcp stdio server", () => {
  test("lists public tools", async () => {
    const messages = await runMcp([
      initialize,
      initialized,
      { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
    ]);

    const response = messages.find((message) => message.id === 2);
    const toolNames = response?.result?.tools?.map((tool) => tool.name);
    expect(toolNames).toEqual([
      "hig_list_skills",
      "hig_lookup",
      "hig_search",
      "hig_audit",
      "hig_audit_file",
      "hig_explain_finding",
    ]);
  });

  test("hig_search ranks topics for a natural-language query", async () => {
    const messages = await runMcp([
      initialize,
      initialized,
      callTool(2, "hig_search", { query: "minimum touch target size for buttons", limit: 5 }),
    ]);
    const response = messages.find((message) => message.id === 2);
    expect(response?.result?.isError).toBeFalsy();
    const structured = response?.result?.structuredContent as { results?: Array<{ skill: string; score: number }> };
    expect(Array.isArray(structured?.results)).toBe(true);
    expect(structured!.results!.length).toBeGreaterThan(0);
    expect(structured!.results![0].score).toBeGreaterThan(0);
  });

  test("hig_audit_file returns structured findings for a single file", async () => {
    const messages = await runMcp([
      initialize,
      initialized,
      callTool(2, "hig_audit_file", { file: fixtureFile }),
    ]);
    const response = messages.find((message) => message.id === 2);
    expect(response?.result?.isError).toBeFalsy();
    const structured = response?.result?.structuredContent as {
      severities?: { moderate: number };
      findings?: Array<{ ruleId: string; fix: string | null }>;
    };
    const hit = structured?.findings?.find((f) => f.ruleId === "swift/hardcoded-color");
    expect(hit).toBeDefined();
    expect(hit!.fix).toBeTruthy();
  });

  test("hig_audit_file rejects relative paths", async () => {
    const messages = await runMcp([
      initialize,
      initialized,
      callTool(2, "hig_audit_file", { file: "relative.swift" }),
    ]);
    const response = messages.find((message) => message.id === 2);
    expect(response?.result?.isError).toBe(true);
    expect(response?.result?.content?.[0]?.text).toContain("absolute path");
  });

  test("hig_explain_finding returns rule metadata and a reference excerpt", async () => {
    const messages = await runMcp([
      initialize,
      initialized,
      callTool(2, "hig_explain_finding", { rule_id: "swift/hardcoded-color" }),
    ]);
    const response = messages.find((message) => message.id === 2);
    expect(response?.result?.isError).toBeFalsy();
    const structured = response?.result?.structuredContent as {
      rule?: { id: string; fix: string | null; hig: string };
      reference?: { topic: string } | null;
    };
    expect(structured?.rule?.id).toBe("swift/hardcoded-color");
    expect(structured?.rule?.fix).toBeTruthy();
    expect(structured?.reference?.topic).toBe("color");
  });

  test("hig_explain_finding suggests near matches for an unknown rule", async () => {
    const messages = await runMcp([
      initialize,
      initialized,
      callTool(2, "hig_explain_finding", { rule_id: "swift/color" }),
    ]);
    const response = messages.find((message) => message.id === 2);
    expect(response?.result?.isError).toBe(true);
    expect(response?.result?.content?.[0]?.text).toContain("Unknown rule ID");
  });

  test("returns isError for invalid lookup slugs", async () => {
    const messages = await runMcp([
      initialize,
      initialized,
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "hig_lookup",
          arguments: { skill: "../secrets" },
        },
      },
    ]);

    const response = messages.find((message) => message.id === 2);
    expect(response?.result?.isError).toBe(true);
    expect(response?.result?.content?.[0]?.text).toContain("Invalid skill");
  });

  test("returns isError for invalid audit fail_on values", async () => {
    const messages = await runMcp([
      initialize,
      initialized,
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "hig_audit",
          arguments: { directory: process.cwd(), fail_on: "none" },
        },
      },
    ]);

    const response = messages.find((message) => message.id === 2);
    expect(response?.result?.isError).toBe(true);
    expect(response?.result?.content?.[0]?.text).toContain("Invalid fail_on");
  });
});
