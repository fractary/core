#!/usr/bin/env node

/**
 * Converts command .md files into portable SKILL.md files.
 *
 * For each command:
 *   - Skill-delegate commands (body contains `Skill(`) → flagged for deletion
 *   - CLI/compound commands → transformed into a new skill
 *
 * Usage: node scripts/convert-commands-to-skills.js [--dry-run]
 */

import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PLUGINS = ['core', 'repo', 'work', 'file', 'logs', 'docs']
const DRY_RUN = process.argv.includes('--dry-run')

// --- Frontmatter parsing ---

function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: normalized }

  const meta = {}
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\S+?):\s*(.*)$/)
    if (m) meta[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  return { meta, body: match[2] || '' }
}

// --- Body transformation ---

function transformBody(body, meta) {
  let text = body || ''

  // Extract !`cmd` context injections and build a Context section
  const contextCmds = []
  text = text.replace(/^.*?:\s*!`([^`]+)`\s*$/gm, (_match, cmd) => {
    contextCmds.push(cmd)
    return '' // remove the line
  })

  // Strip Claude Code-specific directives
  const stripPatterns = [
    /^.*Use the \*\*Bash\*\* tool.*$/gm,
    /^.*Do NOT use the Skill tool.*$/gm,
    /^.*You MUST use the Bash tool.*$/gm,
    /^.*You MUST only use the Bash tool.*$/gm,
    /^.*Execute all steps in a single message.*$/gm,
    /^.*Do not use any other tools or do anything else.*$/gm,
    /^.*Do not send any other text or messages besides these tool calls.*$/gm,
    /^.*Do NOT call yourself recursively.*$/gm,
    /^.*Call `fractary-core.*` with Bash exactly once\. Do not use any other tools\.\s*$/gm,
    /^.*You have the capability to call multiple tools in a single response\..*$/gm,
    /^\*\*IMPORTANT: The CLI binary is `fractary-core`.*$/gm,
  ]
  for (const pat of stripPatterns) {
    text = text.replace(pat, '')
  }

  // Strip "## Rules" sections that are just about tool restrictions
  text = text.replace(/^## Rules\n+(?:- You MUST only use.*\n?)+/gm, '')

  // Remove original "## Context" section if we extracted !`cmd` from it
  if (contextCmds.length > 0) {
    text = text.replace(/^## Context\n+/gm, '')
  }

  // Clean up "## Your task" headers (these become the main content)
  text = text.replace(/^## Your task\n+/gm, '')

  // Strip "Parse arguments:" sections (will be replaced by Arguments table)
  text = text.replace(/^Parse arguments:\n(?:- .*\n)*/gm, '')

  // Clean up excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n')

  // Build the final skill body
  const sections = []

  // Context section (from !`cmd` extractions)
  if (contextCmds.length > 0) {
    sections.push('## Context\n\nFirst gather current state:')
    for (const cmd of contextCmds) {
      sections.push(`- Run \`${cmd}\``)
    }
    sections.push('')
  }

  // Arguments section (from argument-hint)
  const argHint = meta['argument-hint']
  if (argHint) {
    const args = parseArgumentHint(argHint, text)
    if (args.length > 0) {
      sections.push('## Arguments\n')
      sections.push('| Argument | Required | Description |')
      sections.push('|----------|----------|-------------|')
      for (const arg of args) {
        sections.push(`| \`${arg.name}\` | ${arg.required ? 'Yes' : 'No'} | ${arg.desc} |`)
      }
      sections.push('')
    }
  }

  // Main execution content
  const trimmed = text.trim()
  if (trimmed) {
    // If it doesn't already have an ## Execution header, add one
    if (!trimmed.includes('## Execution') && !trimmed.startsWith('## ')) {
      sections.push('## Execution\n')
    }
    sections.push(trimmed)
  }

  return sections.join('\n')
}

function parseArgumentHint(hint, bodyText) {
  const args = []
  // Strip outer quotes
  let cleaned = hint.replace(/^'|'$/g, '')

  // Step 1: Extract all bracket groups [--flag ...] or [--flag]
  const bracketGroups = [...cleaned.matchAll(/\[(--\S+?)(?:\s+(?:<[^>]+>|"[^"]*"|[^[\]]+))?\]/g)]
  for (const m of bracketGroups) {
    const flagName = m[1]
    if (!args.some(a => a.name === flagName)) {
      const desc = findArgDescription(flagName.replace(/^--/, ''), bodyText) || flagName.replace(/^--/, '').replace(/-/g, ' ')
      args.push({ name: flagName, required: false, desc })
    }
  }

  // Step 2: Remove all bracket groups to find positional args
  let remaining = cleaned.replace(/\[[^\]]*\]/g, '').trim()

  // Step 3: Extract required flags from what's left: --name <val> or --name
  for (const m of remaining.matchAll(/--([\w-]+)(?:\s+(?:<[^>]+>|"[^"]*"))?/g)) {
    const flagName = `--${m[1]}`
    if (!args.some(a => a.name === flagName)) {
      const desc = findArgDescription(m[1], bodyText) || m[1].replace(/-/g, ' ')
      args.push({ name: flagName, required: true, desc })
    }
  }

  // Step 4: Remove all flags from remaining to find bare positional args
  remaining = remaining.replace(/--[\w-]+(?:\s+(?:<[^>]+>|"[^"]*"))?/g, '').trim()

  // Step 5: Extract positional <name> args from what's left
  for (const m of remaining.matchAll(/<([^>]+)>/g)) {
    const desc = findArgDescription(m[1], bodyText) || m[1].replace(/_/g, ' ')
    args.unshift({ name: `<${m[1]}>`, required: true, desc })
  }

  return args
}

function findArgDescription(argName, body) {
  if (!body || !argName) return null
  // Escape regex special chars in argName
  const escaped = argName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const patterns = [
    new RegExp(`-\\s+--${escaped}[^:]*:\\s*(.+)`, 'i'),
    new RegExp(`-\\s+${escaped}[^:]*:\\s*(.+)`, 'i'),
  ]
  for (const pat of patterns) {
    const m = body.match(pat)
    if (m && m[1]) return m[1].trim()
  }
  return null
}

// --- Description enhancement ---

function enhanceDescription(name, desc) {
  // If description already has "Use when", return as-is
  if (/use when/i.test(desc)) return desc

  // Add a "Use when" suffix based on the operation
  const op = name.replace(/^fractary-\w+-/, '')
  const triggers = {
    'commit': 'Use when creating a git commit from current changes.',
    'push': 'Use when pushing the current branch to the remote.',
    'pull': 'Use when pulling changes from the remote.',
    'branch-create': 'Use when creating a new git branch.',
    'branch-forward': 'Use when merging a source branch into a target branch.',
    'pr-create': 'Use when creating a pull request.',
    'pr-merge': 'Use when merging a pull request.',
    'commit-push': 'Use when committing and pushing changes in one step.',
    'commit-push-pr': 'Use when committing, pushing, and creating a PR in one step.',
    'commit-push-pr-merge': 'Use when committing, pushing, creating and merging a PR in one step.',
    'commit-push-pr-review': 'Use when committing, pushing, creating a PR, and running a review.',
    'worktree-create': 'Use when creating a new git worktree.',
    'worktree-list': 'Use when listing git worktrees.',
    'worktree-remove': 'Use when removing a git worktree.',
    'worktree-cleanup': 'Use when cleaning up stale git worktrees.',
    'issue-create': 'Use when creating a new issue.',
    'issue-fetch': 'Use when fetching details for a specific issue.',
    'issue-list': 'Use when listing issues.',
    'issue-search': 'Use when searching for issues.',
    'issue-update': 'Use when updating an existing issue.',
    'issue-comment': 'Use when adding a comment to an issue.',
    'upload': 'Use when uploading a file to storage.',
    'download': 'Use when downloading a file from storage.',
    'delete': 'Use when deleting a file from storage.',
    'list': 'Use when listing files in storage.',
    'copy': 'Use when copying a file within storage.',
    'move': 'Use when moving a file within storage.',
    'read': 'Use when reading file content from storage.',
    'write': 'Use when writing content to a storage path.',
    'exists': 'Use when checking if a file exists in storage.',
    'get-url': 'Use when getting a URL for a file in storage.',
    'show-config': 'Use when displaying configuration.',
    'test-connection': 'Use when testing storage connection.',
    'config-show': 'Use when displaying Fractary configuration.',
    'config-validate': 'Use when validating Fractary configuration.',
    'env-init': 'Use when initializing environment credential files.',
    'env-list': 'Use when listing available environments.',
    'env-show': 'Use when showing current environment status.',
    'env-section-read': 'Use when reading a section from an environment file.',
    'env-section-write': 'Use when writing a section to an environment file.',
    'archive': 'Use when archiving old entries.',
    'capture': 'Use when starting a session capture.',
    'stop': 'Use when stopping a session capture.',
    'search': 'Use when searching entries.',
    'validate': 'Use when validating entries against type rules.',
    'type-info': 'Use when getting information about a specific type.',
    'type-list': 'Use when listing available types.',
    'types': 'Use when listing available types.',
    'doc-create': 'Use when creating a new document.',
    'doc-delete': 'Use when deleting a document.',
    'doc-get': 'Use when retrieving a document.',
    'doc-list': 'Use when listing documents.',
    'doc-search': 'Use when searching documents.',
    'doc-update': 'Use when updating a document.',
  }

  const trigger = triggers[op]
  if (!trigger) return desc

  // Avoid tautology: if the trigger basically restates the description, just use the trigger as the description
  const descWords = new Set(desc.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/))
  const triggerWords = trigger.replace(/^Use when /i, '').replace(/\.$/, '').toLowerCase().split(/\s+/)
  const overlap = triggerWords.filter(w => descWords.has(w) && w.length > 3).length
  if (overlap >= 2) {
    // High overlap — just return the description as-is (the trigger adds nothing)
    return desc
  }
  return `${desc}. ${trigger}`
}

// --- Title generation ---

function titleFromName(name) {
  return name
    .replace(/^fractary-\w+-/, '')     // strip plugin prefix
    .replace(/-/g, ' ')                // dashes to spaces
    .replace(/\b\w/g, c => c.toUpperCase()) // title case
}

// --- Main ---

const report = { created: [], skipped: [], errors: [] }

for (const plugin of PLUGINS) {
  const cmdsDir = path.join(ROOT, 'plugins', plugin, 'commands')
  if (!fs.existsSync(cmdsDir)) continue

  const files = fs.readdirSync(cmdsDir).filter(f => f.endsWith('.md'))

  for (const file of files) {
    const filePath = path.join(cmdsDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const { meta, body } = parseFrontmatter(content)

    const name = meta.name || file.replace('.md', '')

    // Classify: skill-delegate if body contains Skill( invocation
    const isSkillDelegate = /Skill\s*\(/.test(body)

    if (isSkillDelegate) {
      report.skipped.push({ name, reason: 'skill-delegate (existing skill handles this)', plugin })
      continue
    }

    // Transform into a skill
    try {
      const description = enhanceDescription(name, meta.description || name)
      const title = titleFromName(name)
      const skillBody = transformBody(body, meta)

      const skillContent = [
        '---',
        `name: ${name}`,
        `description: ${description}`,
        '---',
        '',
        `# ${title}`,
        '',
        skillBody,
        '',
      ].join('\n')

      // Write to skills directory
      const skillDir = path.join(ROOT, 'plugins', plugin, 'skills', name)
      const skillPath = path.join(skillDir, 'SKILL.md')

      if (!DRY_RUN) {
        fs.mkdirSync(skillDir, { recursive: true })
        fs.writeFileSync(skillPath, skillContent)
      }

      report.created.push({ name, plugin, path: skillPath })
    } catch (err) {
      report.errors.push({ name, plugin, error: err.stack })
    }
  }
}

// --- Report ---

console.log('\n=== CONVERSION REPORT ===\n')

console.log(`Created: ${report.created.length} skills`)
for (const s of report.created) {
  console.log(`  + [${s.plugin}] ${s.name}`)
}

console.log(`\nSkipped: ${report.skipped.length} skill-delegate commands (delete these)`)
for (const s of report.skipped) {
  console.log(`  - [${s.plugin}] ${s.name}`)
}

if (report.errors.length > 0) {
  console.log(`\nErrors: ${report.errors.length}`)
  for (const e of report.errors) {
    console.log(`  ! [${e.plugin}] ${e.name}: ${e.error}`)
  }
}

console.log(`\n${DRY_RUN ? '(DRY RUN — no files written)' : 'Done!'}`)
