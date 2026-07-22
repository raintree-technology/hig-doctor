import { type ScanResult } from "./scanner";
import { type PatternMatch } from "./patterns";
import { type CategorySummary } from "./categorizer";
export interface AuditOptions {
    /** Path globs (relative to the audited directory) to exclude from scanning. */
    exclude?: string[];
    /** Explicit path to a hig-doctor.config.json (default: discovered in the audited directory). */
    configPath?: string;
    /** Skip config discovery entirely. */
    noConfig?: boolean;
    /** Explicit path to a .hig-baseline.json (default: discovered in the audited directory). */
    baselinePath?: string;
    /** Skip baseline discovery entirely. */
    noBaseline?: boolean;
    /** Enable the content-hash cache under the audited directory (local scans). */
    cache?: boolean;
}
export interface AuditResult {
    scanResult: ScanResult;
    allMatches: PatternMatch[];
    categories: CategorySummary[];
    markdown: string;
    /** Absolute path of the applied config file, or null. */
    configPath: string | null;
    /** Non-fatal config problems (unknown rule IDs etc.). */
    configWarnings: string[];
    /** Absolute path of the applied baseline file, or null. */
    baselinePath: string | null;
    /** Concerns absorbed by the baseline (hidden from results and gating). */
    baselined: number;
    /** Baseline occurrences that no longer match anything — time to re-snapshot. */
    baselineStale: number;
    /** Cache hit/miss counts when the cache is enabled, else null. */
    cacheStats: {
        hits: number;
        misses: number;
    } | null;
}
export declare function audit(directory: string, skillsDir?: string, options?: AuditOptions): Promise<AuditResult>;
