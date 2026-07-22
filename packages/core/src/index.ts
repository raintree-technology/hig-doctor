// @hig-doctor/core — public API surface.
// The CLI, MCP server, and website audit demo all consume the engine through
// this module; keep additions here deliberate since they become npm API.
export {
  audit,
  type AuditOptions,
  type AuditResult,
} from "./audit";
export {
  detectPatterns,
  severityFor,
  ruleCatalog,
  getRuleById,
  higCitation,
  fixGuidance,
  RULE_COUNT,
  type PatternMatch,
  type Severity,
  type Engine,
  type RuleMeta,
} from "./patterns";
export {
  scanProject,
  type Framework,
  type ScanResult,
  type ScannedFile,
} from "./scanner";
export {
  categorizeMatches,
  type CategorySummary,
} from "./categorizer";
export {
  generateAuditMarkdown,
  loadSkillContent,
} from "./audit-generator";
