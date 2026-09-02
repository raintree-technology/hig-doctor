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
    a: "An AI tool can answer from its training data, but that answer may omit a platform distinction, use outdated guidance, or lack a source. HIG Doctor gives the tool a structured reference set with links to Apple's documentation. Verify consequential decisions against Apple's current guidance.",
  },
  {
    q: "How is this different from pasting the HIG into my prompt?",
    a: "Pasting a large reference set uses context for topics that may not apply. HIG Doctor uses progressive disclosure: the agent reads a short skill index, selects a skill, and loads the relevant reference topics.",
  },
  {
    q: "What AI tools does this work with?",
    a: "The repository provides Agent Skills files for Claude Code, Cursor, GitHub Copilot, Windsurf, Cline, Aider, Roo Code, Continue, Augment Code, and other Agent Skills clients. Discovery and loading behavior depend on the client.",
  },
  {
    q: "What platforms and topics does this cover?",
    a: `The repository includes guidance for iOS, iPadOS, macOS, tvOS, visionOS, watchOS, and games. Its ${totalSkills} skills organize ${totalReferences} reference topics across foundations, components, input methods, patterns, and Apple technologies.`,
  },
  {
    q: "How do I keep it up to date when Apple changes the HIG?",
    a: "Run git pull after HIG Doctor publishes a new version. Check the release notes for changed guidance. Email notifications are available only when the site deployment configures them.",
  },
  {
    q: "Is this an official Apple product?",
    a: "No. It's an open-source community project built on Apple's publicly available Human Interface Guidelines. Apple doesn't endorse or maintain it. The structure and tooling are MIT-licensed; the HIG content itself is Apple's intellectual property.",
  },
  {
    q: "I'm a designer, not a developer. Can I still use this?",
    a: "Yes. You need access to a terminal for installation, but you can ask design questions in plain language after a supported client discovers the skills.",
  },
  {
    q: "Is it free?",
    a: "HIG Doctor's structure and tooling are free, open source, and MIT-licensed. HIG Doctor does not require an account or API key. Your AI tool may have separate fees or usage limits.",
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
