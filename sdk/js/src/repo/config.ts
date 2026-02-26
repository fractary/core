import * as path from 'path';
import * as os from 'os';
import { loadYamlConfig, writeYamlConfig, RepoConfig as BaseRepoConfig, RepoWorktreeConfig } from '../common/yaml-config.js';

/**
 * Worktree configuration options (SDK runtime representation)
 *
 * Maps from config.yaml's repo.worktree section into SDK-friendly fields.
 */
export interface WorktreeConfig {
  /** Base directory for worktrees (relative to project root or absolute) */
  defaultLocation: string;
  /** Path pattern template for work-item worktrees (e.g., "work-id-{work-id}") */
  pathPattern: string;
}

/**
 * Extended repository configuration with worktree support
 */
export interface RepoConfigExtended extends BaseRepoConfig {
  worktree?: WorktreeConfig;
}

/**
 * Default worktree location relative to project root.
 * Matches the Claude Code convention of .claude/worktrees/.
 */
const DEFAULT_WORKTREE_LOCATION = '.claude/worktrees';

/**
 * Default path pattern for work-item worktrees.
 * Produces directories like: work-id-258
 */
const DEFAULT_WORKTREE_PATH_PATTERN = 'work-id-{work-id}';

/**
 * Get default worktree configuration
 *
 * Uses .claude/worktrees as the base location (inside the project)
 * and work-id-{work-id} as the naming pattern for work-item worktrees.
 *
 * @returns Default worktree configuration
 */
export function getDefaultWorktreeConfig(): WorktreeConfig {
  return {
    defaultLocation: DEFAULT_WORKTREE_LOCATION,
    pathPattern: DEFAULT_WORKTREE_PATH_PATTERN,
  };
}

/**
 * Convert a RepoWorktreeConfig (from YAML) into a WorktreeConfig (SDK runtime)
 *
 * @param yamlWorktree The worktree section from config.yaml
 * @returns WorktreeConfig with SDK-friendly fields
 */
function fromYamlWorktreeConfig(yamlWorktree: RepoWorktreeConfig): WorktreeConfig {
  return {
    defaultLocation: yamlWorktree.location || DEFAULT_WORKTREE_LOCATION,
    pathPattern: yamlWorktree.naming?.with_work_id
      ? yamlWorktree.naming.with_work_id.replace('{id}', '{work-id}')
      : DEFAULT_WORKTREE_PATH_PATTERN,
  };
}

/**
 * Load repository configuration with worktree support
 *
 * Loads from `.fractary/config.yaml` and returns the repo section
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
      // Convert YAML worktree config to SDK format, merge with defaults
      const yamlWorktree = yamlConfig.repo.worktree as RepoWorktreeConfig | undefined;
      const worktreeConfig = yamlWorktree
        ? fromYamlWorktreeConfig(yamlWorktree)
        : getDefaultWorktreeConfig();

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
 * Saves to `.fractary/config.yaml`, merging with existing configuration.
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
 *     defaultLocation: '.claude/worktrees',
 *     pathPattern: 'work-id-{work-id}',
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
