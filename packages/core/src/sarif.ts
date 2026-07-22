// sarif.ts — SARIF 2.1.0 output for GitHub code scanning and other consumers.
// Only concern findings become SARIF results (positives/patterns are not
// defects). Severity maps critical→error, serious→warning, moderate→note.
import type { PatternMatch, Severity } from "./patterns";
import { getRuleById } from "./patterns";

const SARIF_LEVEL: Record<Severity, "error" | "warning" | "note"> = {
  critical: "error",
  serious: "warning",
  moderate: "note",
};

export interface SarifOptions {
  /** Tool version reported in the SARIF driver. */
  toolVersion: string;
  /** HIG snapshot date the ruleset was authored against. */
  snapshotDate?: string;
}

export function toSarif(matches: PatternMatch[], options: SarifOptions): object {
  const concerns = matches.filter(m => m.type === "concern");

  // Driver rules: only those that actually fired, in first-seen order.
  const ruleIndex = new Map<string, number>();
  const rules: object[] = [];
  for (const match of concerns) {
    if (ruleIndex.has(match.ruleId)) continue;
    const meta = getRuleById(match.ruleId);
    ruleIndex.set(match.ruleId, rules.length);
    rules.push({
      id: match.ruleId,
      name: meta?.label ?? match.pattern,
      shortDescription: { text: meta?.label ?? match.pattern },
      ...(meta?.fix ? { fullDescription: { text: meta.fix } } : {}),
      helpUri: meta?.hig,
      properties: {
        engine: meta?.engine ?? match.engine,
        category: match.category,
        subcategory: match.subcategory,
      },
      defaultConfiguration: {
        level: SARIF_LEVEL[(meta?.severity ?? match.severity ?? "moderate") as Severity],
      },
    });
  }

  const results = concerns.map(match => {
    const meta = getRuleById(match.ruleId);
    const fix = meta?.fix ? ` Fix: ${meta.fix}` : "";
    return {
      ruleId: match.ruleId,
      ruleIndex: ruleIndex.get(match.ruleId),
      level: SARIF_LEVEL[match.severity ?? "moderate"],
      message: { text: `${match.pattern} (${match.category}/${match.subcategory}).${fix}` },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: match.file.replace(/\\/g, "/"), uriBaseId: "SRCROOT" },
            region: { startLine: match.line },
          },
        },
      ],
      partialFingerprints: {
        // Content-based, line-number-free — matches the baseline fingerprint so
        // code motion doesn't produce "new" alerts.
        higDoctorKey: `${match.ruleId} ${match.file} ${match.lineContent.replace(/\s+/g, " ").trim()}`,
      },
    };
  });

  return {
    $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "hig-doctor",
            informationUri: "https://github.com/raintree-technology/hig-doctor",
            version: options.toolVersion,
            ...(options.snapshotDate ? { properties: { higSnapshot: options.snapshotDate } } : {}),
            rules,
          },
        },
        originalUriBaseIds: {
          SRCROOT: { description: { text: "Root of the audited project" } },
        },
        results,
      },
    ],
  };
}
