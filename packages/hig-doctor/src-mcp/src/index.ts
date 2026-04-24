// hig-mcp — MCP server exposing Apple HIG skills and the audit tool.
//
// Transports: stdio (Claude Desktop, Cursor, Windsurf, Claude Code).
//
// Tools:
//   hig_list_skills   — discover available skills and topics
//   hig_lookup        — fetch HIG reference markdown for a skill/topic
//   hig_audit         — run the universal HIG compliance audit on a project
//
// Skills directory resolution order:
//   1. $HIG_SKILLS_DIR (explicit override)
//   2. <dist>/skills        (npm-installed package with bundled skills)
//   3. monorepo dev layout  (../../../../skills from the source file)
//   4. $PWD/skills

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile, readdir, access } from "node:fs/promises";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { audit } from "../../src-termcast/src/audit";

const HIG_SNAPSHOT_DATE = "2025-02-02";
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
    resolve(MODULE_DIR, "..", "..", "..", "..", "skills"),
    resolve(MODULE_DIR, "..", "..", "..", "..", "..", "skills"),
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
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
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

const server = new Server(
  { name: "hig-doctor", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "hig_list_skills",
      description:
        "List all available Apple HIG skills with descriptions and reference topics. Use this first to discover what HIG guidance is available before calling hig_lookup.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "hig_lookup",
      description:
        "Fetch Apple HIG reference markdown. Provide a skill name (e.g. 'hig-foundations') to get the skill overview, or a skill+topic (e.g. skill='hig-foundations', topic='color') to get detailed reference for that topic. Content is from Apple's HIG, snapshot dated " +
        HIG_SNAPSHOT_DATE +
        ".",
      inputSchema: {
        type: "object",
        properties: {
          skill: {
            type: "string",
            description:
              "Skill identifier, e.g. 'hig-foundations', 'hig-components-layout', 'hig-platforms'.",
          },
          topic: {
            type: "string",
            description:
              "Optional topic within the skill, e.g. 'color', 'typography', 'accessibility', 'sidebars'. Call hig_list_skills first to see valid topics.",
          },
        },
        required: ["skill"],
      },
    },
    {
      name: "hig_audit",
      description:
        "Run a HIG compliance audit on a project directory. Scans source files across SwiftUI, UIKit, React, Vue, Svelte, Angular, Compose, Android XML, React Native, Flutter, CSS, and HTML. Returns severity counts (critical/serious/moderate) plus a markdown report with code excerpts and HIG reference material.",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description:
              "Absolute path to the project directory to audit. Must be a directory the server process can read.",
          },
          fail_on: {
            type: "string",
            enum: ["critical", "serious", "moderate"],
            description:
              "Optional severity threshold. If set, the response includes gate_tripped=true when any concern at/above this severity is found.",
          },
        },
        required: ["directory"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
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
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              snapshot: HIG_SNAPSHOT_DATE,
              source: HIG_SOURCE_URL,
              skills,
            },
            null,
            2,
          ),
        },
      ],
    };
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

  if (name === "hig_audit") {
    const directory = args?.directory;
    if (typeof directory !== "string" || !isAbsolute(directory)) {
      throw new Error("directory must be an absolute path");
    }
    const failOn = args?.fail_on as "critical" | "serious" | "moderate" | undefined;
    const result = await audit(directory, skillsDir);
    const critical = result.categories.reduce((s, c) => s + c.critical, 0);
    const serious = result.categories.reduce((s, c) => s + c.serious, 0);
    const moderate = result.categories.reduce((s, c) => s + c.moderate, 0);
    let gateTripped = false;
    if (failOn === "critical") gateTripped = critical > 0;
    else if (failOn === "serious") gateTripped = critical + serious > 0;
    else if (failOn === "moderate") gateTripped = critical + serious + moderate > 0;

    const summary = {
      severities: { critical, serious, moderate },
      frameworks: result.scanResult.frameworks,
      files: {
        code: result.scanResult.codeFiles.length,
        style: result.scanResult.styleFiles.length,
        config: result.scanResult.configFiles.length,
      },
      categories: result.categories.map((cat) => ({
        name: cat.label,
        skill: cat.skillName,
        critical: cat.critical,
        serious: cat.serious,
        moderate: cat.moderate,
        positives: cat.positives,
      })),
      failOn: failOn ?? null,
      gateTripped,
    };

    return {
      content: [
        { type: "text", text: JSON.stringify(summary, null, 2) },
        { type: "text", text: result.markdown },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
