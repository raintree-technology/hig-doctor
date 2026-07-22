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
  HIG_SNAPSHOT_DATE,
  type PatternMatch,
  type Severity,
  type Engine,
  type RuleMeta,
} from "./patterns";
export {
  scanProject,
  globToRegExp,
  type Framework,
  type ScanResult,
  type ScannedFile,
} from "./scanner";
export {
  loadConfig,
  parseConfig,
  applyConfig,
  CONFIG_FILENAME,
  type HigDoctorConfig,
  type LoadedConfig,
  type RuleSetting,
  type ConfigOverride,
} from "./config";
export {
  categorizeMatches,
  type CategorySummary,
} from "./categorizer";
export {
  generateAuditMarkdown,
  loadSkillContent,
} from "./audit-generator";
export {
  createBaseline,
  applyBaseline,
  loadBaseline,
  parseBaseline,
  writeBaseline,
  baselineKey,
  BASELINE_FILENAME,
  type Baseline,
  type BaselineApplication,
} from "./baseline";
export {
  toSarif,
  type SarifOptions,
} from "./sarif";
