import { ArrowRight, ExternalLink } from "lucide-react";
import type { TocEntry } from "@/lib/markdown";
import type { TopicMeta } from "@/lib/topics";
import { anchorFor } from "@/lib/utils";
import TopicCopyButton from "./TopicCopyButton";
import TopicToc from "./TopicToc";

const INSTALL_COMMAND = "npx skills add raintree-technology/hig-doctor";

interface TopicSidebarProps {
  skillDisplayName: string;
  categoryName: string;
  source: string;
  snapshotDate: string | null;
  toc: TocEntry[];
  relatedTopics: TopicMeta[];
}

function formatSnapshot(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export default function TopicSidebar({
  skillDisplayName,
  categoryName,
  source,
  snapshotDate,
  toc,
  relatedTopics,
}: TopicSidebarProps) {
  const showCategory = categoryName !== skillDisplayName;

  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      {/* On this page — the collapsible variant above the article covers small screens */}
      {toc.length >= 2 && (
        <div className="hidden lg:block rounded-xl glass p-6">
          <TopicToc items={toc} />
        </div>
      )}

      {/* About this reference */}
      <div className="rounded-xl glass p-6">
        <p className="text-[13px] uppercase tracking-wider text-muted-foreground mb-3">
          About this reference
        </p>
        <dl className="space-y-2.5 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground shrink-0">Skill</dt>
            <dd className="text-right">
              <a
                href={`/topics#${anchorFor(categoryName)}`}
                className="font-medium text-foreground hover:opacity-70 transition-opacity"
              >
                {skillDisplayName}
              </a>
            </dd>
          </div>
          {showCategory && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground shrink-0">Category</dt>
              <dd className="text-foreground text-right">{categoryName}</dd>
            </div>
          )}
          {snapshotDate && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground shrink-0">HIG snapshot</dt>
              <dd className="text-foreground text-right">
                <time dateTime={snapshotDate}>
                  {formatSnapshot(snapshotDate)}
                </time>
              </dd>
            </div>
          )}
        </dl>
        {source && (
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            View the current version on Apple Developer
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        )}
      </div>

      {/* Related topics */}
      {relatedTopics.length > 0 && (
        <div className="rounded-xl glass p-6">
          <p className="text-[13px] uppercase tracking-wider text-muted-foreground mb-3">
            Related topics
          </p>
          <ul className="space-y-1.5 list-none p-0">
            {relatedTopics.map((topic) => (
              <li key={topic.slug}>
                <a
                  href={`/topics/${topic.slug}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                >
                  <ArrowRight
                    className="h-3 w-3 shrink-0 opacity-50"
                    aria-hidden="true"
                  />
                  {topic.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Install CTA */}
      <div className="rounded-xl glass p-6">
        <p className="text-sm font-medium text-foreground mb-2">
          Get HIG guidance in your AI agent
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-[13px] text-muted-foreground truncate font-mono">
            {INSTALL_COMMAND}
          </code>
          <TopicCopyButton text={INSTALL_COMMAND} />
        </div>
      </div>
    </aside>
  );
}
