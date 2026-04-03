import fs from 'fs'
import path from 'path'
import os from 'os'

/**
 * Fractary Core plugin for OpenCode.
 *
 * Registers skill directories so OpenCode discovers all Fractary skills,
 * and injects a system-level note about CLI availability.
 *
 * Skills are found in order of preference:
 *   1. Local monorepo (plugins/core/.claude-plugin exists in ancestor dir)
 *   2. Claude marketplace install (~/.claude/plugins/marketplaces/fractary-core)
 */

const PLUGIN_NAMES = ['core', 'repo', 'work', 'file', 'logs', 'docs']
const MARKETPLACE_PATH = path.join(
  os.homedir(),
  '.claude',
  'plugins',
  'marketplaces',
  'fractary-core',
)

export const FractaryCorePlugin = async ({ directory }) => {
  const pluginRoot = findPluginRoot(directory)

  return {
    config: async (config) => {
      config.skills = config.skills || {}
      config.skills.paths = config.skills.paths || []

      for (const name of PLUGIN_NAMES) {
        const skillsDir = path.join(pluginRoot, 'plugins', name, 'skills')
        if (fs.existsSync(skillsDir)) {
          config.skills.paths.push(skillsDir)
        }
      }
    },

    'experimental.chat.system.transform': async (_input, output) => {
      output.system.push(
        [
          'You have access to the `fractary-core` CLI for repository operations,',
          'work/issue tracking, documentation, logging, and file storage.',
          'Fractary skills are loaded and available for reference.',
          'Configuration is at `.fractary/config.yaml`.',
          '',
          'Key CLI commands:',
          '- `fractary-core repo commit|push|branch-create|pr-create|pr-merge|pull`',
          '- `fractary-core work issue-create|issue-fetch|issue-list|issue-update|issue-search`',
          '- `fractary-core docs doc-create|doc-list|doc-get|doc-update|doc-search`',
          '- `fractary-core logs write|list|read|search|archive|analyze`',
          '- `fractary-core file upload|download|list|copy|move|delete`',
          '- `fractary-core config show|validate`',
          '',
          'Run `fractary-core --help` or `fractary-core <plugin> --help` for full usage.',
        ].join('\n'),
      )
    },
  }
}

/** Walk up from the working directory looking for the monorepo marker. */
function findMonorepoRoot(dir) {
  let current = dir
  while (current !== path.dirname(current)) {
    if (
      fs.existsSync(path.join(current, 'plugins', 'core', '.claude-plugin'))
    ) {
      return current
    }
    current = path.dirname(current)
  }
  return null
}

/**
 * Resolve the root directory containing the plugins/ tree.
 *
 * Prefers the local monorepo (developer working in fractary-core itself),
 * falls back to the Claude marketplace install path.
 */
function findPluginRoot(directory) {
  const monorepo = findMonorepoRoot(directory)
  if (monorepo) return monorepo

  if (fs.existsSync(path.join(MARKETPLACE_PATH, 'plugins', 'core'))) {
    return MARKETPLACE_PATH
  }

  return directory
}
