import { ArrowRight, BookOpen, FileText, Search, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: Search,
    title: "Discovery",
    scope: "14 descriptions",
    description:
      "Your agent reads 14 skill descriptions and selects the skill that best matches the question.",
  },
  {
    icon: FileText,
    title: "Activation",
    scope: "1 selected skill",
    description:
      "The selected skill loads its principles and reference index to identify relevant topics.",
  },
  {
    icon: Settings,
    title: "Context",
    scope: "Project details",
    description:
      "When project context is available, the agent applies your platform, technology, and constraints.",
  },
  {
    icon: BookOpen,
    title: "Reference",
    scope: "Relevant topics",
    description:
      "The agent loads the reference topics that apply to the question and can follow their Apple source links.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4"
          >
            Your agent loads only what it needs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            HIG Doctor uses progressive disclosure. Your agent reads a short
            index first, then loads the selected skill and relevant reference
            topics.
          </p>
        </div>

        {/* Scope callout */}
        <div className="mb-10 rounded-xl border bg-card/50 px-4 sm:px-8 py-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 sm:gap-10">
            <div className="text-center">
              <p className="text-xl sm:text-3xl font-semibold tracking-tight text-muted-foreground/60">
                Full corpus
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                All reference topics
              </p>
            </div>
            <div className="text-xl sm:text-2xl text-muted-foreground">
              &rarr;
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-3xl font-semibold tracking-tight">
                Selected references
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Relevant to the question
              </p>
            </div>
            <div className="text-center pl-4 sm:pl-6 border-l">
              <p className="text-xl sm:text-3xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                Focused
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Less unrelated context
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-10">
          <div className="text-center rounded-xl border bg-card/50 px-4 py-5">
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">
              Focused
            </p>
            <p className="text-xs text-muted-foreground">
              Loads selected topics
            </p>
          </div>
          <div className="text-center rounded-xl border bg-card/50 px-4 py-5">
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">
              Attributed
            </p>
            <p className="text-xs text-muted-foreground">
              Links to Apple sources
            </p>
          </div>
          <div className="text-center rounded-xl border bg-card/50 px-4 py-5">
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">
              Versioned
            </p>
            <p className="text-xs text-muted-foreground">
              Updates through releases
            </p>
          </div>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 list-none p-0">
          {steps.map((step, i) => (
            <li key={i}>
              <Card className="h-full">
                <div className="flex gap-4 p-6">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <step.icon
                      className="h-5 w-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Step {i + 1}
                      </span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {step.scope}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mb-2">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ol>

        <div className="text-center mt-10">
          <Button size="lg" asChild>
            <a href="#skills">
              See what&apos;s included
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
