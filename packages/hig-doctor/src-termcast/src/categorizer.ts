// categorizer.ts
import type { PatternMatch } from "./patterns";

export interface CategorySummary {
  skillName: string;
  category: string;
  matches: PatternMatch[];
  concerns: number;
  positives: number;
  patterns: number;
  fileCount: number;
}

const CATEGORY_TO_SKILL: Record<string, string> = {
  "foundations": "hig-foundations",
  "components-layout": "hig-components-layout",
  "components-selection": "hig-components-selection",
  "components-actions": "hig-components-actions",
  "components-presentation": "hig-components-presentation",
  "components-textinput": "hig-components-textinput",
  "components-media": "hig-components-media",
  "patterns": "hig-patterns",
  "platforms": "hig-platforms",
  "technologies": "hig-technologies",
  "inputs": "hig-inputs",
};

export function categorizeMatches(matches: PatternMatch[]): CategorySummary[] {
  if (matches.length === 0) return [];

  const grouped = new Map<string, PatternMatch[]>();

  for (const match of matches) {
    const skillName = CATEGORY_TO_SKILL[match.category] || `hig-${match.category}`;
    if (!grouped.has(skillName)) {
      grouped.set(skillName, []);
    }
    grouped.get(skillName)!.push(match);
  }

  const categories: CategorySummary[] = [];

  for (const [skillName, skillMatches] of grouped) {
    const files = new Set(skillMatches.map(m => m.file));
    categories.push({
      skillName,
      category: skillMatches[0].category,
      matches: skillMatches,
      concerns: skillMatches.filter(m => m.type === "concern").length,
      positives: skillMatches.filter(m => m.type === "positive").length,
      patterns: skillMatches.filter(m => m.type === "pattern").length,
      fileCount: files.size,
    });
  }

  categories.sort((a, b) => b.matches.length - a.matches.length);

  return categories;
}
