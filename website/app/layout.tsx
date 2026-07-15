import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const baseUrl = "https://apple.raintree.technology";

export const viewport: Viewport = {
  themeColor: "#0f1012",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "HIG Doctor — Apple HIG skills, MCP server, and audit CLI",
  description:
    "Agent-native Apple Human Interface Guidelines skills, an MCP server, and a universal audit CLI for SwiftUI, UIKit, React, Next.js, Flutter, Compose, HTML, and CSS.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon",
  },
  authors: [{ name: "Raintree", url: "https://raintree.technology" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: [
    "apple",
    "human interface guidelines",
    "HIG",
    "agent skills",
    "claude code",
    "AI",
    "design",
    "iOS",
    "macOS",
    "SwiftUI",
    "UIKit",
    "MCP",
    "audit CLI",
    "accessibility audit",
    "React",
    "Next.js",
    "Flutter",
    "Jetpack Compose",
  ],
  openGraph: {
    title: "HIG Doctor — Apple HIG skills, MCP server, and audit CLI",
    description:
      "Agent-native Apple HIG skills, MCP tools, and an audit CLI for native and web UI code.",
    url: "/",
    type: "website",
    locale: "en_US",
    siteName: "HIG Doctor",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@raintree_tech",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Raintree",
      url: "https://raintree.technology",
      sameAs: [
        "https://github.com/raintree-technology",
        "https://x.com/raintree_tech",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      name: "HIG Doctor",
      url: baseUrl,
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${baseUrl}/#software`,
      name: "HIG Doctor",
      description:
        "Agent-native Apple Human Interface Guidelines skills, an MCP server, and a universal audit CLI for SwiftUI, UIKit, React, Next.js, Flutter, Compose, HTML, and CSS.",
      logo: `${baseUrl}/logo.svg`,
      url: baseUrl,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS, Linux, Windows, iOS, Android, Web",
      codeRepository: "https://github.com/raintree-technology/hig-doctor",
      programmingLanguage: ["TypeScript", "Markdown"],
      license: "https://opensource.org/licenses/MIT",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: {
        "@id": `${baseUrl}/#organization`,
      },
      keywords: [
        "Apple Human Interface Guidelines",
        "HIG",
        "agent skills",
        "MCP",
        "HIG audit CLI",
        "Claude Code",
        "Codex",
        "Cursor",
        "AI design guidance",
        "iOS design",
        "macOS design",
        "SwiftUI",
        "UIKit",
        "React",
        "Next.js",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${baseUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Does HIG Doctor expose an MCP server?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The hig-mcp server exposes hig_list_skills, hig_lookup, and hig_audit so MCP-compatible coding agents can list HIG skills, fetch reference topics, and run project audits.",
          },
        },
        {
          "@type": "Question",
          name: "What frameworks can the HIG audit CLI scan?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The audit CLI scans SwiftUI, UIKit, React, Next.js, Vue, Svelte, Angular, React Native, Flutter, Jetpack Compose, Android XML, HTML, and CSS.",
          },
        },
        {
          "@type": "Question",
          name: "How should I design an iPad app using Apple's HIG?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG recommends using sidebars instead of bottom tab bars on iPadOS, supporting split views for multitasking, and adding pointer interactions. HIG Doctor provides instant, AI-ready guidance on all iPadOS conventions.",
          },
        },
        {
          "@type": "Question",
          name: "What are Apple's guidelines for adding Apple Pay?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG specifies exact payment button placement, flow design, error states, and UX patterns required for App Store approval. HIG Doctor gives your AI agent access to the full Apple Pay design guidelines.",
          },
        },
        {
          "@type": "Question",
          name: "How do I make my Apple app accessible?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG requires support for VoiceOver, Dynamic Type, sufficient color contrast ratios, and motor accessibility features like Switch Control. HIG Doctor covers all accessibility foundations and requirements.",
          },
        },
        {
          "@type": "Question",
          name: "How do I design for visionOS and Apple Vision Pro?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG for visionOS covers ornaments, volumes, immersive spaces, eye tracking, and spatial interaction patterns. HIG Doctor includes dedicated visionOS platform guidance and spatial layout references.",
          },
        },
        {
          "@type": "Question",
          name: "What are Apple's dark mode design guidelines?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG specifies using system semantic colors, material backgrounds, elevated surfaces, and vibrancy for dark mode. Apps should test in both modes and avoid hard-coded color values. HIG Doctor covers the full dark mode specification.",
          },
        },
        {
          "@type": "Question",
          name: "How should I design notifications for iOS apps?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG covers notification grouping, Live Activities, action buttons, and respecting user attention. HIG Doctor provides guidelines for the full notification system including widgets and complications.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
