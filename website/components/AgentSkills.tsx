import { Bot, ExternalLink, GitBranch, Globe, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    icon: Package,
    title: "Portable",
    description:
      "Switch AI tools without rebuilding your setup. Works with Claude Code, Cursor, Copilot, Windsurf, and custom agents.",
  },
  {
    icon: GitBranch,
    title: "Versionable",
    description:
      "Run git pull when Apple updates the HIG. New guidance, zero reconfiguration.",
  },
  {
    icon: Globe,
    title: "Universal",
    description:
      "One install, every tool. No more fragmented .cursorrules, CLAUDE.md, and copilot-instructions.md files.",
  },
];

const compatibleAgents = [
  { name: "Claude Code", domain: "claude.ai", url: "https://claude.ai/code" },
  { name: "Cursor", domain: "cursor.com", url: "https://cursor.com" },
  {
    name: "GitHub Copilot",
    domain: "github.com",
    url: "https://github.com/features/copilot",
  },
  { name: "Windsurf", domain: "windsurf.com", url: "https://windsurf.com" },
  { name: "Cline", domain: "cline.bot", url: "https://cline.bot" },
  { name: "Aider", domain: "aider.chat", url: "https://aider.chat" },
  { name: "Roo Code", domain: "roocode.com", url: "https://roocode.com" },
  { name: "Continue", domain: "continue.dev", url: "https://continue.dev" },
  {
    name: "Augment Code",
    domain: "augmentcode.com",
    url: "https://augmentcode.com",
  },
  { name: "Any AGENTS.md Agent", domain: null, url: "https://agentskills.io" },
];

export default function AgentSkills() {
  return (
    <section
      id="agent-skills"
      aria-labelledby="agent-skills-heading"
      className="py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-5 gap-1.5 text-xs">
            Open Standard
          </Badge>
          <h2
            id="agent-skills-heading"
            className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4"
          >
            Works everywhere, updates automatically
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Built on Agent Skills — an open standard for giving AI agents
            reusable expertise. Install once, use with any tool, update with a
            single command.
          </p>
          <Button variant="outline" size="lg" asChild>
            <a
              href="https://agentskills.io/specification"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn about Agent Skills
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full">
              <div className="flex gap-4 p-6">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <feature.icon
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <CardTitle className="text-base mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Separator className="mb-12" />

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Compatible with</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {compatibleAgents.map((agent) => (
              <a
                key={agent.name}
                href={agent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 sm:gap-3 rounded-full border border-border/60 bg-muted/40 py-2 px-3.5 sm:py-2.5 sm:px-5 text-sm sm:text-base text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-background shrink-0">
                  {agent.domain ? (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${agent.domain}&sz=64`}
                      alt={`${agent.name} logo`}
                      width={16}
                      height={16}
                      className="rounded-sm"
                      loading="lazy"
                    />
                  ) : (
                    <Bot className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                {agent.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
