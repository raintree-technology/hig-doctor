import { getAllTopicMetas } from "@/lib/topics";

const BASE_URL = "https://apple.raintree.technology";

// llms.txt — structured index of HIG content for LLM retrieval.
// Spec: https://llmstxt.org/
export const dynamic = "force-static";

export function GET() {
  const topics = getAllTopicMetas();

  const byCategory = new Map<string, typeof topics>();
  for (const t of topics) {
    if (!byCategory.has(t.categoryName)) byCategory.set(t.categoryName, []);
    byCategory.get(t.categoryName)!.push(t);
  }

  const lines: string[] = [];
  lines.push("# Apple HIG Skills");
  lines.push("");
  lines.push(
    "> Apple Human Interface Guidelines as agent skills for AI coding agents. Snapshot from February 2025, structured for progressive disclosure. Raw markdown is available for every topic — append `.md` or use the `/raw/<slug>` endpoint.",
  );
  lines.push("");
  lines.push(
    "Source: https://developer.apple.com/design/human-interface-guidelines/  ·  License: Apple content is Apple IP, referenced here for AI agent guidance.",
  );
  lines.push("");
  lines.push("## MCP server");
  lines.push("");
  lines.push(
    `- [hig-doctor MCP server](${BASE_URL}/mcp): stdio MCP server exposing hig_list_skills, hig_lookup, and hig_audit tools.`,
  );
  lines.push("");
  lines.push("## Audit tool");
  lines.push("");
  lines.push(
    `- [hig-doctor audit CLI](${BASE_URL}): universal HIG compliance scanner across 12 frameworks, emits severity-bucketed markdown/JSON.`,
  );
  lines.push("");

  const sortedCategories = [...byCategory.keys()].sort();
  for (const cat of sortedCategories) {
    lines.push(`## ${cat}`);
    lines.push("");
    const ts = byCategory.get(cat)!.slice().sort((a, b) => a.title.localeCompare(b.title));
    for (const t of ts) {
      const desc = t.excerpt ? `: ${t.excerpt}` : "";
      lines.push(`- [${t.title}](${BASE_URL}/raw/${t.slug})${desc}`);
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
