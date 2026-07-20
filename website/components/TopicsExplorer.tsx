"use client";

import { FileText, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface ExplorerTopic {
  slug: string;
  title: string;
}

export interface ExplorerSkillGroup {
  skillDisplayName: string;
  topics: ExplorerTopic[];
}

export interface ExplorerCategory {
  categoryName: string;
  anchor: string;
  skills: ExplorerSkillGroup[];
}

function topicMatches(topic: ExplorerTopic, skillName: string, q: string) {
  return (
    topic.title.toLowerCase().includes(q) || skillName.toLowerCase().includes(q)
  );
}

export default function TopicsExplorer({
  categories,
  totalTopics,
}: {
  categories: ExplorerCategory[];
  totalTopics: number;
}) {
  const [query, setQuery] = useState("");

  // Restore a shared/bookmarked search (?q=...) after mount; reading
  // window.location here avoids a useSearchParams Suspense boundary on an
  // otherwise fully static page.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  // Keep the URL restorable without adding history entries per keystroke.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState(null, "", url);
  }, [query]);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return categories;
    return categories
      .map((cat) => {
        const categoryHit = cat.categoryName.toLowerCase().includes(q);
        const skills = cat.skills
          .map((skill) => ({
            ...skill,
            topics:
              categoryHit || skill.skillDisplayName.toLowerCase().includes(q)
                ? skill.topics
                : skill.topics.filter((t) =>
                    topicMatches(t, skill.skillDisplayName, q),
                  ),
          }))
          .filter((skill) => skill.topics.length > 0);
        return { ...cat, skills };
      })
      .filter((cat) => cat.skills.length > 0);
  }, [categories, q]);

  const matchCount = q
    ? filtered.reduce(
        (sum, cat) =>
          sum + cat.skills.reduce((s, sk) => s + sk.topics.length, 0),
        0,
      )
    : totalTopics;

  return (
    <div>
      {/* Search */}
      <div className="mx-auto max-w-xl mb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search topics — try “tab bars”, “dark mode”, “Apple Pay”…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border bg-card/50 pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            aria-label="Search HIG topics"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p
          className="mt-2 text-center text-sm text-muted-foreground"
          aria-live="polite"
        >
          {q
            ? `${matchCount} of ${totalTopics} topics match “${query.trim()}”`
            : `${totalTopics} topics across ${categories.length} categories`}
        </p>
      </div>

      {/* Category jump nav — hidden while searching, when sections may be gone */}
      {!q && (
        <nav
          aria-label="Topic categories"
          className="mb-10 flex flex-wrap items-center justify-center gap-2"
        >
          {categories.map((cat) => {
            const count = cat.skills.reduce((s, sk) => s + sk.topics.length, 0);
            return (
              <a
                key={cat.anchor}
                href={`#${cat.anchor}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                {cat.categoryName}
                <span className="text-xs text-muted-foreground/60 tabular-nums">
                  {count}
                </span>
              </a>
            );
          })}
        </nav>
      )}

      {/* Empty state */}
      {q && filtered.length === 0 && (
        <div className="rounded-xl glass px-6 py-12 text-center">
          <p className="text-foreground font-medium mb-1">
            No topics match “{query.trim()}”
          </p>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Try a component name (“buttons”), a platform (“watchOS”), or a
            design concept (“typography”). Every topic here comes from Apple’s
            Human Interface Guidelines.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Category sections */}
      <div className="space-y-8 pb-16">
        {filtered.map((cat) => {
          const showSkillHeadings =
            cat.skills.length > 1 ||
            cat.skills.some((sk) => sk.skillDisplayName !== cat.categoryName);
          return (
            <section
              key={cat.categoryName}
              id={q ? undefined : cat.anchor}
              aria-labelledby={`cat-${cat.anchor}`}
              className="rounded-xl glass p-6 sm:p-8 scroll-mt-24"
            >
              <h2
                id={`cat-${cat.anchor}`}
                className="text-2xl font-semibold tracking-tight mb-5"
              >
                {cat.categoryName}
              </h2>
              <div className={cn(showSkillHeadings ? "space-y-6" : "")}>
                {cat.skills.map((skill) => (
                  <div key={skill.skillDisplayName}>
                    {showSkillHeadings && (
                      <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
                        {skill.skillDisplayName}
                      </h3>
                    )}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 list-none p-0">
                      {skill.topics.map((topic) => (
                        <li key={topic.slug}>
                          <a
                            href={`/topics/${topic.slug}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5"
                          >
                            <FileText
                              className="h-3.5 w-3.5 shrink-0 opacity-50"
                              aria-hidden="true"
                            />
                            {topic.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
