import type { ScanResult } from "./scanner";
import type { CategorySummary } from "./categorizer";
export declare function loadSkillContent(skillsDir: string, skillName: string): Promise<string | null>;
export declare function generateAuditMarkdown(scanResult: ScanResult, categories: CategorySummary[], skillsDir: string | null, skillContents?: Map<string, string>): string;
