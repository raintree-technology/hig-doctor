import {
  ArrowRight,
  CreditCard,
  Glasses,
  Paintbrush,
  Tablet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const useCases = [
  {
    icon: Tablet,
    question: "Building an iPad app?",
    answer:
      "Skip the guesswork on sidebars vs. tab bars, split views, multitasking, and pointer interactions. Get the iPadOS-specific answer, not generic iOS advice.",
    skills: ["Platforms", "Layout", "Inputs"],
  },
  {
    icon: CreditCard,
    question: "Adding Apple Pay?",
    answer:
      "Get the exact button placement, flow design, and error handling patterns Apple requires — so you pass App Review the first time.",
    skills: ["Technologies", "Patterns"],
  },
  {
    icon: Glasses,
    question: "Designing for visionOS?",
    answer:
      "Ornaments, volumes, immersive spaces, eye tracking, and spatial interactions — the full visionOS design language in one place.",
    skills: ["Platforms", "Inputs", "Layout"],
  },
  {
    icon: Paintbrush,
    question: "Getting dark mode right?",
    answer:
      "System colors, materials, elevation, and vibrancy — every rule for a dark mode that feels native, not bolted on.",
    skills: ["Foundations", "Content"],
  },
];

export default function UseCases() {
  return (
    <section
      id="use-cases"
      aria-labelledby="use-cases-heading"
      className="py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2
            id="use-cases-heading"
            className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4"
          >
            What can you ask
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ask a design question. Get a specific, platform-aware answer
            grounded in Apple&apos;s actual guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {useCases.map((useCase) => (
            <Card key={useCase.question} className="h-full">
              <div className="flex gap-4 p-6">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <useCase.icon
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <CardTitle className="text-lg mb-2">
                    {useCase.question}
                  </CardTitle>
                  <CardDescription className="leading-relaxed mb-4">
                    {useCase.answer}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1.5">
                    {useCase.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" asChild>
            <a href="#before-after">
              See it in action
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
