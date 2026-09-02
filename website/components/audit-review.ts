import type { PatternMatch, Severity } from "@/lib/audit/patterns";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
};

export interface FindingGroups {
  critical: PatternMatch[];
  serious: PatternMatch[];
  moderate: PatternMatch[];
  positives: PatternMatch[];
}

export interface ReviewProgress {
  resolved: number;
  introduced: number;
  unchanged: number;
}

export function findingKey(match: PatternMatch): string {
  return `${match.ruleId}:${match.line}:${match.lineContent}`;
}

export function concernFindings(matches: PatternMatch[]): PatternMatch[] {
  return matches
    .filter((match) => match.type === "concern")
    .toSorted((a, b) => {
      const severityDelta =
        SEVERITY_ORDER[a.severity ?? "moderate"] -
        SEVERITY_ORDER[b.severity ?? "moderate"];
      return (
        severityDelta || a.line - b.line || a.ruleId.localeCompare(b.ruleId)
      );
    });
}

export function groupBySeverity(matches: PatternMatch[]): FindingGroups {
  const groups: FindingGroups = {
    critical: [],
    serious: [],
    moderate: [],
    positives: [],
  };

  for (const match of matches) {
    if (match.type === "positive") {
      groups.positives.push(match);
      continue;
    }
    if (match.type !== "concern") continue;
    groups[match.severity ?? "moderate"].push(match);
  }

  return groups;
}

export function compareReviewRuns(
  current: PatternMatch[],
  previous: PatternMatch[] | null,
): ReviewProgress | null {
  if (previous === null) return null;

  const currentKeys = new Set(concernFindings(current).map(findingKey));
  const previousKeys = new Set(concernFindings(previous).map(findingKey));
  let resolved = 0;
  let introduced = 0;
  let unchanged = 0;

  for (const key of previousKeys) {
    if (!currentKeys.has(key)) resolved++;
  }
  for (const key of currentKeys) {
    if (previousKeys.has(key)) unchanged++;
    else introduced++;
  }

  return { resolved, introduced, unchanged };
}

export function categoryLabel(category: string): string {
  return category
    .replace(/^components-/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
