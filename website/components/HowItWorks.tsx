import { ArrowRight, BookOpen, FileText, Search, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: Search,
    title: "Discovery",
    tokens: "~50 tokens",
    description:
      "Your agent scans 14 skill descriptions to find the right one. Costs ~700 tokens total — barely a rounding error.",
  },
  {
    icon: FileText,
    title: "Activation",
    tokens: "~1,500 tokens",
    description:
      "The matching skill loads its key principles and reference index. Just enough to route to the right answer.",
  },
  {
    icon: Settings,
    title: "Context",
    tokens: "~200 tokens",
    description:
      "Your project context (platform, tech stack, constraints) tailors the guidance to your specific app.",
  },
  {
    icon: BookOpen,
    title: "Deep Reference",
    tokens: "~2,000 tokens",
    description:
      "Only the exact HIG topic you asked about loads. Not the entire guide — just the page you need.",
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
            ~4,000 tokens per question instead of 50,000+ for the full HIG. Your
            agent gets the answer without burning your context window.
          </p>
        </div>

        {/* Savings callout */}
        <div className="mb-10 rounded-xl border bg-card/50 px-4 sm:px-8 py-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 sm:gap-10">
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-semibold tracking-tight text-muted-foreground/40 line-through decoration-2">
                50,000+
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Full HIG dump
              </p>
            </div>
            <div className="text-xl sm:text-2xl text-muted-foreground">
              &rarr;
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-4xl font-semibold tracking-tight">
                ~4,000
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                With progressive disclosure
              </p>
            </div>
            <div className="text-center pl-4 sm:pl-6 border-l">
              <p className="text-2xl sm:text-4xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                92%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Less context used
              </p>
            </div>
          </div>
          {/* Visual gauge */}
          <div
            className="mt-5 pt-4 border-t border-border/30"
            role="img"
            aria-label="Visual comparison: ~4,000 tokens used out of 50,000, representing 92% savings"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground shrink-0 w-12 text-right tabular-nums">
                50k
              </span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[8%] rounded-full bg-green-600 dark:bg-green-400" />
              </div>
              <span className="text-xs text-muted-foreground shrink-0 w-8 tabular-nums">
                4k
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-10">
          <div className="text-center rounded-xl border bg-card/50 px-4 py-5">
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">
              Seconds
            </p>
            <p className="text-xs text-muted-foreground">
              Not hours in Apple&apos;s docs
            </p>
          </div>
          <div className="text-center rounded-xl border bg-card/50 px-4 py-5">
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">
              Grounded
            </p>
            <p className="text-xs text-muted-foreground">
              Apple&apos;s actual text, not guesses
            </p>
          </div>
          <div className="text-center rounded-xl border bg-card/50 px-4 py-5">
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">
              Current
            </p>
            <p className="text-xs text-muted-foreground">
              Updated when Apple updates
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
                        {step.tokens}
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
