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
  title: "Apple HIG Skills — AI-ready Apple design guidance",
  description:
    "14 agent skills that give AI coding assistants deep knowledge of Apple's Human Interface Guidelines. Built for Claude Code and the Agent Skills spec.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon",
  },
  authors: [{ name: "Raintree", url: "https://raintree.technology" }],
  alternates: {
    canonical: "/",
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
  ],
  openGraph: {
    title: "Apple HIG Skills — AI-ready Apple design guidance",
    description:
      "14 agent skills that give AI coding assistants deep knowledge of Apple's Human Interface Guidelines. Works with Claude Code.",
    url: "/",
    type: "website",
    locale: "en_US",
    siteName: "Apple HIG Skills",
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
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.svg`,
      },
      sameAs: [
        "https://github.com/raintree-technology",
        "https://x.com/raintree_tech",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      name: "Apple HIG Skills",
      url: baseUrl,
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": baseUrl,
      name: "Apple HIG Skills",
      description:
        "14 agent skills that give AI coding assistants deep knowledge of Apple's Human Interface Guidelines. Built for Claude Code and the Agent Skills spec.",
      url: baseUrl,
      codeRepository: "https://github.com/raintree-technology/hig-doctor",
      programmingLanguage: "Markdown",
      license: "https://opensource.org/licenses/MIT",
      author: {
        "@id": `${baseUrl}/#organization`,
      },
      keywords: [
        "Apple Human Interface Guidelines",
        "HIG",
        "agent skills",
        "Claude Code",
        "AI design guidance",
        "iOS design",
        "macOS design",
        "SwiftUI",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${baseUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How should I design an iPad app using Apple's HIG?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG recommends using sidebars instead of bottom tab bars on iPadOS, supporting split views for multitasking, and adding pointer interactions. Apple HIG Skills provides instant, AI-ready guidance on all iPadOS conventions.",
          },
        },
        {
          "@type": "Question",
          name: "What are Apple's guidelines for adding Apple Pay?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG specifies exact payment button placement, flow design, error states, and UX patterns required for App Store approval. Apple HIG Skills gives your AI agent access to the full Apple Pay design guidelines.",
          },
        },
        {
          "@type": "Question",
          name: "How do I make my Apple app accessible?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG requires support for VoiceOver, Dynamic Type, sufficient color contrast ratios, and motor accessibility features like Switch Control. Apple HIG Skills covers all accessibility foundations and requirements.",
          },
        },
        {
          "@type": "Question",
          name: "How do I design for visionOS and Apple Vision Pro?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG for visionOS covers ornaments, volumes, immersive spaces, eye tracking, and spatial interaction patterns. Apple HIG Skills includes dedicated visionOS platform guidance and spatial layout references.",
          },
        },
        {
          "@type": "Question",
          name: "What are Apple's dark mode design guidelines?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG specifies using system semantic colors, material backgrounds, elevated surfaces, and vibrancy for dark mode. Apps should test in both modes and avoid hard-coded color values. Apple HIG Skills covers the full dark mode specification.",
          },
        },
        {
          "@type": "Question",
          name: "How should I design notifications for iOS apps?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Apple's HIG covers notification grouping, Live Activities, action buttons, and respecting user attention. Apple HIG Skills provides guidelines for the full notification system including widgets and complications.",
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
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
