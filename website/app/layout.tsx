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
            text: "HIG Doctor includes iPadOS references for sidebars, tab bars, split views, multitasking, and pointer interactions. Use those references to inform a design, then verify consequential decisions against Apple's current documentation.",
          },
        },
        {
          "@type": "Question",
          name: "What are Apple's guidelines for adding Apple Pay?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "HIG Doctor includes Apple Pay references for button presentation, checkout flow, and failure states. Verify the finished experience against Apple's current design and review requirements.",
          },
        },
        {
          "@type": "Question",
          name: "How do I make my Apple app accessible?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "HIG Doctor includes accessibility references for VoiceOver, Dynamic Type, color and contrast, and motor accessibility. Automated guidance does not replace accessibility testing or review of Apple's current requirements.",
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
            text: "HIG Doctor includes dark mode references for semantic colors, materials, elevated surfaces, and vibrancy. Test each supported appearance and verify the design against Apple's current documentation.",
          },
        },
        {
          "@type": "Question",
          name: "How should I design notifications for iOS apps?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "HIG Doctor includes references for notifications, Live Activities, actions, widgets, and complications. Select the topics that apply to the product and platform.",
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
