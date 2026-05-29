import { ArrowRight, ExternalLink, FileText } from "lucide-react";
import type { TopicMeta } from "@/lib/topics";
import TopicCopyButton from "./TopicCopyButton";

const INSTALL_COMMAND = "npx skills add raintree-technology/hig-doctor";

interface TopicSidebarProps {
  skillDisplayName: string;
  categoryName: string;
  source: string;
  relatedTopics: TopicMeta[];
}

export default function TopicSidebar({
  skillDisplayName,
  categoryName,
  source,
  relatedTopics,
}: TopicSidebarProps) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      {/* Skill info */}
      <div className="rounded-xl glass p-6">
        <p className="text-[13px] uppercase tracking-wider text-muted-foreground mb-2">
          Skill
        </p>
        <a
          href="/#skills"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
        >
          <FileText
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          {skillDisplayName}
          <span className="text-muted-foreground font-normal">
            {categoryName}
          </span>
        </a>
      </div>

      {/* Apple Developer link */}
      {source && (
        <div className="rounded-xl glass p-6">
          <a
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
            View on Apple Developer
          </a>
        </div>
      )}

      {/* Related topics */}
      {relatedTopics.length > 0 && (
        <div className="rounded-xl glass p-6">
          <p className="text-[13px] uppercase tracking-wider text-muted-foreground mb-3">
            Related topics
          </p>
          <ul className="space-y-1.5">
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
