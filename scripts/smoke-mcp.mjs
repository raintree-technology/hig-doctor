import assert from "node:assert/strict"
import { spawn } from "node:child_process"

const requests = [
  {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "ci", version: "0" },
    },
  },
  {
    jsonrpc: "2.0",
    method: "notifications/initialized",
  },
  {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {},
  },
]

const child = spawn("bun", ["packages/hig-doctor/src-mcp/src/index.ts"], {
  stdio: ["pipe", "pipe", "pipe"],
})

let stdout = ""
let stderr = ""
child.stdout.setEncoding("utf8")
child.stderr.setEncoding("utf8")
child.stdout.on("data", (chunk) => {
  stdout += chunk
})
child.stderr.on("data", (chunk) => {
  stderr += chunk
})

for (const request of requests) {
  child.stdin.write(`${JSON.stringify(request)}\n`)
}
child.stdin.end()

const exit = await new Promise((resolve) => {
  const timer = setTimeout(() => {
    child.kill()
  }, 3000)

  child.on("close", (code, signal) => {
    clearTimeout(timer)
    resolve({ code, signal })
  })
})

assert.match(stdout, /"name":"hig_list_skills"/, stderr || JSON.stringify(exit))
assert.match(stdout, /"name":"hig_lookup"/, stderr || JSON.stringify(exit))
assert.match(stdout, /"name":"hig_audit"/, stderr || JSON.stringify(exit))
