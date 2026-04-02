import fs from 'fs'
import path from 'path'

/**
 * Fractary Core plugin for OpenCode.
 *
 * Registers skill directories so OpenCode discovers all Fractary skills,
 * and injects a system-level note about CLI availability.
 */
export const FractaryCorePlugin = async ({ directory }) => {
  const pluginRoot = findPluginRoot(directory)
  const pluginNames = ['core', 'repo', 'work', 'file', 'logs', 'docs']

  return {
    config: async (config) => {
      // Register each plugin's skills directory for auto-discovery
      for (const name of pluginNames) {
        const skillsDir = path.join(pluginRoot, 'plugins', name, 'skills')
        if (fs.existsSync(skillsDir)) {
          config.instructions = config.instructions || []
          if (Array.isArray(config.instructions)) {
            config.instructions.push(skillsDir)
          }
        }
      }
    },

    'experimental.chat.system.transform': async (_input, output) => {
      output.system.push([
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
      ].join('\n'))
    },
  }
}

function findPluginRoot(dir) {
  let current = dir
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'plugins', 'core', '.claude-plugin'))) {
      return current
    }
    current = path.dirname(current)
  }
  return dir
}
