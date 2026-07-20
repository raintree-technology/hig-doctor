import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TopicActions from "@/components/TopicActions";
import TopicContent from "@/components/TopicContent";
import TopicCTA from "@/components/TopicCTA";
import TopicSidebar from "@/components/TopicSidebar";
import TopicToc from "@/components/TopicToc";
import { Separator } from "@/components/ui/separator";
import { extractH2Outline, renderMarkdown } from "@/lib/markdown";
import {
  getAllTopicSlugs,
  getTopicBySlug,
  splitAttribution,
} from "@/lib/topics";
import { anchorFor } from "@/lib/utils";

const BASE_URL = "https://apple.raintree.technology";

export function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return {};

  const title = `${topic.title} — Apple HIG Design Guidelines | HIG Doctor`;
  const description = topic.excerpt
    ? topic.excerpt
    : `Apple Human Interface Guidelines for ${topic.title}. Design guidance for iOS, macOS, iPadOS, tvOS, visionOS, and watchOS.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/topics/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/topics/${slug}`,
      type: "article",
      siteName: "HIG Doctor",
    },
    twitter: {
      card: "summary_large_image",
      site: "@raintree_tech",
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const { body, snapshotDate } = splitAttribution(topic.content);
  const html = await renderMarkdown(body);
  const toc = extractH2Outline(html);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: topic.title,
        description:
          topic.excerpt ||
          `Apple Human Interface Guidelines for ${topic.title}.`,
        url: `${BASE_URL}/topics/${slug}`,
        publisher: {
          "@type": "Organization",
          name: "Raintree",
          url: "https://raintree.technology",
        },
        about: {
          "@type": "SoftwareSourceCode",
          name: "HIG Doctor",
          url: BASE_URL,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Topics",
            item: `${BASE_URL}/topics`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: topic.title,
            item: `${BASE_URL}/topics/${slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="photo-bg min-h-screen">
      <Header variant="topic" />
      <main id="main-content" className="relative z-10 pt-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="mx-auto max-w-6xl px-6">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8"
          >
            <a href="/" className="hover:text-foreground transition-colors">
              Home
            </a>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <a
              href="/topics"
              className="hover:text-foreground transition-colors"
            >
              Topics
            </a>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-foreground">{topic.title}</span>
          </nav>

          {/* Title + actions */}
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-5">
              {topic.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/topics#${anchorFor(topic.categoryName)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                {topic.skillDisplayName}
                {topic.categoryName !== topic.skillDisplayName && (
                  <span className="text-muted-foreground/60">
                    · {topic.categoryName}
                  </span>
                )}
              </a>
              <TopicActions slug={slug} />
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 pb-16">
            <div className="min-w-0">
              <TopicToc
                items={toc}
                variant="collapsible"
                className="lg:hidden mb-8"
              />
              <TopicContent html={html} />

              {/* Attribution — same facts as the source block, as small print */}
              <p className="mt-10 border-t border-border/50 pt-5 text-[13px] leading-relaxed text-muted-foreground/80">
                Apple HIG text and imagery are © Apple Inc. This page is a
                structured index of Apple’s canonical documentation
                {snapshotDate ? ` (snapshot ${snapshotDate})` : ""}, provided
                for quick reference and AI-agent consumption — it isn’t
                affiliated with or endorsed by Apple.
                {topic.source ? (
                  <>
                    {" "}
                    Read the original at{" "}
                    <a
                      href={topic.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      developer.apple.com
                      <span className="sr-only"> (opens in new tab)</span>
                    </a>
                    .
                  </>
                ) : null}
              </p>

              {/* Sequential navigation within the skill */}
              {(topic.prevTopic || topic.nextTopic) && (
                <nav
                  aria-label={`More ${topic.skillDisplayName} topics`}
                  className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {topic.prevTopic ? (
                    <a
                      href={`/topics/${topic.prevTopic.slug}`}
                      className="group rounded-xl glass p-5 transition-colors hover:border-foreground/20"
                    >
                      <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                        <ArrowLeft
                          className="h-3 w-3 transition-transform group-hover:-translate-x-0.5"
                          aria-hidden="true"
                        />
                        Previous in {topic.skillDisplayName}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {topic.prevTopic.title}
                      </span>
                    </a>
                  ) : (
                    <span className="hidden sm:block" aria-hidden="true" />
                  )}
                  {topic.nextTopic && (
                    <a
                      href={`/topics/${topic.nextTopic.slug}`}
                      className="group rounded-xl glass p-5 text-right transition-colors hover:border-foreground/20"
                    >
                      <span className="flex items-center justify-end gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                        Next in {topic.skillDisplayName}
                        <ArrowRight
                          className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {topic.nextTopic.title}
                      </span>
                    </a>
                  )}
                </nav>
              )}
            </div>

            <TopicSidebar
              skillDisplayName={topic.skillDisplayName}
              categoryName={topic.categoryName}
              source={topic.source}
              snapshotDate={snapshotDate}
              toc={toc}
              relatedTopics={topic.relatedTopics}
            />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <Separator className="opacity-50" />
        </div>
        <TopicCTA />
      </main>
      <Footer />
    </div>
  );
}
