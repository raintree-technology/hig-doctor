// search.ts — BM25 full-text search over the skills corpus.
// Indexes every SKILL.md and references/*.md once per process; queries are
// tokenized the same way as documents. No dependencies, ~O(terms) per query.
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

export interface SearchResult {
  skill: string;
  /** Topic slug within the skill, or null when the hit is the skill overview. */
  topic: string | null;
  title: string;
  score: number;
  snippet: string;
}

interface Doc {
  skill: string;
  topic: string | null;
  title: string;
  text: string;
  tokens: number;
  counts: Map<string, number>;
}

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
  "how", "in", "is", "it", "its", "of", "on", "or", "that", "the", "their",
  "this", "to", "was", "what", "when", "where", "which", "with", "you", "your",
]);

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    t => t.length > 1 && !STOPWORDS.has(t),
  );
}

function titleOf(markdown: string, fallback: string): string {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}

export class SearchIndex {
  private docs: Doc[] = [];
  private docFreq = new Map<string, number>();
  private avgLen = 0;

  private constructor() {}

  static async build(skillsDir: string): Promise<SearchIndex> {
    const index = new SearchIndex();
    const skills = (await readdir(skillsDir, { withFileTypes: true }))
      .filter(e => e.isDirectory())
      .map(e => e.name);
    for (const skill of skills) {
      try {
        const raw = await readFile(join(skillsDir, skill, "SKILL.md"), "utf-8");
        index.add(skill, null, titleOf(raw, skill), raw);
      } catch {}
      let refs: string[] = [];
      try {
        refs = (await readdir(join(skillsDir, skill, "references"))).filter(f => f.endsWith(".md"));
      } catch {}
      for (const ref of refs) {
        const topic = ref.replace(/\.md$/, "");
        try {
          const raw = await readFile(join(skillsDir, skill, "references", ref), "utf-8");
          index.add(skill, topic, titleOf(raw, topic), raw);
        } catch {}
      }
    }
    index.finalize();
    return index;
  }

  private add(skill: string, topic: string | null, title: string, text: string): void {
    const tokens = tokenize(text);
    const counts = new Map<string, number>();
    for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const term of counts.keys()) {
      this.docFreq.set(term, (this.docFreq.get(term) ?? 0) + 1);
    }
    this.docs.push({ skill, topic, title, text, tokens: tokens.length, counts });
  }

  private finalize(): void {
    this.avgLen = this.docs.reduce((s, d) => s + d.tokens, 0) / Math.max(1, this.docs.length);
  }

  get size(): number {
    return this.docs.length;
  }

  search(query: string, limit = 8): SearchResult[] {
    const terms = [...new Set(tokenize(query))];
    if (terms.length === 0) return [];
    const k1 = 1.2;
    const b = 0.75;
    const n = this.docs.length;
    const scored: Array<{ doc: Doc; score: number }> = [];
    for (const doc of this.docs) {
      let score = 0;
      for (const term of terms) {
        const tf = doc.counts.get(term) ?? 0;
        if (tf === 0) continue;
        const df = this.docFreq.get(term) ?? 0;
        const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
        score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (doc.tokens / this.avgLen))));
        // Title hits are strong relevance signals in reference corpora.
        if (tokenize(doc.title).includes(term)) score += idf * 0.5;
      }
      if (score > 0) scored.push({ doc, score });
    }
    scored.sort((a, b2) => b2.score - a.score);
    return scored.slice(0, limit).map(({ doc, score }) => ({
      skill: doc.skill,
      topic: doc.topic,
      title: doc.title,
      score: Math.round(score * 100) / 100,
      snippet: snippet(doc.text, terms),
    }));
  }
}

/** A readable window around the first occurrence of any query term. */
function snippet(text: string, terms: string[], radius = 140): string {
  // Skip frontmatter and the attribution comment so snippets start at content.
  const body = text
    .replace(/^---[\s\S]*?---\s*/m, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^>\s.*$/gm, "");
  const lower = body.toLowerCase();
  let at = -1;
  for (const term of terms) {
    const i = lower.indexOf(term);
    if (i !== -1 && (at === -1 || i < at)) at = i;
  }
  if (at === -1) at = 0;
  const start = Math.max(0, at - radius / 2);
  const end = Math.min(body.length, at + radius);
  return (
    (start > 0 ? "…" : "") +
    body.slice(start, end).replace(/\s+/g, " ").trim() +
    (end < body.length ? "…" : "")
  );
}
