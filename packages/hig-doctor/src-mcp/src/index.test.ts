import { describe, expect, test } from "bun:test";

type JsonRpcMessage = {
  id?: number;
  method?: string;
  result?: {
    tools?: Array<{ name: string }>;
    content?: Array<{ type: string; text: string }>;
    isError?: boolean;
  };
};

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
    expect(toolNames).toEqual(["hig_list_skills", "hig_lookup", "hig_audit"]);
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
