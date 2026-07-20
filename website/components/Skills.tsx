"use client";

import { ChevronRight, FileText, Search, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categories, totalReferences, totalSkills } from "@/lib/skills-data";

function refToSlug(ref: string) {
  return ref
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Skills() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const allSkills = categories.flatMap((category) =>
    category.skills.map((skill) => ({
      ...skill,
      category: category.name,
    })),
  );

  const filteredSkills = useMemo(() => {
    if (!filter.trim()) return allSkills;
    const q = filter.toLowerCase();
    return allSkills.filter(
      (skill) =>
        skill.displayName.toLowerCase().includes(q) ||
        skill.category.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.references.some((ref) => ref.toLowerCase().includes(q)),
    );
  }, [filter, allSkills]);

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="py-20 sm:py-28"
    >
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-12">
          <h2
            id="skills-heading"
            className="text-3xl sm:text-5xl font-semibold tracking-tight mb-4"
          >
            What&apos;s included
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {totalSkills} skills. {totalReferences} reference topics. The full
            Apple Human Interface Guidelines, structured for AI.
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-4">
            <strong className="text-foreground">New here?</strong> Start with{" "}
            <button
              type="button"
              onClick={() => setFilter("Project Context")}
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Project Context
            </button>{" "}
            to set up your app details, then try{" "}
            <button
              type="button"
              onClick={() => setFilter("Platforms")}
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Platforms
            </button>{" "}
            for your target platform. The rest load on demand as you ask
            questions.
          </p>
        </div>

        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Filter skills or references..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-lg border bg-card/50 pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            aria-label="Filter skills"
          />
          {filter && (
            <button
              type="button"
              onClick={() => setFilter("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="rounded-xl border glass overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="text-base">
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-sm uppercase tracking-wider pl-5 pr-2 py-4 w-8" />
                  <TableHead className="text-sm uppercase tracking-wider px-4 py-4">
                    Skill
                  </TableHead>
                  <TableHead className="text-sm uppercase tracking-wider px-4 py-4 hidden sm:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="text-sm uppercase tracking-wider px-4 py-4 hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="text-sm uppercase tracking-wider px-5 py-4 text-right">
                    References
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkills.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No skills match &ldquo;{filter}&rdquo;. Try a different
                      term.
                    </TableCell>
                  </TableRow>
                )}
                {filteredSkills.map((skill) => {
                  const isOpen = expanded.has(skill.name);
                  const hasRefs = skill.references.length > 0;
                  return (
                    <React.Fragment key={skill.name}>
                      <TableRow
                        className={`border-border/30 ${hasRefs ? "cursor-pointer" : ""} ${isOpen ? "bg-accent/20" : "hover:bg-accent/30"}`}
                        onClick={() => hasRefs && toggle(skill.name)}
                        onKeyDown={(e) => {
                          if (hasRefs && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            toggle(skill.name);
                          }
                        }}
                        {...(hasRefs
                          ? {
                              role: "button",
                              tabIndex: 0,
                              "aria-expanded": isOpen,
                              "aria-label": `${skill.displayName} — ${skill.refCount} references. ${isOpen ? "Collapse" : "Expand"} to see reference files.`,
                            }
                          : {})}
                      >
                        <TableCell className="pl-5 pr-2 py-3.5 w-8">
                          {hasRefs && (
                            <ChevronRight
                              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                            />
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 font-medium whitespace-nowrap">
                          <span className="flex items-center gap-2">
                            {skill.displayName}
                            {hasRefs && (
                              <span className="text-xs text-muted-foreground/60 font-normal hidden sm:inline md:hidden">
                                {skill.refCount} refs
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                          {skill.category}
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground hidden md:table-cell">
                          {skill.description}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-right">
                          {skill.refCount ? (
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                              {skill.refCount} refs
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">
                              &mdash;
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow
                          key={`${skill.name}-refs`}
                          className="hover:bg-transparent"
                        >
                          <TableCell
                            colSpan={5}
                            className="border-b border-border/30 bg-accent/10 p-0"
                          >
                            <div className="px-4 sm:px-5 py-4 sm:pl-11">
                              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                                Reference files
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
                                {skill.references.map((ref) => (
                                  <a
                                    key={ref}
                                    href={`/topics/${refToSlug(ref)}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <FileText className="h-3.5 w-3.5 shrink-0 opacity-50" />
                                    {ref}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Prefer reading in the browser?{" "}
          <a
            href="/topics"
            className="text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Browse all {totalReferences} HIG topics
          </a>
        </p>
      </div>
    </section>
  );
}
