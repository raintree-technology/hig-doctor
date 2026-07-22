// hig-drift.ts — detect when Apple's live HIG diverges from our snapshot.
//
// Apple publishes each HIG page as DocC JSON at a predictable URL, so the
// "pages are JS-rendered, not automatable" caveat no longer holds for DETECTION
// (a human still writes the rewrite). This script fetches each reference topic's
// canonical page as JSON, extracts its text content, normalizes and hashes it,
// and diffs against a committed manifest.
//
//   bun scripts/hig-drift.ts --seed          # write hig-snapshot.json
//   bun scripts/hig-drift.ts --check         # exit 1 + report on drift (CI)
//   bun scripts/hig-drift.ts --check --json  # machine-readable drift report
//
// Nightly CI runs --check and opens a per-topic issue for each drifted page.
import { createHash } from "node:crypto";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const REPO_ROOT = join(import.meta.dir, "..");
const SKILLS_DIR = join(REPO_ROOT, "skills");
const MANIFEST_PATH = join(REPO_ROOT, "hig-snapshot.json");
const DESIGN_PREFIX = "https://developer.apple.com/design/human-interface-guidelines/";
const DOCC_PREFIX = "https://developer.apple.com/tutorials/data/design/human-interface-guidelines/";

interface Topic {
  skill: string;
  topic: string;
  source: string;
  jsonUrl: string;
}

interface Manifest {
  generated: string;
  snapshotDate: string;
  topics: Record<string, { source: string; hash: string }>;
}

function sourceOf(markdown: string): string | null {
  const m = markdown.match(/^source:\s*(\S+)/m);
  return m ? m[1] : null;
}

// design/.../<slug> → tutorials/data/design/.../<slug>.json
export function doccUrl(source: string): string | null {
  if (!source.startsWith(DESIGN_PREFIX)) return null;
  const slug = source.slice(DESIGN_PREFIX.length).replace(/\/$/, "");
  if (!slug) return null;
  return `${DOCC_PREFIX}${slug}.json`;
}

async function collectTopics(): Promise<Topic[]> {
  const topics: Topic[] = [];
  for (const skill of await readdir(SKILLS_DIR)) {
    const refsDir = join(SKILLS_DIR, skill, "references");
    let files: string[] = [];
    try {
      files = (await readdir(refsDir)).filter(f => f.endsWith(".md"));
    } catch {
      continue;
    }
    for (const file of files) {
      const raw = await readFile(join(refsDir, file), "utf-8");
      const source = sourceOf(raw);
      if (!source) continue;
      const jsonUrl = doccUrl(source);
      if (!jsonUrl) continue;
      topics.push({ skill, topic: file.replace(/\.md$/, ""), source, jsonUrl });
    }
  }
  return topics.sort((a, b) => a.topic.localeCompare(b.topic));
}

// Recursively pull every {type:"text", text} node's text, in document order, so
// the hash tracks prose changes while ignoring identifiers, image refs, layout
// hints, and JSON key ordering.
function extractText(node: unknown, out: string[]): void {
  if (node == null) return;
  if (Array.isArray(node)) {
    for (const item of node) extractText(item, out);
    return;
  }
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (obj.type === "text" && typeof obj.text === "string") out.push(obj.text);
    if (typeof obj.title === "string") out.push(obj.title);
    for (const key of Object.keys(obj)) {
      if (key === "references" || key === "schemaVersion" || key === "identifier") continue;
      extractText(obj[key], out);
    }
  }
}

export function hashContent(json: unknown): string {
  const out: string[] = [];
  extractText(json, out);
  const normalized = out.join(" ").replace(/\s+/g, " ").trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

async function fetchHash(url: string): Promise<string> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return hashContent(await res.json());
}

// Bounded-concurrency map so we don't hammer Apple with 156 parallel requests.
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function currentSnapshotDate(): Promise<string> {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf-8");
    return (JSON.parse(raw) as Manifest).snapshotDate ?? "unknown";
  } catch {
    // Fall back to the engine constant if no manifest exists yet.
    const patterns = await readFile(join(REPO_ROOT, "packages/core/src/patterns.ts"), "utf-8");
    return patterns.match(/HIG_SNAPSHOT_DATE\s*=\s*"([^"]+)"/)?.[1] ?? "unknown";
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const seed = args.has("--seed");
  const asJson = args.has("--json");
  if (!seed && !args.has("--check")) {
    process.stderr.write("Usage: bun scripts/hig-drift.ts (--seed | --check) [--json]\n");
    process.exit(2);
  }

  const topics = await collectTopics();
  const fetched = await mapLimit(topics, 6, async (t) => {
    try {
      return { topic: t, hash: await fetchHash(t.jsonUrl), error: null as string | null };
    } catch (err) {
      return { topic: t, hash: null as string | null, error: err instanceof Error ? err.message : String(err) };
    }
  });

  const snapshotDate = await currentSnapshotDate();

  if (seed) {
    const manifest: Manifest = { generated: new Date().toISOString().slice(0, 10), snapshotDate, topics: {} };
    let ok = 0;
    for (const f of fetched) {
      if (f.hash) {
        manifest.topics[f.topic.topic] = { source: f.topic.source, hash: f.hash };
        ok++;
      } else {
        process.stderr.write(`skip ${f.topic.topic}: ${f.error}\n`);
      }
    }
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
    process.stderr.write(`Seeded ${MANIFEST_PATH}: ${ok}/${topics.length} topics\n`);
    return;
  }

  // --check
  let manifest: Manifest;
  try {
    manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf-8")) as Manifest;
  } catch {
    process.stderr.write(`No manifest at ${MANIFEST_PATH}. Run --seed first.\n`);
    process.exit(2);
  }

  const changed: string[] = [];
  const added: string[] = [];
  const errors: Array<{ topic: string; error: string }> = [];
  for (const f of fetched) {
    if (!f.hash) {
      errors.push({ topic: f.topic.topic, error: f.error ?? "unknown" });
      continue;
    }
    const prev = manifest.topics[f.topic.topic];
    if (!prev) added.push(f.topic.topic);
    else if (prev.hash !== f.hash) changed.push(f.topic.topic);
  }
  const known = new Set(fetched.map(f => f.topic.topic));
  const removed = Object.keys(manifest.topics).filter(t => !known.has(t));

  const drift = changed.length + added.length + removed.length;
  const report = {
    snapshotDate: manifest.snapshotDate,
    checked: topics.length,
    changed,
    added,
    removed,
    errors,
    driftCount: drift,
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stderr.write(`Checked ${topics.length} topics against snapshot ${manifest.snapshotDate}\n`);
    if (changed.length) process.stderr.write(`Changed (${changed.length}): ${changed.join(", ")}\n`);
    if (added.length) process.stderr.write(`New topics (${added.length}): ${added.join(", ")}\n`);
    if (removed.length) process.stderr.write(`Removed (${removed.length}): ${removed.join(", ")}\n`);
    if (errors.length) process.stderr.write(`Fetch errors (${errors.length}): ${errors.map(e => e.topic).join(", ")}\n`);
    process.stderr.write(drift > 0 ? `DRIFT: ${drift} topic(s) diverged from the snapshot.\n` : `No drift.\n`);
  }

  // Fetch errors alone don't fail the check (Apple may rate-limit); real drift does.
  process.exit(drift > 0 ? 1 : 0);
}

// Run only when invoked directly (not when a test imports the pure helpers).
if (import.meta.main) {
  main().catch((err) => {
    process.stderr.write(`hig-drift failed: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(2);
  });
}
