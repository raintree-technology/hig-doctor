"use client";

import { List } from "lucide-react";
import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/markdown";
import { cn } from "@/lib/utils";

function TocLinks({
  items,
  activeId,
}: {
  items: TocEntry[];
  activeId: string;
}) {
  return (
    <ul className="space-y-1 list-none p-0">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "true" : undefined}
            className={cn(
              "block border-l-2 py-1 pl-3 text-sm transition-colors",
              activeId === item.id
                ? "border-foreground text-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-muted-foreground",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * "On this page" navigation for a topic's h2 sections.
 * - `variant="sidebar"`: always-visible list with a scrollspy highlight.
 * - `variant="collapsible"`: <details> disclosure for compact layouts where
 *   the sidebar sits below the article.
 */
export default function TopicToc({
  items,
  variant = "sidebar",
  className,
}: {
  items: TocEntry[];
  variant?: "sidebar" | "collapsible";
  className?: string;
}) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (variant !== "sidebar" || items.length === 0) return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Highlight the last heading that has scrolled above the trigger line
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    for (const el of headings) observer.observe(el);
    return () => observer.disconnect();
  }, [items, variant]);

  if (items.length < 2) return null;

  if (variant === "collapsible") {
    return (
      <details className={cn("group rounded-xl glass", className)}>
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <List className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          On this page
          <span className="ml-auto text-xs text-muted-foreground group-open:hidden">
            {items.length} sections
          </span>
        </summary>
        <div className="px-4 pb-4">
          <TocLinks items={items} activeId="" />
        </div>
      </details>
    );
  }

  return (
    <nav aria-label="On this page" className={className}>
      <p className="text-[13px] uppercase tracking-wider text-muted-foreground mb-3">
        On this page
      </p>
      <TocLinks items={items} activeId={activeId} />
    </nav>
  );
}
