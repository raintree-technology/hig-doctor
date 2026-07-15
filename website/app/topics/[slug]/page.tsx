import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TopicContent from "@/components/TopicContent";
import TopicCTA from "@/components/TopicCTA";
import TopicSidebar from "@/components/TopicSidebar";
import { Separator } from "@/components/ui/separator";
import { renderMarkdown } from "@/lib/markdown";
import { getAllTopicSlugs, getTopicBySlug } from "@/lib/topics";

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

  const html = await renderMarkdown(topic.content);

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

          {/* Title + metadata */}
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              {topic.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                {topic.categoryName}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1">
                {topic.skillDisplayName}
              </span>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 pb-16">
            <TopicContent html={html} />
            <TopicSidebar
              skillDisplayName={topic.skillDisplayName}
              categoryName={topic.categoryName}
              source={topic.source}
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
