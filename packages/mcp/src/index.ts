// hig-mcp — MCP server exposing Apple HIG skills and the audit engine.
//
// Transports:
//   stdio (default)         — Claude Desktop, Cursor, Windsurf, Claude Code
//   --http [port]           — streamable HTTP at POST /mcp (default port 3845)
//
// Tools:
//   hig_list_skills     — discover available skills and topics
//   hig_lookup          — fetch HIG reference markdown for a skill/topic
//   hig_search          — BM25 full-text search across all 150+ topics
//   hig_audit           — run the HIG compliance audit on a project directory
//   hig_audit_file      — audit a single file (fast inner-loop for agents)
//   hig_explain_finding — rule metadata + fix guidance + HIG reference excerpt
//
// Skills directory resolution order:
//   1. $HIG_SKILLS_DIR (explicit override)
//   2. <dist>/skills        (npm-installed package with bundled skills)
//   3. monorepo dev layout  (../../../skills from the source file)
//   4. $PWD/skills

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile, readdir, access, stat } from "node:fs/promises";
import { createServer as createHttpServer } from "node:http";
import { basename, dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import {
  audit,
  analyzeFile,
  getRuleById,
  ruleCatalog,
  suggestFix,
  HIG_SNAPSHOT_DATE,
  type PatternMatch,
  type Severity,
} from "@hig-doctor/core";
import { SearchIndex } from "./search";
import pkg from "../package.json";

const HIG_SOURCE_URL = "https://developer.apple.com/design/human-interface-guidelines/";
const MODULE_DIR = dirname(fileURLToPath(import.meta.url));

async function resolveSkillsDir(): Promise<string> {
  if (process.env.HIG_SKILLS_DIR) {
    const p = resolve(process.env.HIG_SKILLS_DIR);
    await access(p);
    return p;
  }
  const candidates = [
    resolve(MODULE_DIR, "skills"),
    // Monorepo layout: packages/mcp/{src,dist} → repo root
    resolve(MODULE_DIR, "..", "..", "..", "skills"),
    resolve(process.cwd(), "skills"),
  ];
  for (const c of candidates) {
    try {
      await access(c);
      return c;
    } catch {}
  }
  throw new Error(
    "Could not locate skills directory. Set HIG_SKILLS_DIR to the path of the skills/ folder.",
  );
}

const SLUG = /^[a-z0-9-]+$/;

function assertSlug(value: unknown, field: string): string {
  if (typeof value !== "string" || !SLUG.test(value)) {
    throw new Error(`Invalid ${field}: expected kebab-case identifier`);
  }
  return value;
}

function parseFrontmatter(raw: string): Record<string, string> {
  // Normalize CRLF first: on a Windows checkout the closing fence is "\r\n---",
  // which the LF-only pattern would miss, returning an empty (description-less)
  // frontmatter for every skill.
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const out: Record<string, string> = {};
  let currentKey = "";
  let buffer = "";
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (kv) {
      if (currentKey) out[currentKey] = buffer.trim();
      currentKey = kv[1];
      buffer = kv[2] === ">-" || kv[2] === ">" || kv[2] === "|" ? "" : kv[2];
    } else if (currentKey) {
      buffer += " " + line.trim();
    }
  }
  if (currentKey) out[currentKey] = buffer.trim();
  return out;
}

// BM25 index built lazily on first hig_search call, cached per process.
let searchIndexPromise: Promise<SearchIndex> | null = null;
function getSearchIndex(skillsDir: string): Promise<SearchIndex> {
  searchIndexPromise ??= SearchIndex.build(skillsDir);
  return searchIndexPromise;
}

const SEVERITY_ORDER: Severity[] = ["critical", "serious", "moderate"];

function severityCounts(matches: PatternMatch[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, serious: 0, moderate: 0 };
  for (const m of matches) {
    if (m.type === "concern" && m.severity) counts[m.severity]++;
  }
  return counts;
}

function gate(counts: Record<Severity, number>, failOn: Severity | undefined): boolean {
  if (!failOn) return false;
  const idx = SEVERITY_ORDER.indexOf(failOn);
  return SEVERITY_ORDER.slice(0, idx + 1).some(s => counts[s] > 0);
}

function assertFailOn(value: unknown): Severity | undefined {
  if (value == null) return undefined;
  if (value === "critical" || value === "serious" || value === "moderate") return value;
  // The inputSchema enum is advisory only on the low-level Server; validate
  // explicitly so an unrecognized value can't silently disable the gate.
  throw new Error("Invalid fail_on: expected one of 'critical', 'serious', 'moderate'");
}

/** Structured + mirrored-text result, per MCP structured-content guidance. */
function structured(payload: object, extraText?: string) {
  const content: Array<{ type: "text"; text: string }> = [
    { type: "text", text: JSON.stringify(payload, null, 2) },
  ];
  if (extraText) content.push({ type: "text", text: extraText });
  return { content, structuredContent: payload };
}

function findingView(m: PatternMatch, rawLine?: string) {
  const meta = getRuleById(m.ruleId);
  const suggestion = rawLine != null ? suggestFix(m, rawLine) : null;
  return {
    ruleId: m.ruleId,
    type: m.type,
    severity: m.type === "concern" ? (m.severity ?? "moderate") : null,
    line: m.line,
    excerpt: m.lineContent,
    label: m.pattern,
    engine: m.engine,
    fix: meta?.fix ?? null,
    hig: meta?.hig ?? null,
    suggestion: suggestion ? { before: suggestion.before, after: suggestion.after, safe: suggestion.safe } : null,
  };
}

const TOOLS = [
  {
    name: "hig_list_skills",
    description:
      "List all available Apple HIG skills with descriptions and reference topics. Use this first to discover what HIG guidance is available before calling hig_lookup.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "hig_lookup",
    description:
      "Fetch Apple HIG reference markdown. Provide a skill name (e.g. 'hig-foundations') to get the skill overview, or a skill+topic (e.g. skill='hig-foundations', topic='color') to get detailed reference for that topic. Content is from Apple's HIG, snapshot dated " +
      HIG_SNAPSHOT_DATE +
      ". If you don't know which skill/topic to use, call hig_search instead.",
    inputSchema: {
      type: "object",
      properties: {
        skill: {
          type: "string",
          description: "Skill identifier, e.g. 'hig-foundations', 'hig-components-layout', 'hig-platforms'.",
        },
        topic: {
          type: "string",
          description: "Optional topic within the skill, e.g. 'color', 'typography', 'accessibility', 'sidebars'. Call hig_list_skills first to see valid topics.",
        },
      },
      required: ["skill"],
    },
  },
  {
    name: "hig_search",
    description:
      "Full-text search (BM25) across all Apple HIG reference topics. Ask in natural language — e.g. 'minimum touch target size', 'when to use a sheet vs a popover' — and get ranked topics with snippets. Follow up with hig_lookup using the returned skill/topic.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural-language or keyword query." },
        limit: { type: "number", description: "Max results (default 8, cap 25)." },
      },
      required: ["query"],
    },
  },
  {
    name: "hig_audit",
    description:
      "Run a HIG compliance audit on a project directory. Scans source files across SwiftUI, UIKit, React, Vue, Svelte, Angular, Compose, Android XML, React Native, Flutter, CSS, and HTML. Returns severity counts (critical/serious/moderate), per-category breakdown, and a markdown report with code excerpts and HIG reference material. Honors hig-doctor.config.json, .hig-baseline.json, and inline hig-disable suppressions in the audited project.",
    inputSchema: {
      type: "object",
      properties: {
        directory: {
          type: "string",
          description: "Absolute path to the project directory to audit. Must be a directory the server process can read.",
        },
        fail_on: {
          type: "string",
          enum: ["critical", "serious", "moderate"],
          description: "Optional severity threshold. If set, the response includes gate_tripped=true when any concern at/above this severity is found.",
        },
      },
      required: ["directory"],
    },
  },
  {
    name: "hig_audit_file",
    description:
      "Audit a single source file for HIG compliance — the fast inner loop after writing or editing a file. Returns every finding with its rule ID, severity, line, fix guidance, and HIG citation. Use hig_explain_finding for deeper guidance on a specific rule.",
    inputSchema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          description: "Absolute path to the source file to audit.",
        },
        fail_on: {
          type: "string",
          enum: ["critical", "serious", "moderate"],
          description: "Optional severity threshold for gate_tripped.",
        },
      },
      required: ["file"],
    },
  },
  {
    name: "hig_explain_finding",
    description:
      "Explain an audit finding: full rule metadata (severity, engine, fix guidance) plus an excerpt of the Apple HIG reference the rule cites. Pass the ruleId from hig_audit / hig_audit_file results (e.g. 'swift/hardcoded-color').",
    inputSchema: {
      type: "object",
      properties: {
        rule_id: {
          type: "string",
          description: "Stable rule ID, e.g. 'swift/hardcoded-color', 'web/missing-alt'.",
        },
      },
      required: ["rule_id"],
    },
  },
];

async function handleTool(
  name: string,
  args: Record<string, unknown> | undefined,
) {
  const skillsDir = await resolveSkillsDir();

  if (name === "hig_list_skills") {
    const entries = await readdir(skillsDir, { withFileTypes: true });
    const skills: Array<{ skill: string; description: string; topics: string[] }> = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillName = entry.name;
      if (!SLUG.test(skillName)) continue;
      try {
        const skillFile = join(skillsDir, skillName, "SKILL.md");
        const raw = await readFile(skillFile, "utf-8");
        const fm = parseFrontmatter(raw);
        let topics: string[] = [];
        try {
          const refs = await readdir(join(skillsDir, skillName, "references"));
          topics = refs.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
        } catch {}
        skills.push({
          skill: skillName,
          description: fm.description || "",
          topics,
        });
      } catch {}
    }
    return structured({ snapshot: HIG_SNAPSHOT_DATE, source: HIG_SOURCE_URL, skills });
  }

  if (name === "hig_lookup") {
    const skill = assertSlug(args?.skill, "skill");
    const topic = args?.topic == null ? null : assertSlug(args.topic, "topic");
    const path = topic
      ? join(skillsDir, skill, "references", `${topic}.md`)
      : join(skillsDir, skill, "SKILL.md");
    const content = await readFile(path, "utf-8");
    const header = topic
      ? `Source: ${HIG_SOURCE_URL}${topic}  (snapshot ${HIG_SNAPSHOT_DATE})\n\n`
      : `Skill: ${skill}  (snapshot ${HIG_SNAPSHOT_DATE})\n\n`;
    return { content: [{ type: "text", text: header + content }] };
  }

  if (name === "hig_search") {
    const query = args?.query;
    if (typeof query !== "string" || query.trim() === "") {
      throw new Error("query must be a non-empty string");
    }
    const rawLimit = args?.limit;
    const limit = typeof rawLimit === "number" && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 25) : 8;
    const index = await getSearchIndex(skillsDir);
    const results = index.search(query, limit);
    return structured({
      snapshot: HIG_SNAPSHOT_DATE,
      query,
      results: results.map(r => ({
        ...r,
        lookup: r.topic ? { skill: r.skill, topic: r.topic } : { skill: r.skill },
      })),
    });
  }

  if (name === "hig_audit") {
    const directory = args?.directory;
    if (typeof directory !== "string" || !isAbsolute(directory)) {
      throw new Error("directory must be an absolute path");
    }
    const failOn = assertFailOn(args?.fail_on);
    const result = await audit(directory, skillsDir);
    const counts = severityCounts(result.allMatches);
    const summary = {
      snapshot: HIG_SNAPSHOT_DATE,
      severities: counts,
      frameworks: result.scanResult.frameworks,
      files: {
        code: result.scanResult.codeFiles.length,
        style: result.scanResult.styleFiles.length,
        config: result.scanResult.configFiles.length,
      },
      config: { path: result.configPath, warnings: result.configWarnings },
      baseline: { path: result.baselinePath, absorbed: result.baselined, stale: result.baselineStale },
      categories: result.categories.map((cat) => ({
        name: cat.label,
        skill: cat.skillName,
        critical: cat.critical,
        serious: cat.serious,
        moderate: cat.moderate,
        positives: cat.positives,
      })),
      failOn: failOn ?? null,
      gateTripped: gate(counts, failOn),
    };
    return structured(summary, result.markdown);
  }

  if (name === "hig_audit_file") {
    const file = args?.file;
    if (typeof file !== "string" || !isAbsolute(file)) {
      throw new Error("file must be an absolute path");
    }
    const info = await stat(file);
    if (!info.isFile()) throw new Error(`Not a file: ${file}`);
    const failOn = assertFailOn(args?.fail_on);
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");
    const matches = analyzeFile(content, basename(file));
    const counts = severityCounts(matches);
    return structured({
      snapshot: HIG_SNAPSHOT_DATE,
      file,
      severities: counts,
      findings: matches.map(m => findingView(m, lines[m.line - 1])),
      failOn: failOn ?? null,
      gateTripped: gate(counts, failOn),
    });
  }

  if (name === "hig_explain_finding") {
    const ruleId = args?.rule_id;
    if (typeof ruleId !== "string") throw new Error("rule_id must be a string");
    const meta = getRuleById(ruleId);
    if (!meta) {
      const catalog = ruleCatalog();
      const near = catalog
        .filter(r => r.id.includes(ruleId.split("/").pop() ?? ruleId))
        .slice(0, 5)
        .map(r => r.id);
      throw new Error(
        `Unknown rule ID: ${ruleId}${near.length > 0 ? ` — did you mean ${near.join(", ")}?` : ""}`,
      );
    }
    // Pull the reference excerpt for the cited HIG topic, if the corpus has it.
    const slug = meta.hig.slice(HIG_SOURCE_URL.length);
    let reference: { skill: string; topic: string; excerpt: string } | null = null;
    if (slug !== "") {
      const entries = await readdir(skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        try {
          const raw = await readFile(join(skillsDir, entry.name, "references", `${slug}.md`), "utf-8");
          const lines = raw.split("\n");
          reference = {
            skill: entry.name,
            topic: slug,
            excerpt: lines.slice(0, 80).join("\n") + (lines.length > 80 ? "\n…" : ""),
          };
          break;
        } catch {}
      }
    }
    return structured({ snapshot: HIG_SNAPSHOT_DATE, rule: meta, reference });
  }

  throw new Error(`Unknown tool: ${name}`);
}

function buildServer(): Server {
  const server = new Server(
    { name: pkg.name, version: pkg.version },
    { capabilities: { tools: {} } },
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
  // Surface tool failures as isError results (the spec-recommended channel) rather
  // than JSON-RPC protocol errors, so the calling model can see and recover from
  // missing topics, invalid arguments, or unreadable paths.
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      return await handleTool(request.params.name, request.params.arguments);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  });
  return server;
}

const httpFlagIndex = process.argv.indexOf("--http");
if (httpFlagIndex !== -1) {
  const portArg = Number(process.argv[httpFlagIndex + 1]);
  const port = Number.isInteger(portArg) && portArg > 0 ? portArg : 3845;
  // Stateless streamable HTTP: a fresh Server + transport per request, so no
  // session bookkeeping and safe concurrent clients.
  const httpServer = createHttpServer(async (req, res) => {
    if (!req.url || !req.url.startsWith("/mcp")) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "POST /mcp" }));
      return;
    }
    try {
      const server = buildServer();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on("close", () => {
        transport.close();
        server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      }
    }
  });
  httpServer.listen(port, () => {
    process.stderr.write(`hig-mcp streamable HTTP listening on http://localhost:${port}/mcp\n`);
  });
} else {
  const transport = new StdioServerTransport();
  await buildServer().connect(transport);
}
