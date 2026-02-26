import * as path from 'path';
import { getRemoteInfo } from './organization.js';
import { loadRepoConfig, expandTilde, applyPathPattern, WorktreeConfig } from './config.js';
import { execFileNoThrow } from '../common/exec-file-no-throw.js';

/**
 * Options for generating a worktree path
 */
export interface PathGenerationOptions {
  /** Work item ID (e.g., issue number) */
  workId: string;
  /** Organization name (auto-detected if not provided) */
  organization?: string;
  /** Project name (auto-detected if not provided) */
  project?: string;
  /** Custom path to use instead of generated path */
  customPath?: string;
  /** Worktree configuration (loaded if not provided) */
  config?: WorktreeConfig;
}

/**
 * Generate a worktree path from configuration
 *
 * Path generation logic:
 * 1. If customPath is provided, use it directly
 * 2. Load configuration (or use provided config)
 * 3. Resolve the worktree base location (relative to cwd or absolute)
 * 4. Generate the worktree name using the pathPattern with substitutions
 * 5. Return resolved absolute path
 *
 * @param cwd Current working directory (git repository root)
 * @param options Path generation options
 * @returns Absolute path to worktree directory
 *
 * @example
 * ```typescript
 * // Auto-detect organization and project
 * const worktreePath = await generateWorktreePath('/path/to/repo', { workId: '258' });
 * // Returns: /path/to/repo/.claude/worktrees/work-id-258
 *
 * // Custom path
 * const worktreePath = await generateWorktreePath('/path/to/repo', {
 *   workId: '258',
 *   customPath: '/custom/path'
 * });
 * // Returns: /custom/path
 * ```
 */
export async function generateWorktreePath(
  cwd: string,
  options: PathGenerationOptions
): Promise<string> {
  // Custom path takes precedence
  if (options.customPath) {
    return path.resolve(expandTilde(options.customPath));
  }

  // Load configuration
  const config = options.config || (await loadRepoConfig(cwd)).worktree;

  if (!config) {
    throw new Error('Worktree configuration not found');
  }

  // Extract organization and project if not provided
  let org = options.organization;
  let proj = options.project;

  if (!org || !proj) {
    const remoteInfo = await getRemoteInfo(cwd);
    org = org || remoteInfo?.organization || 'local';
    proj = proj || remoteInfo?.project || path.basename(cwd);
  }

  // Resolve worktree base location
  let location = expandTilde(config.defaultLocation);
  // Resolve relative paths against the project root (cwd)
  if (!path.isAbsolute(location)) {
    location = path.resolve(cwd, location);
  }

  const name = applyPathPattern(config.pathPattern, {
    organization: org,
    project: proj,
    'work-id': options.workId
  });

  return path.join(location, name);
}


/**
 * Find all existing worktrees for a repository
 *
 * @param cwd Current working directory (git repository root)
 * @returns Array of worktree paths
 */
export async function listWorktrees(cwd: string): Promise<string[]> {
  try {
    const result = await execFileNoThrow('git', ['worktree', 'list', '--porcelain'], { cwd });

    if (result.exitCode !== 0) {
      return [];
    }

    // Parse porcelain output
    const worktrees: string[] = [];
    const lines = result.stdout.split('\n');

    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        const worktreePath = line.substring('worktree '.length).trim();
        if (worktreePath) {
          worktrees.push(worktreePath);
        }
      }
    }

    return worktrees;
  } catch {
    return [];
  }
}

