import fs from "node:fs";
import path from "node:path";
import { categories } from "./skills-data";

export interface TopicMeta {
  slug: string;
  title: string;
  source: string;
  excerpt: string;
  skillName: string;
  skillDisplayName: string;
  categoryName: string;
  filePath: string;
}

export interface TopicData extends TopicMeta {
  content: string;
  relatedTopics: TopicMeta[];
}

const SKILLS_DIR = path.join(process.cwd(), "..", "skills");
const APPLE_HIG_SOURCE_PREFIX = "/design/human-interface-guidelines";

export function sanitizeTopicSourceUrl(rawSource: string): string {
  const trimmed = rawSource.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return "";
    if (parsed.hostname !== "developer.apple.com") return "";
    if (
      parsed.pathname !== APPLE_HIG_SOURCE_PREFIX &&
      !parsed.pathname.startsWith(`${APPLE_HIG_SOURCE_PREFIX}/`)
    ) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function parseFrontmatter(raw: string): {
  title: string;
  source: string;
  content: string;
} {
  // Format: ---\ntitle: "..."\nsource: ...\n\n# Content...
  // No closing ---
  const lines = raw.split("\n");
  let title = "";
  let source = "";
  let contentStart = 0;

  if (lines[0]?.trim() === "---") {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("title:")) {
        title = line
          .slice(6)
          .trim()
          .replace(/^["']|["']$/g, "");
      } else if (line.startsWith("source:")) {
        source = line.slice(7).trim();
      } else if (line.trim() === "") {
        contentStart = i + 1;
        break;
      }
    }
  }

  // Clean title: remove " | Apple Developer Documentation" suffix
  title = title.replace(/\s*\|\s*Apple Developer Documentation$/, "");

  return {
    title,
    source: sanitizeTopicSourceUrl(source),
    content: lines.slice(contentStart).join("\n"),
  };
}

function extractExcerpt(content: string, maxLen = 155): string {
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip headings, empty lines, table rows, horizontal rules, and list items that are too short
    if (
      !trimmed ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("|") ||
      trimmed.startsWith("---") ||
      trimmed.startsWith("```")
    )
      continue;
    // Strip markdown formatting: bold, italic, links, inline code
    const plain = trimmed
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) -> text
      .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold** -> bold
      .replace(/\*([^*]+)\*/g, "$1") // *italic* -> italic
      .replace(/`([^`]+)`/g, "$1") // `code` -> code
      .replace(/^[-*+]\s+/, ""); // list markers
    if (plain.length < 20) continue;
    if (plain.length <= maxLen) return plain;
    // Truncate at word boundary
    const truncated = plain.slice(0, maxLen).replace(/\s+\S*$/, "");
    return `${truncated}...`;
  }
  return "";
}

// Build a lookup: skillName -> { categoryName, skillDisplayName }
function buildSkillLookup(): Map<
  string,
  { categoryName: string; skillDisplayName: string }
> {
  const map = new Map<
    string,
    { categoryName: string; skillDisplayName: string }
  >();
  for (const cat of categories) {
    for (const skill of cat.skills) {
      map.set(skill.name, {
        categoryName: cat.name,
        skillDisplayName: skill.displayName,
      });
    }
  }
  return map;
}

let _cachedMetas: TopicMeta[] | null = null;

export function getAllTopicMetas(): TopicMeta[] {
  if (_cachedMetas) return _cachedMetas;

  const skillLookup = buildSkillLookup();
  const metas: TopicMeta[] = [];

  for (const cat of categories) {
    for (const skill of cat.skills) {
      const refsDir = path.join(SKILLS_DIR, skill.name, "references");
      if (!fs.existsSync(refsDir)) continue;

      const files = fs.readdirSync(refsDir).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        const slug = file.replace(/\.md$/, "");
        const filePath = path.join(refsDir, file);
        const raw = fs.readFileSync(filePath, "utf-8");
        const { title, source, content } = parseFrontmatter(raw);

        const info = skillLookup.get(skill.name);
        metas.push({
          slug,
          title: title || slug.replace(/-/g, " "),
          source,
          excerpt: extractExcerpt(content),
          skillName: skill.name,
          skillDisplayName: info?.skillDisplayName ?? skill.displayName,
          categoryName: info?.categoryName ?? cat.name,
          filePath,
        });
      }
    }
  }

  _cachedMetas = metas;
  return metas;
}

export function getAllTopicSlugs(): string[] {
  return getAllTopicMetas().map((m) => m.slug);
}

// Build a set of all valid topic slugs for link rewriting
let _slugSet: Set<string> | null = null;
export function getTopicSlugSet(): Set<string> {
  if (_slugSet) return _slugSet;
  _slugSet = new Set(getAllTopicSlugs());
  return _slugSet;
}

export function getTopicBySlug(slug: string): TopicData | null {
  const metas = getAllTopicMetas();
  const meta = metas.find((m) => m.slug === slug);
  if (!meta) return null;

  const raw = fs.readFileSync(meta.filePath, "utf-8");
  const { content } = parseFrontmatter(raw);

  // Related topics: same skill first, then same category, capped at 8
  const related: TopicMeta[] = [];
  const sameSkill = metas.filter(
    (m) => m.skillName === meta.skillName && m.slug !== slug,
  );
  const sameCategory = metas.filter(
    (m) =>
      m.categoryName === meta.categoryName &&
      m.skillName !== meta.skillName &&
      m.slug !== slug,
  );

  related.push(...sameSkill, ...sameCategory);
  const relatedTopics = related.slice(0, 8);

  return {
    ...meta,
    content,
    relatedTopics,
  };
}
