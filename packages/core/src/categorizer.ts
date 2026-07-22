// categorizer.ts
import type { PatternMatch } from "./patterns";

export interface CategorySummary {
  skillName: string;
  category: string;
  label: string;
  matches: PatternMatch[];
  concerns: number;
  positives: number;
  patterns: number;
  critical: number;
  serious: number;
  moderate: number;
  fileCount: number;
  files: string[];
}

const CATEGORY_TO_SKILL: Record<string, string> = {
  "foundations": "hig-foundations",
  "components-layout": "hig-components-layout",
  "components-selection": "hig-components-selection",
  "components-actions": "hig-components-actions",
  "components-presentation": "hig-components-presentation",
  "components-textinput": "hig-components-textinput",
  "components-media": "hig-components-media",
  "components-controls": "hig-components-controls",
  "components-menus": "hig-components-menus",
  "components-dialogs": "hig-components-dialogs",
  "components-search": "hig-components-search",
  "components-status": "hig-components-status",
  "components-content": "hig-components-content",
  "components-system": "hig-components-system",
  "patterns": "hig-patterns",
  "platforms": "hig-platforms",
  "technologies": "hig-technologies",
  "inputs": "hig-inputs",
};

const CATEGORY_LABELS: Record<string, string> = {
  "hig-foundations": "Foundations",
  "hig-components-layout": "Layout & Navigation",
  "hig-components-selection": "Selection Controls",
  "hig-components-actions": "Actions",
  "hig-components-presentation": "Presentation",
  "hig-components-textinput": "Text Input",
  "hig-components-media": "Media",
  "hig-components-controls": "Controls",
  "hig-components-menus": "Menus & Actions",
  "hig-components-dialogs": "Dialogs & Presentations",
  "hig-components-search": "Search & Navigation",
  "hig-components-status": "Status & Progress",
  "hig-components-content": "Content Display",
  "hig-components-system": "System Integration",
  "hig-patterns": "Interaction Patterns",
  "hig-inputs": "Input Methods",
  "hig-technologies": "Apple Technologies",
  "hig-platforms": "Platform Adaptation",
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
    const files = [...new Set(skillMatches.map(m => m.file))];
    const concerns = skillMatches.filter(m => m.type === "concern");
    categories.push({
      skillName,
      category: skillMatches[0].category,
      label: CATEGORY_LABELS[skillName] ?? skillName,
      matches: skillMatches,
      concerns: concerns.length,
      positives: skillMatches.filter(m => m.type === "positive").length,
      patterns: skillMatches.filter(m => m.type === "pattern").length,
      critical: concerns.filter(m => m.severity === "critical").length,
      serious: concerns.filter(m => m.severity === "serious").length,
      moderate: concerns.filter(m => m.severity === "moderate").length,
      fileCount: files.length,
      files,
    });
  }

  categories.sort((a, b) => b.matches.length - a.matches.length);

  return categories;
}
