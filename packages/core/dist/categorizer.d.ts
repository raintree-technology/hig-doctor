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
export declare function categorizeMatches(matches: PatternMatch[]): CategorySummary[];
