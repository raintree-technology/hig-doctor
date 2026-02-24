import path from "node:path";
import { SEVERITY_ORDER, truncate } from "./util.js";

const formatLocation = (rootDirectory, filePath) => {
  if (!filePath) return "";
  const relative = path.relative(rootDirectory, filePath);
  return ` (${relative || "."})`;
};

const buildScopeSummary = (result) => {
  if (!result.stats || !Array.isArray(result.stats.scopes) || result.stats.scopes.length === 0) {
    return [];
  }

  const topScopes = result.stats.scopes.slice(0, 5);
  return topScopes.map((scope) => {
    const label = scope.scope === "repo" ? "repo" : scope.scope;
    return `${label}: ${scope.errors}e/${scope.warnings}w`;
  });
};

const getTodoItems = (result) => {
  if (Array.isArray(result.todo) && result.todo.length > 0) {
    return result.todo;
  }

  return [
    {
      id: "todo-1",
      priority: "low",
      severity: "info",
      ruleId: null,
      scope: "repo",
      occurrences: 0,
      files: [],
      task: "No fixes required",
      details: "Repository passed all hig-doctor checks.",
      doneWhen: "Run hig-doctor after your next content update.",
      verifyCommand: `node packages/hig-doctor/src/cli.js "${result.directory}" --score`
    }
  ];
};

const appendTodoSection = (result, lines) => {
  const todoItems = getTodoItems(result);
  lines.push("");
  lines.push("Agent TODO (goal: 100/100, 0 errors, 0 warnings)");

  for (let index = 0; index < todoItems.length; index += 1) {
    const item = todoItems[index];
    const priority = typeof item.priority === "string" ? item.priority.toUpperCase() : "MEDIUM";
    const task = typeof item.task === "string" && item.task.length > 0 ? item.task : "Review findings";
    const findingCount = typeof item.occurrences === "number" && item.occurrences > 0
      ? ` (${item.occurrences} finding${item.occurrences === 1 ? "" : "s"})`
      : "";

    lines.push(`${index + 1}. [${priority}] ${task}${findingCount}`);

    const metadata = [];
    if (typeof item.ruleId === "string" && item.ruleId.length > 0) metadata.push(`rule=${item.ruleId}`);
    if (typeof item.scope === "string" && item.scope.length > 0) metadata.push(`scope=${item.scope}`);
    if (metadata.length > 0) {
      lines.push(`   ${metadata.join(" | ")}`);
    }
    if (Array.isArray(item.files) && item.files.length > 0) {
      const visibleFiles = item.files.slice(0, 3);
      const remainder = item.files.length - visibleFiles.length;
      const suffix = remainder > 0 ? ` (+${remainder} more)` : "";
      lines.push(`   Files: ${visibleFiles.join(", ")}${suffix}`);
    }

    if (typeof item.details === "string" && item.details.length > 0) {
      lines.push(`   Why: ${truncate(item.details, 220)}`);
    }
    if (typeof item.doneWhen === "string" && item.doneWhen.length > 0) {
      lines.push(`   Done when: ${truncate(item.doneWhen, 220)}`);
    }
    if (typeof item.verifyCommand === "string" && item.verifyCommand.length > 0) {
      lines.push(`   Verify: ${truncate(item.verifyCommand, 220)}`);
    }
  }
};

const getFindingsForText = (result, verbose) => {
  const findings = verbose
    ? result.findings
    : result.findings.filter((finding) => finding.severity === "error");

  return [...findings].sort((left, right) => {
    const severityDelta = SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity];
    if (severityDelta !== 0) return severityDelta;
    const scopeLeft = left.skill ?? "repo";
    const scopeRight = right.skill ?? "repo";
    if (scopeLeft !== scopeRight) return scopeLeft.localeCompare(scopeRight);
    if (left.ruleId !== right.ruleId) return left.ruleId.localeCompare(right.ruleId);
    return left.message.localeCompare(right.message);
  });
};

export const formatTextResult = (result, options = {}) => {
  const verbose = Boolean(options.verbose);
  const lines = [];

  lines.push("hig-doctor");
  lines.push(`Directory: ${result.directory}`);
  lines.push(`Skills scanned: ${result.skillCount}`);
  lines.push(`Score: ${result.summary.score}/100 (${result.summary.label})`);
  lines.push(`Errors: ${result.summary.errors}  Warnings: ${result.summary.warnings}`);

  const scopeSummary = buildScopeSummary(result);
  if (scopeSummary.length > 0) {
    lines.push(`Top scopes: ${scopeSummary.join(" | ")}`);
  }

  lines.push("");

  if (result.findings.length === 0) {
    lines.push("No issues found.");
    appendTodoSection(result, lines);
    return lines.join("\n");
  }

  const findings = getFindingsForText(result, verbose);

  for (const finding of findings) {
    const level = finding.severity.toUpperCase();
    const scope = finding.skill ?? "repo";
    const message = truncate(finding.message, 180);
    lines.push(
      `[${level}] [${scope}] ${finding.ruleId}: ${message}${formatLocation(result.directory, finding.file)}`
    );
  }

  if (!verbose) {
    const hiddenWarnings = result.findings.filter((finding) => finding.severity === "warning").length;
    if (hiddenWarnings > 0) {
      lines.push("");
      lines.push(`Use --verbose to view ${hiddenWarnings} warning(s).`);
    }
  }

  appendTodoSection(result, lines);

  return lines.join("\n");
};
