// config.ts — hig-doctor.config.json discovery, validation, and application.
//
// The config file lives at the root of the audited project:
//   {
//     "rules":  { "swift/hardcoded-color": "off", "web/*": "serious" },
//     "ignore": ["legacy/**", "vendor/**"],
//     "overrides": [
//       { "files": ["marketing/**"], "rules": { "css/outline-none": "off" } }
//     ]
//   }
// Rule keys are stable rule IDs (see docs/rules.md) or prefix globs ending in
// "*". Values: "off" drops the rule, a severity remaps concern severity, "on"
// keeps the default. Overrides apply per file glob; the last matching override
// wins over the global rules map.
import { readFile } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import type { PatternMatch, Severity } from "./patterns";
import { getRuleById } from "./patterns";
import { globToRegExp } from "./scanner";

export type RuleSetting = "off" | "on" | Severity;

export interface ConfigOverride {
  files: string[];
  rules: Record<string, RuleSetting>;
}

export interface HigDoctorConfig {
  rules?: Record<string, RuleSetting>;
  ignore?: string[];
  overrides?: ConfigOverride[];
}

export interface LoadedConfig {
  /** Absolute path of the loaded file, or null when no config exists. */
  path: string | null;
  config: HigDoctorConfig;
  /** Non-fatal problems (e.g. unknown rule IDs) surfaced to the caller. */
  warnings: string[];
}

export const CONFIG_FILENAME = "hig-doctor.config.json";

const VALID_SETTINGS = new Set(["off", "on", "critical", "serious", "moderate"]);

function validateRules(
  rules: unknown,
  where: string,
  warnings: string[],
): Record<string, RuleSetting> {
  if (rules == null) return {};
  if (typeof rules !== "object" || Array.isArray(rules)) {
    throw new Error(`${where}: "rules" must be an object mapping rule IDs to settings`);
  }
  const out: Record<string, RuleSetting> = {};
  for (const [id, setting] of Object.entries(rules)) {
    if (typeof setting !== "string" || !VALID_SETTINGS.has(setting)) {
      throw new Error(
        `${where}: invalid setting ${JSON.stringify(setting)} for rule "${id}" — expected "off", "on", "critical", "serious", or "moderate"`,
      );
    }
    if (!id.includes("*") && !getRuleById(id)) {
      warnings.push(`${where}: unknown rule ID "${id}" (see docs/rules.md)`);
    }
    out[id] = setting as RuleSetting;
  }
  return out;
}

export function parseConfig(raw: string, sourcePath: string): { config: HigDoctorConfig; warnings: string[] } {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${sourcePath} is not valid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (json == null || typeof json !== "object" || Array.isArray(json)) {
    throw new Error(`${sourcePath}: config must be a JSON object`);
  }
  const obj = json as Record<string, unknown>;
  const warnings: string[] = [];
  const config: HigDoctorConfig = {};

  config.rules = validateRules(obj.rules, sourcePath, warnings);

  if (obj.ignore != null) {
    if (!Array.isArray(obj.ignore) || obj.ignore.some(g => typeof g !== "string")) {
      throw new Error(`${sourcePath}: "ignore" must be an array of glob strings`);
    }
    config.ignore = obj.ignore as string[];
  }

  if (obj.overrides != null) {
    if (!Array.isArray(obj.overrides)) {
      throw new Error(`${sourcePath}: "overrides" must be an array`);
    }
    config.overrides = (obj.overrides as unknown[]).map((entry, i) => {
      const where = `${sourcePath} overrides[${i}]`;
      if (entry == null || typeof entry !== "object" || Array.isArray(entry)) {
        throw new Error(`${where}: must be an object with "files" and "rules"`);
      }
      const o = entry as Record<string, unknown>;
      if (!Array.isArray(o.files) || o.files.length === 0 || o.files.some(g => typeof g !== "string")) {
        throw new Error(`${where}: "files" must be a non-empty array of glob strings`);
      }
      return { files: o.files as string[], rules: validateRules(o.rules, where, warnings) };
    });
  }

  return { config, warnings };
}

export async function loadConfig(directory: string, explicitPath?: string): Promise<LoadedConfig> {
  const path = explicitPath
    ? (isAbsolute(explicitPath) ? explicitPath : resolve(explicitPath))
    : join(resolve(directory), CONFIG_FILENAME);
  let raw: string;
  try {
    raw = await readFile(path, "utf-8");
  } catch {
    if (explicitPath) throw new Error(`Config file not found: ${path}`);
    return { path: null, config: {}, warnings: [] };
  }
  const { config, warnings } = parseConfig(raw, path);
  return { path, config, warnings };
}

interface CompiledOverride {
  files: RegExp[];
  rules: Record<string, RuleSetting>;
}

function settingFor(ruleId: string, rules: Record<string, RuleSetting> | undefined): RuleSetting | null {
  if (!rules) return null;
  if (ruleId in rules) return rules[ruleId];
  // Prefix globs: most specific (longest prefix) wins.
  let best: { len: number; setting: RuleSetting } | null = null;
  for (const [key, setting] of Object.entries(rules)) {
    if (!key.endsWith("*")) continue;
    const prefix = key.slice(0, -1);
    if (ruleId.startsWith(prefix) && (!best || prefix.length > best.len)) {
      best = { len: prefix.length, setting };
    }
  }
  return best?.setting ?? null;
}

/** Apply rule settings (global + per-path overrides) to detected matches. */
export function applyConfig(matches: PatternMatch[], config: HigDoctorConfig): PatternMatch[] {
  const hasRules = config.rules && Object.keys(config.rules).length > 0;
  const overrides: CompiledOverride[] = (config.overrides ?? []).map(o => ({
    files: o.files.map(globToRegExp),
    rules: o.rules,
  }));
  if (!hasRules && overrides.length === 0) return matches;

  const out: PatternMatch[] = [];
  for (const match of matches) {
    let setting = settingFor(match.ruleId, config.rules);
    for (const override of overrides) {
      if (override.files.some(re => re.test(match.file))) {
        const s = settingFor(match.ruleId, override.rules);
        if (s !== null) setting = s;
      }
    }
    if (setting === "off") continue;
    if (setting && setting !== "on" && match.type === "concern") {
      out.push({ ...match, severity: setting });
    } else {
      out.push(match);
    }
  }
  return out;
}
