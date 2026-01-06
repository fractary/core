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
 * Generate a worktree path following SPEC-00030 pattern
 *
 * Path generation logic:
 * 1. If customPath is provided, use it directly
 * 2. Load configuration (or use provided config)
 * 3. Extract organization and project from git remote (if not provided)
 * 4. Generate path using SPEC-00030 pattern: `{defaultLocation}/{org}-{project}-{workId}`
 * 5. Return resolved absolute path
 *
 * @param cwd Current working directory (git repository root)
 * @param options Path generation options
 * @returns Absolute path to worktree directory
 *
 * @example
 * ```typescript
 * // Auto-detect organization and project
 * const path = await generateWorktreePath('/path/to/repo', { workId: '258' });
 * // Returns: /home/user/.claude-worktrees/fractary-core-258
 *
 * // Custom path
 * const path = await generateWorktreePath('/path/to/repo', {
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

  // Generate path using SPEC-00030 pattern
  const location = expandTilde(config.defaultLocation);
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

