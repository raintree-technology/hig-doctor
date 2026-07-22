export type Severity = "critical" | "serious" | "moderate";
export interface PatternMatch {
    category: string;
    subcategory: string;
    type: "pattern" | "positive" | "concern";
    pattern: string;
    line: number;
    lineContent: string;
    file: string;
    severity?: Severity;
}
export declare function severityFor(pattern: string): Severity;
export declare function detectPatterns(code: string, file: string): PatternMatch[];
export declare const RULE_COUNT: number;
