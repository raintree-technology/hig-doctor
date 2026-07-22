import path from "node:path";
import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, render, useApp, useInput } from "ink";
import { SEVERITY_ORDER, truncate } from "./util.js";

const FILTERS = ["all", "errors", "warnings"];

const getFilteredFindings = (findings, filter) => {
  if (filter === "errors") {
    return findings.filter((finding) => finding.severity === "error");
  }
  if (filter === "warnings") {
    return findings.filter((finding) => finding.severity === "warning");
  }
  return findings;
};

const sortFindings = (findings, groupByScope) => {
  return [...findings].sort((left, right) => {
    if (groupByScope) {
      const scopeLeft = left.skill ?? "repo";
      const scopeRight = right.skill ?? "repo";
      if (scopeLeft !== scopeRight) {
        return scopeLeft.localeCompare(scopeRight);
      }
    }

    const severityDelta = SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity];
    if (severityDelta !== 0) return severityDelta;
    if (left.ruleId !== right.ruleId) return left.ruleId.localeCompare(right.ruleId);
    return left.message.localeCompare(right.message);
  });
};

const getHeaderColor = (result) => {
  if (result.summary.errors > 0) return "red";
  if (result.summary.warnings > 0) return "yellow";
  return "green";
};

const groupCounts = (findings) => {
  const map = new Map();
  for (const finding of findings) {
    const scope = finding.skill ?? "repo";
    if (!map.has(scope)) {
      map.set(scope, { scope, errors: 0, warnings: 0 });
    }
    const entry = map.get(scope);
    if (finding.severity === "error") {
      entry.errors += 1;
    } else {
      entry.warnings += 1;
    }
  }

  return Array.from(map.values()).sort((left, right) => {
    if (right.errors !== left.errors) return right.errors - left.errors;
    if (right.warnings !== left.warnings) return right.warnings - left.warnings;
    return left.scope.localeCompare(right.scope);
  });
};

const relativeFile = (rootDirectory, filePath) => {
  if (!filePath) return "(none)";
  const relative = path.relative(rootDirectory, filePath);
  return relative || ".";
};

const App = ({ result }) => {
  const { exit } = useApp();
  const [filterIndex, setFilterIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [groupByScopeEnabled, setGroupByScopeEnabled] = useState(true);

  const filter = FILTERS[filterIndex];

  const findings = useMemo(() => {
    const filtered = getFilteredFindings(result.findings, filter);
    return sortFindings(filtered, groupByScopeEnabled);
  }, [filter, groupByScopeEnabled, result.findings]);

  const summaryGroups = useMemo(() => groupCounts(findings), [findings]);

  useEffect(() => {
    if (selectedIndex >= findings.length) {
      setSelectedIndex(Math.max(0, findings.length - 1));
    }
  }, [findings.length, selectedIndex]);

  useInput((input, key) => {
    if (input === "q" || key.escape || (key.ctrl && input === "c")) {
      exit();
      return;
    }

    if (findings.length > 0 && (key.downArrow || input === "j")) {
      setSelectedIndex((current) => Math.min(findings.length - 1, current + 1));
      return;
    }

    if (findings.length > 0 && (key.upArrow || input === "k")) {
      setSelectedIndex((current) => Math.max(0, current - 1));
      return;
    }

    if (input === "f") {
      setFilterIndex((current) => (current + 1) % FILTERS.length);
      setSelectedIndex(0);
      return;
    }

    if (input === "g") {
      setGroupByScopeEnabled((current) => !current);
      setSelectedIndex(0);
      return;
    }

    if (input === "0") {
      setSelectedIndex(0);
      return;
    }

    if (input === "G" && findings.length > 0) {
      setSelectedIndex(findings.length - 1);
    }
  });

  const selectedFinding = findings[selectedIndex] ?? null;
  const listHeight = 14;
  const windowStart = Math.max(
    0,
    Math.min(selectedIndex - Math.floor(listHeight / 2), Math.max(0, findings.length - listHeight))
  );
  const visibleList = findings.slice(windowStart, windowStart + listHeight);

  return React.createElement(
    Box,
    { flexDirection: "column" },
    React.createElement(
      Text,
      { color: getHeaderColor(result), bold: true },
      `hig-doctor TUI  Score ${result.summary.score}/100 (${result.summary.label})  Errors ${result.summary.errors}  Warnings ${result.summary.warnings}`
    ),
    React.createElement(Text, { dimColor: true }, `Directory: ${result.directory}`),
    React.createElement(
      Text,
      { dimColor: true },
      `Controls: j/k or arrows move, f filter (${filter}), g group (${groupByScopeEnabled ? "scope" : "severity"}), q quit`
    ),
    React.createElement(Box, { marginTop: 1, flexDirection: "row" },
      React.createElement(
        Box,
        { width: 72, borderStyle: "round", borderColor: "cyan", flexDirection: "column", paddingX: 1 },
        React.createElement(Text, { bold: true }, `Findings (${findings.length})`),
        findings.length === 0
          ? React.createElement(Text, { color: "green" }, "No findings for current filter.")
          : visibleList.map((finding, offset) => {
              const actualIndex = windowStart + offset;
              const selected = actualIndex === selectedIndex;
              const marker = selected ? ">" : " ";
              const severityMark = finding.severity === "error" ? "E" : "W";
              const scope = finding.skill ?? "repo";
              const line = `${marker} [${severityMark}] [${scope}] ${finding.ruleId} - ${finding.message}`;

              return React.createElement(
                Text,
                {
                  key: `${finding.ruleId}-${actualIndex}-${finding.message}`,
                  color: selected ? "cyan" : finding.severity === "error" ? "red" : "yellow"
                },
                truncate(line, 96)
              );
            })
      ),
      React.createElement(
        Box,
        {
          flexGrow: 1,
          marginLeft: 1,
          borderStyle: "round",
          borderColor: "gray",
          flexDirection: "column",
          paddingX: 1
        },
        React.createElement(Text, { bold: true }, "Details"),
        selectedFinding
          ? React.createElement(
              React.Fragment,
              null,
              React.createElement(
                Text,
                { color: selectedFinding.severity === "error" ? "red" : "yellow" },
                `Severity: ${selectedFinding.severity.toUpperCase()}`
              ),
              React.createElement(Text, null, `Scope: ${selectedFinding.skill ?? "repo"}`),
              React.createElement(Text, null, `Rule: ${selectedFinding.ruleId}`),
              React.createElement(Text, null, `File: ${relativeFile(result.directory, selectedFinding.file)}`),
              React.createElement(Text, null, "Message:"),
              React.createElement(Text, null, selectedFinding.message)
            )
          : React.createElement(Text, { color: "green" }, "No finding selected."),
        React.createElement(Box, { marginTop: 1, flexDirection: "column" },
          React.createElement(Text, { bold: true }, "Scope summary"),
          summaryGroups.length === 0
            ? React.createElement(Text, { dimColor: true }, "No findings")
            : summaryGroups.slice(0, 6).map((entry) =>
                React.createElement(
                  Text,
                  { key: entry.scope, dimColor: true },
                  `${entry.scope}: ${entry.errors}e/${entry.warnings}w`
                )
              )
        )
      )
    )
  );
};

export const runTui = async (result) => {
  const instance = render(React.createElement(App, { result }));
  await instance.waitUntilExit();
};
