export type Severity = "critical" | "serious" | "moderate";
export declare const HIG_SNAPSHOT_DATE = "2025-02-02";
export type Engine = "regex" | "swift-structural" | "ast-tsx";
export interface PatternMatch {
    ruleId: string;
    engine: Engine;
    category: string;
    subcategory: string;
    type: "pattern" | "positive" | "concern";
    pattern: string;
    line: number;
    lineContent: string;
    file: string;
    severity?: Severity;
}
interface PatternRule {
    category: string;
    subcategory: string;
    type: "pattern" | "positive" | "concern";
    pattern: string;
    regex: RegExp;
    hig?: string;
    fix?: string;
    fileFilter?: RegExp;
    skipInBlock?: RegExp;
    scope?: "document";
    requireAbsent?: RegExp;
}
export declare function severityFor(pattern: string): Severity;
export interface CatalogRule extends PatternRule {
    id: string;
    framework: string;
    engine: Engine;
}
export declare function higCitation(rule: Pick<CatalogRule, "hig" | "subcategory">): string;
export declare function fixGuidance(rule: Pick<CatalogRule, "fix" | "pattern">): string | null;
export interface RuleMeta {
    id: string;
    framework: string;
    category: string;
    subcategory: string;
    type: "pattern" | "positive" | "concern";
    label: string;
    severity: Severity | null;
    engine: Engine;
    hig: string;
    fix: string | null;
}
export declare function ruleCatalog(): RuleMeta[];
export declare function getRuleById(id: string): RuleMeta | undefined;
export declare function detectPatterns(code: string, file: string): PatternMatch[];
export declare const RULE_COUNT: number;
export {};
