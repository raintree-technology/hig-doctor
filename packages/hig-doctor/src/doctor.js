import { promises as fs } from "node:fs"
import path from "node:path"

const MAX_SKILL_LINES = 500
const MAX_DESCRIPTION_LENGTH = 1024
const NAME_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
const SEMVER_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+$/
const FRONTMATTER_PATTERN = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/
const HIG_TITLE_PATTERN = /^#\s+Apple HIG:\s+/m
const CONTEXT_HINT_PATTERN = /\.claude\/apple-design-context\.md/

const DEFAULT_PROFILE = {
  requiredSections: ["Key Principles", "Reference Index", "Output Format", "Questions to Ask", "Related Skills"],
  requiresReferencesDirectory: true,
  requiresReferenceIndexLinks: true,
}

const SKILL_PROFILES = {
  "hig-project-context": {
    requiredSections: ["Gathering Context", "Context Document Template", "Related Skills"],
    requiresReferencesDirectory: false,
    requiresReferenceIndexLinks: false,
  },
}

const stripQuotes = (value) => {
  const trimmed = value.trim()
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

const normalizeReferencePath = (referencePath) =>
  referencePath.split(/[?#]/)[0].replace(/\\/g, "/").replace(/^\.\//, "")

const uniqueSorted = (values) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const getScoreLabel = (score) => {
  if (score >= 90) return "Great"
  if (score >= 70) return "Needs work"
  return "Critical"
}

const calculateScore = (errors, warnings) => {
  const score = Math.max(0, 100 - errors * 10 - warnings * 2)
  return {
    score,
    label: getScoreLabel(score),
  }
}

const parseVersionsMarkdown = (content) => {
  const versions = new Map()
  const duplicates = []
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue

    const cells = line.split("|").map((cell) => cell.trim())
    if (cells.length < 4) continue

    const skill = cells[1]
    const version = cells[2]
    if (!skill || skill === "Skill" || skill.startsWith("---")) continue

    if (versions.has(skill)) {
      duplicates.push(skill)
      continue
    }

    versions.set(skill, version)
  }

  return {
    versions,
    duplicates: uniqueSorted(duplicates),
  }
}

const parseFrontmatter = (frontmatter) => {
  const fields = {}
  const lines = frontmatter.split(/\r?\n/)

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const fieldMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!fieldMatch) continue

    const key = fieldMatch[1]
    const rawValue = fieldMatch[2] ?? ""

    if (/^[>|]/.test(rawValue)) {
      const blockLines = []
      let pointer = index + 1
      while (pointer < lines.length) {
        const current = lines[pointer]
        if (/^[A-Za-z0-9_-]+:\s*/.test(current)) {
          break
        }
        if (current.trim().length === 0) {
          blockLines.push("")
          pointer += 1
          continue
        }
        if (!/^\s+/.test(current)) {
          break
        }
        blockLines.push(current.replace(/^\s+/, ""))
        pointer += 1
      }

      fields[key] = blockLines.join(" ").replace(/\s+/g, " ").trim()
      index = pointer - 1
      continue
    }

    fields[key] = stripQuotes(rawValue)
  }

  return fields
}

const getLineCount = (content) => {
  if (content.length === 0) return 0
  const newlineMatches = content.match(/\r?\n/g)
  const newlineCount = newlineMatches ? newlineMatches.length : 0
  return content.endsWith("\n") ? newlineCount : newlineCount + 1
}

// Replace fenced code blocks with blank lines so that `##` lines *inside* an
// example (e.g. a "## Output Format" shown in a code sample) are not counted as
// real document sections. Preserves line count.
const stripFencedCode = (content) => {
  let inFence = false
  let fenceChar = ""
  return content
    .split(/\r?\n/)
    .map((line) => {
      const m = line.match(/^\s*(```+|~~~+)/)
      if (m) {
        const ch = m[1][0]
        if (!inFence) {
          inFence = true
          fenceChar = ch
          return ""
        }
        if (ch === fenceChar) {
          inFence = false
          return ""
        }
      }
      return inFence ? "" : line
    })
    .join("\n")
}

const extractH2Headings = (skillContent) => {
  const headings = []
  const stripped = stripFencedCode(skillContent)
  const regex = /^##\s+(.+?)\s*$/gm
  let match = regex.exec(stripped)
  while (match !== null) {
    headings.push(match[1].trim())
    match = regex.exec(stripped)
  }
  return headings
}

const extractReferenceLinks = (skillContent) => {
  const links = []
  const referencePattern = /\((references\/[^)\s]+)\)/g
  let match = referencePattern.exec(skillContent)
  while (match !== null) {
    links.push(normalizeReferencePath(match[1]))
    match = referencePattern.exec(skillContent)
  }
  return uniqueSorted(links)
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const extractSectionBody = (skillContent, heading) => {
  const headingRegex = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*$`, "m")
  const match = skillContent.match(headingRegex)
  if (!match || typeof match.index !== "number") {
    return ""
  }

  const start = match.index + match[0].length
  const remaining = skillContent.slice(start)
  const nextHeadingMatch = remaining.match(/^##\s+/m)
  const end =
    nextHeadingMatch && typeof nextHeadingMatch.index === "number"
      ? start + nextHeadingMatch.index
      : skillContent.length

  return skillContent.slice(start, end).trim()
}

const parseRelatedSkills = (skillContent) => {
  const relatedSection = extractSectionBody(skillContent, "Related Skills")
  if (!relatedSection) return []
  const matches = relatedSection.match(/hig-[a-z0-9-]+\*?/g)
  return matches ? uniqueSorted(matches) : []
}

const resolveSkillProfile = (skillName) => SKILL_PROFILES[skillName] ?? DEFAULT_PROFILE

const addFinding = (collection, finding) => {
  collection.push({
    severity: finding.severity,
    ruleId: finding.ruleId,
    message: finding.message,
    file: finding.file ? path.resolve(finding.file) : null,
    skill: finding.skill ?? null,
  })
}

const collectSkillDirectories = async (skillsRoot) => {
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))
}

const collectReferenceFiles = async (referencesDirPath, relativePrefix = "") => {
  const entries = await fs.readdir(referencesDirPath, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const relativePath = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      const childDirectoryPath = path.join(referencesDirPath, entry.name)
      files.push(...(await collectReferenceFiles(childDirectoryPath, relativePath)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(normalizeReferencePath(`references/${relativePath}`))
    }
  }

  return files
}

const parseMarketplaceSkillNames = (marketplace) => {
  const names = []
  const invalidEntries = []

  const plugins = Array.isArray(marketplace.plugins) ? marketplace.plugins : []
  for (const plugin of plugins) {
    const skills = Array.isArray(plugin.skills) ? plugin.skills : []
    for (const skillPath of skills) {
      if (typeof skillPath !== "string") continue
      const normalized = skillPath.replace(/^\.\//, "")
      const match = normalized.match(/^skills\/([^/]+)$/)
      if (!match) {
        invalidEntries.push(skillPath)
        continue
      }
      names.push(match[1])
    }
  }

  return {
    names: uniqueSorted(names),
    invalidEntries: uniqueSorted(invalidEntries),
  }
}

const parseReadmeSkillNames = (readmeContent) => {
  const names = []
  const regex = /^\|\s*`(hig-[^`]+)`\s*\|/gm
  let match = regex.exec(readmeContent)
  while (match !== null) {
    names.push(match[1])
    match = regex.exec(readmeContent)
  }
  return uniqueSorted(names)
}

const setDifference = (left, right) => left.filter((value) => !right.includes(value))

const buildAgentTodoList = (findings, rootDirectory) => {
  if (!Array.isArray(findings) || findings.length === 0) {
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
        verifyCommand: `node packages/hig-doctor/src/cli.js "${rootDirectory}" --score`,
      },
    ]
  }

  const groups = new Map()

  for (const finding of findings) {
    const scope = finding.skill ?? "repo"
    const key = `${finding.severity}:${finding.ruleId}:${scope}`
    if (!groups.has(key)) {
      groups.set(key, {
        severity: finding.severity,
        ruleId: finding.ruleId,
        scope,
        count: 0,
        files: new Set(),
        messages: new Set(),
      })
    }

    const group = groups.get(key)
    group.count += 1
    group.messages.add(finding.message)
    if (typeof finding.file === "string" && finding.file.length > 0) {
      group.files.add(path.relative(rootDirectory, finding.file) || ".")
    }
  }

  const sortedGroups = Array.from(groups.values()).sort((left, right) => {
    if (left.severity !== right.severity) return left.severity === "error" ? -1 : 1
    if (right.count !== left.count) return right.count - left.count
    if (left.scope !== right.scope) return left.scope.localeCompare(right.scope)
    return left.ruleId.localeCompare(right.ruleId)
  })

  return sortedGroups.map((group, index) => {
    const priority = group.severity === "error" ? "high" : "medium"
    const actionVerb = group.severity === "error" ? "Fix" : "Address"
    const sampleMessage = Array.from(group.messages.values())[0] ?? ""
    const files = Array.from(group.files.values()).sort((left, right) => left.localeCompare(right))

    return {
      id: `todo-${index + 1}`,
      priority,
      severity: group.severity,
      ruleId: group.ruleId,
      scope: group.scope,
      occurrences: group.count,
      files,
      task: `${actionVerb} ${group.ruleId} in ${group.scope}`,
      details: sampleMessage,
      doneWhen: `No ${group.ruleId} findings remain for scope '${group.scope}' and score reaches 100/100.`,
      verifyCommand: `node packages/hig-doctor/src/cli.js "${rootDirectory}" --json`,
    }
  })
}

const validateSkill = async ({ rootDirectory, skillsRoot, skillName, versionsMap, knownSkillNames, findings }) => {
  const skillPath = path.join(skillsRoot, skillName)
  const skillFilePath = path.join(skillPath, "SKILL.md")

  if (!(await fileExists(skillFilePath))) {
    addFinding(findings, {
      severity: "error",
      ruleId: "skill/skill-file-exists",
      message: `${skillName}: SKILL.md not found`,
      file: skillFilePath,
      skill: skillName,
    })
    return
  }

  const skillContent = await fs.readFile(skillFilePath, "utf8")
  const profile = resolveSkillProfile(skillName)
  const headings = extractH2Headings(skillContent)

  const lineCount = getLineCount(skillContent)
  if (lineCount > MAX_SKILL_LINES) {
    addFinding(findings, {
      severity: "error",
      ruleId: "skill/max-lines",
      message: `${skillName}: SKILL.md is ${lineCount} lines (max ${MAX_SKILL_LINES})`,
      file: skillFilePath,
      skill: skillName,
    })
  }

  if (!HIG_TITLE_PATTERN.test(skillContent)) {
    addFinding(findings, {
      severity: "warning",
      ruleId: "skill/title-format",
      message: `${skillName}: expected top-level heading like '# Apple HIG: ...'`,
      file: skillFilePath,
      skill: skillName,
    })
  }

  if (!CONTEXT_HINT_PATTERN.test(skillContent)) {
    addFinding(findings, {
      severity: "warning",
      ruleId: "skill/context-check-hint",
      message: `${skillName}: missing '.claude/apple-design-context.md' guidance`,
      file: skillFilePath,
      skill: skillName,
    })
  }

  for (const requiredHeading of profile.requiredSections) {
    if (!headings.includes(requiredHeading)) {
      addFinding(findings, {
        severity: "error",
        ruleId: "skill/required-section",
        message: `${skillName}: missing required section '## ${requiredHeading}'`,
        file: skillFilePath,
        skill: skillName,
      })
    }
  }

  const frontmatterMatch = skillContent.match(FRONTMATTER_PATTERN)
  if (!frontmatterMatch) {
    addFinding(findings, {
      severity: "error",
      ruleId: "skill/frontmatter-exists",
      message: `${skillName}: missing YAML frontmatter`,
      file: skillFilePath,
      skill: skillName,
    })
    return
  }

  const fields = parseFrontmatter(frontmatterMatch[1])
  const name = fields.name ?? ""
  const version = fields.version ?? ""
  const description = fields.description ?? ""

  if (!name) {
    addFinding(findings, {
      severity: "error",
      ruleId: "skill/name-required",
      message: `${skillName}: missing 'name' in frontmatter`,
      file: skillFilePath,
      skill: skillName,
    })
  } else {
    if (name !== skillName) {
      addFinding(findings, {
        severity: "error",
        ruleId: "skill/name-matches-directory",
        message: `${skillName}: name '${name}' does not match directory name`,
        file: skillFilePath,
        skill: skillName,
      })
    }

    if (!NAME_PATTERN.test(name)) {
      addFinding(findings, {
        severity: "error",
        ruleId: "skill/name-format",
        message: `${skillName}: name '${name}' must be lowercase alphanumeric with hyphens`,
        file: skillFilePath,
        skill: skillName,
      })
    }

    if (name.includes("--")) {
      addFinding(findings, {
        severity: "error",
        ruleId: "skill/name-no-consecutive-hyphens",
        message: `${skillName}: name '${name}' contains consecutive hyphens`,
        file: skillFilePath,
        skill: skillName,
      })
    }
  }

  if (!version) {
    addFinding(findings, {
      severity: "error",
      ruleId: "skill/version-required",
      message: `${skillName}: missing 'version' in frontmatter`,
      file: skillFilePath,
      skill: skillName,
    })
  } else if (!SEMVER_PATTERN.test(version)) {
    addFinding(findings, {
      severity: "error",
      ruleId: "skill/version-semver",
      message: `${skillName}: version '${version}' is not valid semver`,
      file: skillFilePath,
      skill: skillName,
    })
  }

  if (!description) {
    addFinding(findings, {
      severity: "error",
      ruleId: "skill/description-required",
      message: `${skillName}: missing 'description' in frontmatter`,
      file: skillFilePath,
      skill: skillName,
    })
  } else {
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      addFinding(findings, {
        severity: "error",
        ruleId: "skill/description-max-length",
        message: `${skillName}: description is ${description.length} chars (max ${MAX_DESCRIPTION_LENGTH})`,
        file: skillFilePath,
        skill: skillName,
      })
    }

    if (!/(use this skill|use when|when asked|when the user says)/i.test(description)) {
      addFinding(findings, {
        severity: "warning",
        ruleId: "skill/description-trigger-phrases",
        message: `${skillName}: description should include natural-language trigger phrases`,
        file: skillFilePath,
        skill: skillName,
      })
    }
  }

  const versionsVersion = versionsMap.get(skillName)
  if (!versionsVersion) {
    addFinding(findings, {
      severity: "error",
      ruleId: "skill/version-listed-in-versions",
      message: `${skillName}: no entry found in VERSIONS.md`,
      file: path.join(rootDirectory, "VERSIONS.md"),
      skill: skillName,
    })
  } else if (version && versionsVersion !== version) {
    addFinding(findings, {
      severity: "error",
      ruleId: "skill/version-matches-versions",
      message: `${skillName}: version '${version}' does not match VERSIONS.md '${versionsVersion}'`,
      file: skillFilePath,
      skill: skillName,
    })
  }

  const referencesDirPath = path.join(skillPath, "references")
  const referencesDirExists = await fileExists(referencesDirPath)

  if (profile.requiresReferencesDirectory && !referencesDirExists) {
    addFinding(findings, {
      severity: "error",
      ruleId: "skill/references-directory-exists",
      message: `${skillName}: references/ directory is required`,
      file: referencesDirPath,
      skill: skillName,
    })
  }

  let referenceFiles = []
  if (referencesDirExists) {
    referenceFiles = uniqueSorted(await collectReferenceFiles(referencesDirPath))

    if (profile.requiresReferencesDirectory && referenceFiles.length === 0) {
      addFinding(findings, {
        severity: "warning",
        ruleId: "skill/references-directory-has-files",
        message: `${skillName}: references/ exists but has no markdown files`,
        file: referencesDirPath,
        skill: skillName,
      })
    }
  }

  const referenceLinks = extractReferenceLinks(skillContent)

  if (profile.requiresReferenceIndexLinks && referenceLinks.length === 0) {
    addFinding(findings, {
      severity: "error",
      ruleId: "skill/reference-index-links",
      message: `${skillName}: no references/* links found in SKILL.md`,
      file: skillFilePath,
      skill: skillName,
    })
  }

  for (const linkedReferencePath of referenceLinks) {
    const absoluteReferencePath = path.join(skillPath, linkedReferencePath)
    if (!(await fileExists(absoluteReferencePath))) {
      addFinding(findings, {
        severity: "error",
        ruleId: "skill/reference-file-exists",
        message: `${skillName}: referenced file '${linkedReferencePath}' does not exist`,
        file: skillFilePath,
        skill: skillName,
      })
    }
  }

  if (referenceFiles.length > 0) {
    const unreferencedFiles = setDifference(referenceFiles, referenceLinks)
    for (const unreferencedFile of unreferencedFiles) {
      addFinding(findings, {
        severity: "warning",
        ruleId: "skill/reference-file-referenced",
        message: `${skillName}: '${unreferencedFile}' is not linked from SKILL.md`,
        file: skillFilePath,
        skill: skillName,
      })
    }
  }

  const relatedSkills = parseRelatedSkills(skillContent)
  for (const relatedSkill of relatedSkills) {
    if (relatedSkill.endsWith("*")) {
      const prefix = relatedSkill.slice(0, -1)
      const hasMatch = knownSkillNames.some((knownSkillName) => knownSkillName.startsWith(prefix))
      if (!hasMatch) {
        addFinding(findings, {
          severity: "warning",
          ruleId: "skill/related-skill-wildcard-resolves",
          message: `${skillName}: related skill wildcard '${relatedSkill}' matches no skills`,
          file: skillFilePath,
          skill: skillName,
        })
      }
      continue
    }

    if (!knownSkillNames.includes(relatedSkill)) {
      addFinding(findings, {
        severity: "warning",
        ruleId: "skill/related-skill-exists",
        message: `${skillName}: related skill '${relatedSkill}' does not exist in skills/`,
        file: skillFilePath,
        skill: skillName,
      })
    }
  }
}

export const diagnose = async (directory = ".", options = {}) => {
  const rootDirectory = path.resolve(directory)
  const findings = []
  const strict = Boolean(options.strict)

  const versionsPath = path.join(rootDirectory, "VERSIONS.md")
  const skillsRoot = path.join(rootDirectory, "skills")
  const readmePath = path.join(rootDirectory, "README.md")
  const marketplacePath = path.join(rootDirectory, ".claude-plugin", "marketplace.json")

  let versionsMap = new Map()
  if (!(await fileExists(versionsPath))) {
    addFinding(findings, {
      severity: "error",
      ruleId: "repo/versions-file-exists",
      message: "VERSIONS.md not found at repository root",
      file: versionsPath,
    })
  } else {
    const versionsContent = await fs.readFile(versionsPath, "utf8")
    const parsedVersions = parseVersionsMarkdown(versionsContent)
    versionsMap = parsedVersions.versions

    if (versionsMap.size === 0) {
      addFinding(findings, {
        severity: "error",
        ruleId: "repo/versions-table-populated",
        message: "VERSIONS.md does not contain any skill versions",
        file: versionsPath,
      })
    }

    for (const duplicateSkill of parsedVersions.duplicates) {
      addFinding(findings, {
        severity: "error",
        ruleId: "repo/versions-no-duplicate-rows",
        message: `VERSIONS.md has duplicate rows for '${duplicateSkill}'`,
        file: versionsPath,
      })
    }
  }

  if (!(await fileExists(skillsRoot))) {
    addFinding(findings, {
      severity: "error",
      ruleId: "repo/skills-directory-exists",
      message: "skills/ directory not found",
      file: skillsRoot,
    })
  }

  const skillDirectories = (await fileExists(skillsRoot)) ? await collectSkillDirectories(skillsRoot) : []

  if (skillDirectories.length === 0) {
    addFinding(findings, {
      severity: "error",
      ruleId: "repo/skills-directory-populated",
      message: "skills/ contains no skill directories",
      file: skillsRoot,
    })
  }

  for (const skillName of skillDirectories) {
    await validateSkill({
      rootDirectory,
      skillsRoot,
      skillName,
      versionsMap,
      knownSkillNames: skillDirectories,
      findings,
    })
  }

  for (const listedSkillName of versionsMap.keys()) {
    if (!skillDirectories.includes(listedSkillName)) {
      addFinding(findings, {
        severity: "error",
        ruleId: "versions/entry-has-skill-directory",
        message: `VERSIONS.md lists '${listedSkillName}' but skills/${listedSkillName}/ does not exist`,
        file: versionsPath,
      })
    }
  }

  if (!(await fileExists(marketplacePath))) {
    addFinding(findings, {
      severity: "error",
      ruleId: "repo/marketplace-file-exists",
      message: ".claude-plugin/marketplace.json not found",
      file: marketplacePath,
    })
  } else {
    let marketplace
    try {
      const marketplaceRaw = await fs.readFile(marketplacePath, "utf8")
      marketplace = JSON.parse(marketplaceRaw)
    } catch (error) {
      addFinding(findings, {
        severity: "error",
        ruleId: "repo/marketplace-json-valid",
        message: `.claude-plugin/marketplace.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
        file: marketplacePath,
      })
      marketplace = null
    }

    if (marketplace) {
      const parsedSkillNames = parseMarketplaceSkillNames(marketplace)

      for (const invalidEntry of parsedSkillNames.invalidEntries) {
        addFinding(findings, {
          severity: "error",
          ruleId: "repo/marketplace-skill-path-format",
          message: `marketplace skill path '${invalidEntry}' must match './skills/<name>'`,
          file: marketplacePath,
        })
      }

      const missingFromMarketplace = setDifference(skillDirectories, parsedSkillNames.names)
      const missingFromSkills = setDifference(parsedSkillNames.names, skillDirectories)

      for (const missingSkill of missingFromMarketplace) {
        addFinding(findings, {
          severity: "error",
          ruleId: "repo/marketplace-includes-all-skills",
          message: `marketplace.json is missing skill '${missingSkill}'`,
          file: marketplacePath,
          skill: missingSkill,
        })
      }

      for (const unknownSkill of missingFromSkills) {
        addFinding(findings, {
          severity: "error",
          ruleId: "repo/marketplace-skill-exists",
          message: `marketplace.json references unknown skill '${unknownSkill}'`,
          file: marketplacePath,
          skill: unknownSkill,
        })
      }
    }
  }

  if (!(await fileExists(readmePath))) {
    addFinding(findings, {
      severity: "warning",
      ruleId: "repo/readme-exists",
      message: "README.md not found",
      file: readmePath,
    })
  } else {
    const readmeContent = await fs.readFile(readmePath, "utf8")
    const readmeSkillNames = parseReadmeSkillNames(readmeContent)

    if (readmeSkillNames.length === 0) {
      addFinding(findings, {
        severity: "warning",
        ruleId: "repo/readme-skills-table-populated",
        message: "README.md has no '| `hig-*` |' skill table entries",
        file: readmePath,
      })
    }

    const missingFromReadme = setDifference(skillDirectories, readmeSkillNames)
    const unknownInReadme = setDifference(readmeSkillNames, skillDirectories)

    for (const missingSkill of missingFromReadme) {
      addFinding(findings, {
        severity: "warning",
        ruleId: "repo/readme-includes-all-skills",
        message: `README.md skills table is missing '${missingSkill}'`,
        file: readmePath,
        skill: missingSkill,
      })
    }

    for (const unknownSkill of unknownInReadme) {
      addFinding(findings, {
        severity: "warning",
        ruleId: "repo/readme-skill-exists",
        message: `README.md skills table references unknown skill '${unknownSkill}'`,
        file: readmePath,
        skill: unknownSkill,
      })
    }
  }

  const errorCount = findings.filter((finding) => finding.severity === "error").length
  const warningCount = findings.filter((finding) => finding.severity === "warning").length
  const scoreResult = calculateScore(errorCount, warningCount)
  const passed = errorCount === 0 && (!strict || warningCount === 0)

  const ruleCounts = {}
  const skillSummaries = {}

  for (const finding of findings) {
    ruleCounts[finding.ruleId] = (ruleCounts[finding.ruleId] ?? 0) + 1

    const scope = finding.skill ?? "repo"
    if (!skillSummaries[scope]) {
      skillSummaries[scope] = {
        scope,
        errors: 0,
        warnings: 0,
      }
    }

    if (finding.severity === "error") {
      skillSummaries[scope].errors += 1
    } else {
      skillSummaries[scope].warnings += 1
    }
  }

  const sortedSkillSummaries = Object.values(skillSummaries).sort((left, right) => {
    if (right.errors !== left.errors) return right.errors - left.errors
    if (right.warnings !== left.warnings) return right.warnings - left.warnings
    return left.scope.localeCompare(right.scope)
  })

  return {
    directory: rootDirectory,
    checkedAt: new Date().toISOString(),
    strict,
    skillCount: skillDirectories.length,
    versionsCount: versionsMap.size,
    findings,
    summary: {
      errors: errorCount,
      warnings: warningCount,
      score: scoreResult.score,
      label: scoreResult.label,
      passed,
    },
    todo: buildAgentTodoList(findings, rootDirectory),
    stats: {
      rules: ruleCounts,
      scopes: sortedSkillSummaries,
    },
  }
}
