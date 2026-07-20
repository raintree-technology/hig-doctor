"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { totalReferences, totalSkills } from "@/lib/skills-data";

const questions = [
  {
    q: "Can't my AI already answer HIG questions without this?",
    a: "It can try — but it's working from training data, not Apple's actual documentation. That means it mixes up platform conventions (suggesting iPhone tab bars on iPad), recommends deprecated patterns, and invents guidance that doesn't exist. These skills give your agent the real HIG text so it cites instead of guesses.",
  },
  {
    q: "How is this different from pasting the HIG into my prompt?",
    a: "The full HIG is 50,000+ tokens — most models will either truncate it or lose focus. These skills use progressive disclosure: your agent loads only the specific topic it needs (~4,000 tokens), so you get precise answers without burning your context window.",
  },
  {
    q: "What AI tools does this work with?",
    a: "Any tool that reads project files: Claude Code, Cursor, GitHub Copilot, Windsurf, Cline, Aider, Roo Code, Continue, Augment Code, and any agent that supports the Agent Skills standard. No plugins or API keys required.",
  },
  {
    q: "What platforms and topics does this cover?",
    a: `All five Apple platforms — iOS, iPadOS, macOS, watchOS, and visionOS. Covers foundations (color, typography, layout), every component category (navigation, menus, controls, dialogs), input methods, UX patterns, and Apple technology integrations like Apple Pay, Siri, and HealthKit. ${totalSkills} skills, ${totalReferences} reference topics.`,
  },
  {
    q: "How do I keep it up to date when Apple changes the HIG?",
    a: "Run git pull. We track Apple's HIG updates and publish new versions with semantic versioning. Your agent will even notify you when updates are available.",
  },
  {
    q: "Is this an official Apple product?",
    a: "No. It's an open-source community project built on Apple's publicly available Human Interface Guidelines. Apple doesn't endorse or maintain it. The structure and tooling are MIT-licensed; the HIG content itself is Apple's intellectual property.",
  },
  {
    q: "I'm a designer, not a developer. Can I still use this?",
    a: "Yes. Installation is one terminal command — copy it, paste it, done. Once installed, just ask your AI design questions in plain English. No configuration or coding required.",
  },
  {
    q: "Is it free?",
    a: "Completely free and open source. No accounts, no API keys, no usage limits.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <h2
            id="faq-heading"
            className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4"
          >
            Common questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {questions.map((item, i) => (
            <AccordionItem key={i} value={`q-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
