import { getAllTopicSlugs, getTopicBySlug } from "@/lib/topics";

// Raw markdown endpoint — serves the full reference text for a HIG topic.
// Agents can retrieve the canonical content without HTML chrome.

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) {
    return new Response("Not found", { status: 404 });
  }

  const header = [
    `# ${topic.title}`,
    "",
    `Source: ${topic.source || "https://developer.apple.com/design/human-interface-guidelines/"}`,
    `Skill: ${topic.skillName}`,
    `Snapshot: 2025-02-02`,
    "",
    "---",
    "",
  ].join("\n");

  return new Response(header + topic.content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
