import * as path from 'path';
import * as os from 'os';
import { loadYamlConfig, writeYamlConfig, RepoConfig as BaseRepoConfig } from '../common/yaml-config.js';

/**
 * Worktree configuration options
 */
export interface WorktreeConfig {
  /** Default location for worktrees (e.g., "~/.claude-worktrees/") */
  defaultLocation: string;
  /** Path pattern template (e.g., "{organization}-{project}-{work-id}") */
  pathPattern: string;
}

/**
 * Extended repository configuration with worktree support
 */
export interface RepoConfigExtended extends BaseRepoConfig {
  worktree?: WorktreeConfig;
}

/**
 * Get default worktree configuration
 *
 * @returns Default worktree configuration with SPEC-00030 path pattern
 */
export function getDefaultWorktreeConfig(): WorktreeConfig {
  return {
    defaultLocation: path.join(os.homedir(), '.claude-worktrees'),
    pathPattern: '{organization}-{project}-{work-id}'
  };
}

/**
 * Load repository configuration with worktree support
 *
 * Loads from `.fractary/core/config.yaml` and returns the repo section
 * with worktree configuration. Falls back to defaults if not configured.
 *
 * @param cwd Working directory to start searching for config (default: process.cwd())
 * @returns Repository configuration with worktree settings
 *
 * @example
 * ```typescript
 * const config = await loadRepoConfig('/path/to/project');
 * const worktreePath = config.worktree.defaultLocation;
 * ```
 */
export async function loadRepoConfig(cwd: string = process.cwd()): Promise<RepoConfigExtended> {
  try {
    const yamlConfig = loadYamlConfig({ projectRoot: cwd });

    if (yamlConfig?.repo) {
      // Merge with defaults to ensure all fields are present
      const worktreeConfig = {
        ...getDefaultWorktreeConfig(),
        ...(yamlConfig.repo as RepoConfigExtended).worktree
      };

      return {
        ...yamlConfig.repo,
        worktree: worktreeConfig
      } as RepoConfigExtended;
    }
  } catch (error) {
    // Config doesn't exist or is invalid, use defaults
  }

  // Return default configuration
  return {
    active_handler: 'github',
    handlers: {},
    worktree: getDefaultWorktreeConfig()
  };
}

/**
 * Save repository configuration with worktree support
 *
 * Saves to `.fractary/core/config.yaml`, merging with existing configuration.
 *
 * @param cwd Working directory to save config to
 * @param config Repository configuration to save
 *
 * @example
 * ```typescript
 * await saveRepoConfig('/path/to/project', {
 *   active_handler: 'github',
 *   handlers: {},
 *   worktree: {
 *     defaultLocation: '~/my-worktrees',
 *     pathPattern: '{organization}-{project}-{work-id}',
 *     legacySupport: true,
 *     autoMigrate: false
 *   }
 * });
 * ```
 */
export async function saveRepoConfig(cwd: string, config: RepoConfigExtended): Promise<void> {
  // Load existing config to preserve other plugin settings
  let yamlConfig = loadYamlConfig({ projectRoot: cwd });

  if (!yamlConfig) {
    // Create minimal config structure if doesn't exist
    yamlConfig = {
      version: '2.0'
    };
  }

  // Update repo section
  yamlConfig.repo = config;

  // Write back to file
  writeYamlConfig(yamlConfig, cwd);
}

/**
 * Expand tilde (~) in paths to home directory
 *
 * @param filePath Path that may contain tilde prefix
 * @returns Expanded absolute path
 *
 * @example
 * ```typescript
 * expandTilde('~/worktrees') // Returns '/Users/username/worktrees'
 * expandTilde('/absolute/path') // Returns '/absolute/path'
 * ```
 */
export function expandTilde(filePath: string): string {
  if (filePath.startsWith('~/') || filePath === '~') {
    return path.join(os.homedir(), filePath.slice(1));
  }
  return filePath;
}

/**
 * Apply a path pattern template with substitutions
 *
 * Replaces placeholders in the pattern:
 * - {organization} → organization name
 * - {project} → project name
 * - {work-id} → work item ID
 *
 * @param pattern Path pattern template
 * @param substitutions Values to substitute
 * @returns Path with substitutions applied
 *
 * @example
 * ```typescript
 * applyPathPattern('{organization}-{project}-{work-id}', {
 *   organization: 'fractary',
 *   project: 'core',
 *   'work-id': '258'
 * });
 * // Returns 'fractary-core-258'
 * ```
 */
export function applyPathPattern(
  pattern: string,
  substitutions: Record<string, string>
): string {
  let result = pattern;

  for (const [key, value] of Object.entries(substitutions)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  }

  return result;
}

/**
 * Validate that a path pattern contains all required placeholders
 *
 * @param pattern Path pattern to validate
 * @param requiredPlaceholders Required placeholder names
 * @returns Array of missing placeholder names (empty if valid)
 *
 * @example
 * ```typescript
 * validatePathPattern('{organization}-{project}', ['organization', 'project', 'work-id']);
 * // Returns ['work-id']
 * ```
 */
export function validatePathPattern(
  pattern: string,
  requiredPlaceholders: string[]
): string[] {
  const missing: string[] = [];

  for (const placeholder of requiredPlaceholders) {
    if (!pattern.includes(`{${placeholder}}`)) {
      missing.push(placeholder);
    }
  }

  return missing;
}
