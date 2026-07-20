import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TopicCTA from "@/components/TopicCTA";
import TopicsExplorer, {
  type ExplorerCategory,
} from "@/components/TopicsExplorer";
import { Separator } from "@/components/ui/separator";
import { categories } from "@/lib/skills-data";
import { getAllTopicMetas } from "@/lib/topics";
import { anchorFor } from "@/lib/utils";

const BASE_URL = "https://apple.raintree.technology";

export const metadata: Metadata = {
  title: "Apple HIG Topics — Browse All Guidelines | HIG Doctor",
  description:
    "Browse all 156 Apple Human Interface Guidelines topics. Design guidance for iOS, macOS, iPadOS, tvOS, visionOS, and watchOS components, patterns, and foundations.",
  alternates: {
    canonical: "/topics",
  },
  openGraph: {
    title: "Apple HIG Topics — Browse All Guidelines",
    description:
      "Browse all Apple Human Interface Guidelines topics. Design guidance for components, patterns, foundations, and technologies.",
    url: "/topics",
    type: "website",
    siteName: "HIG Doctor",
  },
};

export default function TopicsIndex() {
  const allMetas = getAllTopicMetas();

  const grouped: ExplorerCategory[] = [];
  for (const cat of categories) {
    const skills: ExplorerCategory["skills"] = [];
    for (const skill of cat.skills) {
      const topics = allMetas
        .filter((m) => m.skillName === skill.name)
        .map((m) => ({ slug: m.slug, title: m.title }));
      if (topics.length > 0) {
        skills.push({ skillDisplayName: skill.displayName, topics });
      }
    }
    if (skills.length > 0) {
      grouped.push({
        categoryName: cat.name,
        anchor: anchorFor(cat.name),
        skills,
      });
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Apple HIG Topics",
        description: "Browse all Apple Human Interface Guidelines topics.",
        url: `${BASE_URL}/topics`,
        publisher: {
          "@type": "Organization",
          name: "Raintree",
          url: "https://raintree.technology",
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
            <span className="text-foreground">Topics</span>
          </nav>

          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              Apple HIG Topics
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every Apple Human Interface Guidelines topic in HIG Doctor —
              search it, or jump to a category.
            </p>
          </div>

          <TopicsExplorer categories={grouped} totalTopics={allMetas.length} />
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
