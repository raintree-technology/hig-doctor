"use client";

import { Check, Copy, MessageSquare } from "lucide-react";
import { useCallback, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import UpdateNotify from "./UpdateNotify";

const MAIN_COMMAND = "npx skills add raintree-technology/apple-hig-skills";

const altMethods = [
  {
    label: "Git clone",
    command:
      "git clone https://github.com/raintree-technology/apple-hig-skills.git .claude/apple-hig-skills",
  },
  {
    label: "Submodule",
    command:
      "git submodule add https://github.com/raintree-technology/apple-hig-skills.git .claude/apple-hig-skills",
  },
  {
    label: "Copy files",
    command: "cp -r apple-hig-skills/skills/* .claude/skills/",
  },
] as const;

const firstQuestions = [
  "How should I design the navigation for my iPad app?",
  "What colors should I use for dark mode?",
  "How do I add Apple Pay to my checkout flow?",
];

export default function Install() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <section
      id="install"
      aria-labelledby="install-heading"
      className="py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="text-center pb-4">
              <h2
                id="install-heading"
                className="text-3xl sm:text-5xl font-semibold leading-none tracking-tight"
              >
                Install in 30 seconds
              </h2>
              <p className="text-lg text-muted-foreground mt-2">
                One command. No configuration. Your agent discovers the skills
                automatically.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main command */}
              <div className="flex items-center gap-2">
                <code
                  className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-[#1d1d1f] dark:bg-[#0a0a0a] text-white/80 text-xs sm:text-sm font-mono overflow-x-auto"
                  aria-label={`Install: ${MAIN_COMMAND}`}
                >
                  {MAIN_COMMAND}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(MAIN_COMMAND, "main")}
                  aria-label={
                    copied === "main"
                      ? "Copied to clipboard"
                      : "Copy install command"
                  }
                  aria-live="polite"
                >
                  {copied === "main" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                That&apos;s it. No config files, no restarts. Just ask a
                question.
              </p>

              {/* First question prompt */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium">
                    Then try your first question
                  </p>
                </div>
                <div className="space-y-2">
                  {firstQuestions.map((question) => (
                    <button
                      type="button"
                      key={question}
                      onClick={() => handleCopy(question, question)}
                      className="w-full text-left px-3.5 py-2.5 rounded-lg bg-background border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer flex items-center gap-2"
                      aria-label={`Copy: ${question}`}
                      aria-live="polite"
                    >
                      <span className="flex-1">{question}</span>
                      {copied === question && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alt methods */}
              <Accordion type="single" collapsible>
                <AccordionItem value="alt" className="border-none">
                  <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2 hover:no-underline">
                    Other ways to install (git clone, submodule, copy)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-1">
                      {altMethods.map((method, i) => (
                        <div
                          key={method.label}
                          className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3 text-sm"
                        >
                          <span className="text-muted-foreground font-medium min-w-[80px]">
                            {method.label}
                          </span>
                          <code className="flex-1 font-mono text-xs truncate text-muted-foreground">
                            {method.command}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() =>
                              handleCopy(method.command, `alt-${i}`)
                            }
                            aria-label={
                              copied === `alt-${i}`
                                ? "Copied to clipboard"
                                : `Copy ${method.label} command`
                            }
                            aria-live="polite"
                          >
                            {copied === `alt-${i}` ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <p className="text-xs text-muted-foreground text-center">
                Having trouble?{" "}
                <a
                  href="https://github.com/raintree-technology/apple-hig-skills/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Open an issue
                  <span className="sr-only"> (opens in new tab)</span>
                </a>{" "}
                and we&apos;ll help.
              </p>

              <Separator />

              <UpdateNotify />
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
