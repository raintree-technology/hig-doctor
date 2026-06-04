import { ChevronRight, FileText } from "lucide-react";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TopicCTA from "@/components/TopicCTA";
import { Separator } from "@/components/ui/separator";
import { categories } from "@/lib/skills-data";
import { getAllTopicMetas } from "@/lib/topics";

const BASE_URL = "https://apple.raintree.technology";

export const metadata: Metadata = {
  title: "Apple HIG Topics — Browse All Guidelines | HIG Skills",
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
    siteName: "Apple HIG Skills",
  },
};

export default function TopicsIndex() {
  const allMetas = getAllTopicMetas();

  // Group by category -> skill
  const grouped: {
    categoryName: string;
    skills: {
      skillDisplayName: string;
      topics: { slug: string; title: string }[];
    }[];
  }[] = [];

  for (const cat of categories) {
    const skills: (typeof grouped)[0]["skills"] = [];
    for (const skill of cat.skills) {
      const topics = allMetas
        .filter((m) => m.skillName === skill.name)
        .map((m) => ({ slug: m.slug, title: m.title }));
      if (topics.length > 0) {
        skills.push({ skillDisplayName: skill.displayName, topics });
      }
    }
    if (skills.length > 0) {
      grouped.push({ categoryName: cat.name, skills });
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

          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
              Apple HIG Topics
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse all {allMetas.length} Apple Human Interface Guidelines
              topics, organized by category.
            </p>
          </div>

          <div className="space-y-12 pb-16">
            {grouped.map((cat) => (
              <section key={cat.categoryName}>
                <h2 className="text-2xl font-semibold tracking-tight mb-6">
                  {cat.categoryName}
                </h2>
                <div className="space-y-6">
                  {cat.skills.map((skill) => (
                    <div key={skill.skillDisplayName}>
                      <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
                        {skill.skillDisplayName}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                        {skill.topics.map((topic) => (
                          <a
                            key={topic.slug}
                            href={`/topics/${topic.slug}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                          >
                            <FileText
                              className="h-3.5 w-3.5 shrink-0 opacity-50"
                              aria-hidden="true"
                            />
                            {topic.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
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
