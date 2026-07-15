import { CheckCircle2, ChevronRight, Terminal } from "lucide-react";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Separator } from "@/components/ui/separator";

const BASE_URL = "https://apple.raintree.technology";
const REPO_URL = "https://github.com/raintree-technology/hig-doctor";

export const metadata: Metadata = {
  title: "HIG Doctor MCP server and audit CLI",
  description:
    "Install and submit HIG Doctor: an MCP server and audit CLI that gives coding agents Apple HIG lookup, reference topics, and project audits.",
  alternates: {
    canonical: "/mcp",
  },
  openGraph: {
    title: "HIG Doctor MCP server and audit CLI",
    description:
      "MCP tools and CLI audits for Apple HIG guidance across SwiftUI, UIKit, React, Next.js, Flutter, Compose, HTML, and CSS.",
    url: "/mcp",
    type: "website",
    siteName: "HIG Doctor",
  },
};

const tools = [
  {
    name: "hig_list_skills",
    text: "List every HIG skill with descriptions and reference topics.",
  },
  {
    name: "hig_lookup",
    text: "Fetch a HIG skill or a specific topic as Markdown for an agent.",
  },
  {
    name: "hig_audit",
    text: "Run a project audit with severity counts, Markdown output, and an optional fail gate.",
  },
];

const frameworks = [
  "SwiftUI",
  "UIKit",
  "React",
  "Next.js",
  "Vue",
  "Svelte",
  "Angular",
  "React Native",
  "Flutter",
  "Jetpack Compose",
  "Android XML",
  "HTML",
  "CSS",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "HIG Doctor MCP server and audit CLI",
      url: `${BASE_URL}/mcp`,
      description:
        "Install and submit HIG Doctor: an MCP server and audit CLI that gives coding agents Apple HIG lookup, reference topics, and project audits.",
      isPartOf: {
        "@type": "WebSite",
        name: "HIG Doctor",
        url: BASE_URL,
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "HIG Doctor",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: BASE_URL,
      codeRepository: REPO_URL,
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Model Context Protocol server",
        "Apple HIG reference lookup",
        "Universal HIG audit CLI",
        "Severity-bucketed Markdown and JSON reports",
      ],
    },
  ],
};

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border bg-[#1d1d1f] px-4 py-3.5 text-sm leading-7 text-white/85">
      <code>{children}</code>
    </pre>
  );
}

export default function McpPage() {
  return (
    <div className="photo-bg min-h-screen">
      <Header variant="topic" />
      <main id="main-content" className="relative z-10 pt-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mx-auto max-w-5xl px-6 pb-20">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <a href="/" className="transition-colors hover:text-foreground">
              Home
            </a>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-foreground">MCP and audit CLI</span>
          </nav>

          <section className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Submission-ready technical surface
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Apple HIG lookup and audits for MCP-compatible agents.
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              HIG Doctor exposes Apple Human Interface Guidelines skills through
              the Model Context Protocol and ships a CLI that scans native and
              web UI code for accessibility, layout, color, typography, motion,
              control, and platform-pattern issues.
            </p>
          </section>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section aria-labelledby="tools-heading">
              <h2
                id="tools-heading"
                className="mb-4 text-2xl font-semibold tracking-tight"
              >
                MCP tools
              </h2>
              <div className="space-y-3">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="rounded-xl border bg-background/60 p-4"
                  >
                    <div className="font-mono text-sm text-foreground">
                      {tool.name}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {tool.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="install-heading">
              <h2
                id="install-heading"
                className="mb-4 text-2xl font-semibold tracking-tight"
              >
                Install paths
              </h2>
              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Terminal className="h-4 w-4" aria-hidden="true" />
                    Run the audit CLI
                  </div>
                  <CodeBlock>{"npx hig-doctor . --export"}</CodeBlock>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Terminal className="h-4 w-4" aria-hidden="true" />
                    Run the MCP server from source
                  </div>
                  <CodeBlock>
                    {
                      "git clone https://github.com/raintree-technology/hig-doctor.git\ncd hig-doctor/packages/hig-doctor/src-mcp\nbun install\nbun src/index.ts"
                    }
                  </CodeBlock>
                </div>
              </div>
            </section>
          </div>

          <Separator className="my-12 opacity-60" />

          <section aria-labelledby="frameworks-heading">
            <h2
              id="frameworks-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              Audit coverage
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {frameworks.map((framework) => (
                <div
                  key={framework}
                  className="flex items-center gap-2 rounded-lg border bg-background/50 px-3 py-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {framework}
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-3xl text-sm leading-6 text-muted-foreground">
              HIG Doctor is open source and MIT-licensed for its structure and
              tooling. Apple HIG reference content remains Apple Inc. property;
              the project organizes references, exposes lookup paths, and runs
              detection rules without claiming Apple endorsement.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
