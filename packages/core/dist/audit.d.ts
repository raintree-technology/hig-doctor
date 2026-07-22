import { type ScanResult } from "./scanner";
import { type PatternMatch } from "./patterns";
import { type CategorySummary } from "./categorizer";
export interface AuditOptions {
    /** Path globs (relative to the audited directory) to exclude from scanning. */
    exclude?: string[];
}
export interface AuditResult {
    scanResult: ScanResult;
    allMatches: PatternMatch[];
    categories: CategorySummary[];
    markdown: string;
}
export declare function audit(directory: string, skillsDir?: string, options?: AuditOptions): Promise<AuditResult>;
