/**
 * @fractary/core - Manager Factories
 *
 * Factory functions for creating authenticated managers.
 * Provides a convenient way to create WorkManager and RepoManager
 * with automatic configuration loading and authentication.
 */

import { WorkManager } from './work';
import { RepoManager } from './repo';
import { loadConfig, LoadedConfig } from './config/loader';
import type { WorkConfig, RepoConfig, EnvironmentBranchConfig } from './common/types';
import { ConfigurationError } from './common/errors';

/** Regex pattern for valid GitHub owner/repo format */
const PROJECT_FORMAT_REGEX = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

/**
 * Validate and parse project string into owner/repo
 *
 * @param project Project string in "owner/repo" format
 * @returns Tuple of [owner, repo] or null if invalid
 * @throws ConfigurationError if format is invalid
 */
function parseProject(project: string): [string, string] {
  if (!project || typeof project !== 'string') {
    throw new ConfigurationError(
      'Invalid project configuration: project must be a non-empty string',
      { project }
    );
  }

  const trimmed = project.trim();

  if (!PROJECT_FORMAT_REGEX.test(trimmed)) {
    throw new ConfigurationError(
      `Invalid project format: "${project}". Expected "owner/repo" format (e.g., "fractary/core")`,
      { project }
    );
  }

  const parts = trimmed.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new ConfigurationError(
      `Invalid project format: "${project}". Expected exactly one "/" separator`,
      { project }
    );
  }

  return [parts[0], parts[1]];
}

/**
 * Options for creating managers
 */
export interface CreateManagerOptions {
  /** Pre-loaded configuration (optional - will load if not provided) */
  config?: LoadedConfig;
  /** Working directory for repository operations */
  cwd?: string;
  /** Skip authentication (use existing gh CLI auth instead) */
  skipAuth?: boolean;
}

/**
 * Build WorkConfig from LoadedConfig
 *
 * @param config Loaded configuration
 * @param token Token from token provider (if available)
 * @returns WorkConfig for WorkManager
 * @throws ConfigurationError if project format is invalid
 */
function buildWorkConfig(config: LoadedConfig, token?: string): WorkConfig {
  // Get platform from work config or default to github
  const workConfig = config.work;
  const activeHandler = workConfig?.active_handler || 'github';

  // Map active_handler to platform
  const platform = activeHandler as WorkConfig['platform'];

  // Get handler-specific config
  const handlerConfig = workConfig?.handlers?.[activeHandler] || {};

  // Extract owner/repo from project string if needed
  let owner = handlerConfig.owner;
  let repo = handlerConfig.repo;
  const project = handlerConfig.project || config.github?.project;

  // Parse and validate project format if we need to extract owner/repo
  if (!owner && !repo && project) {
    [owner, repo] = parseProject(project);
  }

  return {
    platform,
    owner,
    repo,
    project: project,
    token: token || handlerConfig.token || config.github?.token,
  };
}

/**
 * Build RepoConfig from LoadedConfig
 *
 * @param config Loaded configuration
 * @param token Token from token provider (if available)
 * @returns RepoConfig for RepoManager
 * @throws ConfigurationError if project format is invalid
 */
function buildRepoConfig(config: LoadedConfig, token?: string): RepoConfig {
  // Get platform from repo config or default to github
  const repoConfig = config.repo;
  const activeHandler = repoConfig?.active_handler || 'github';

  // Map active_handler to platform
  const platform = activeHandler as RepoConfig['platform'];

  // Get handler-specific config
  const handlerConfig = repoConfig?.handlers?.[activeHandler] || {};

  // Get defaults
  const defaults = repoConfig?.defaults || {};

  // Extract owner/repo from project string if needed
  let owner = handlerConfig.owner;
  let repo = handlerConfig.repo;
  const project = handlerConfig.project || config.github?.project;

  // Parse and validate project format if we need to extract owner/repo
  if (!owner && !repo && project) {
    [owner, repo] = parseProject(project);
  }

  // Convert environments from snake_case config to camelCase runtime format
  let environments: Record<string, EnvironmentBranchConfig> | undefined;
  if (defaults.environments && typeof defaults.environments === 'object') {
    environments = {};
    for (const [envId, envConfig] of Object.entries(defaults.environments)) {
      if (envConfig && typeof envConfig === 'object' && 'branch' in envConfig) {
        const env = envConfig as { branch: string; protected?: boolean; deploy_target?: string };
        environments[envId] = {
          branch: env.branch,
          protected: env.protected,
          deployTarget: env.deploy_target,
        };
      }
    }
    if (Object.keys(environments).length === 0) {
      environments = undefined;
    }
  }

  const defaultEnvironment = defaults.default_environment as string | undefined;

  // Resolve defaultBranch: environments config takes priority, then legacy fields
  let defaultBranch = defaults.default_branch || handlerConfig.default_branch;
  if (environments && defaultEnvironment && environments[defaultEnvironment]?.branch) {
    defaultBranch = environments[defaultEnvironment].branch;
  }

  return {
    platform,
    owner,
    repo,
    defaultBranch,
    environments,
    defaultEnvironment,
    token: token || handlerConfig.token || config.github?.token,
    branchPrefixes: defaults.branch_naming?.prefixes,
  };
}

/**
 * Create an authenticated WorkManager
 *
 * Loads configuration automatically and creates a WorkManager
 * with proper authentication.
 *
 * @param options Creation options
 * @returns Configured WorkManager instance
 *
 * @example
 * ```typescript
 * // Simple usage - auto-loads config and auth
 * const workManager = await createWorkManager();
 * const issues = await workManager.searchIssues('bug');
 *
 * // With pre-loaded config
 * const config = await loadConfig();
 * const workManager = await createWorkManager({ config });
 * ```
 */
export async function createWorkManager(
  options: CreateManagerOptions = {}
): Promise<WorkManager> {
  const { config: providedConfig, skipAuth = false } = options;

  // Load config if not provided
  const config = providedConfig || await loadConfig({ skipAuth });

  // Get token from provider if available
  let token: string | undefined;
  if (!skipAuth && config.tokenProvider) {
    try {
      token = await config.tokenProvider.getToken();
    } catch {
      // Token provider failed - continue without token
      // The manager will fall back to gh CLI auth
    }
  }

  // Build WorkConfig
  const workConfig = buildWorkConfig(config, token);

  return new WorkManager(workConfig);
}

/**
 * Create an authenticated RepoManager
 *
 * Loads configuration automatically and creates a RepoManager
 * with proper authentication.
 *
 * @param options Creation options
 * @returns Configured RepoManager instance
 *
 * @example
 * ```typescript
 * // Simple usage - auto-loads config and auth
 * const repoManager = await createRepoManager();
 * const status = repoManager.getStatus();
 *
 * // With explicit working directory
 * const repoManager = await createRepoManager({ cwd: '/path/to/repo' });
 *
 * // With pre-loaded config
 * const config = await loadConfig();
 * const repoManager = await createRepoManager({ config });
 * ```
 */
export async function createRepoManager(
  options: CreateManagerOptions = {}
): Promise<RepoManager> {
  const { config: providedConfig, cwd, skipAuth = false } = options;

  // Load config if not provided
  const config = providedConfig || await loadConfig({ skipAuth });

  // Get token from provider if available
  let token: string | undefined;
  if (!skipAuth && config.tokenProvider) {
    try {
      token = await config.tokenProvider.getToken();
    } catch {
      // Token provider failed - continue without token
      // The manager will fall back to gh CLI auth
    }
  }

  // Build RepoConfig
  const repoConfig = buildRepoConfig(config, token);

  return new RepoManager(repoConfig, cwd);
}

/**
 * Create both WorkManager and RepoManager with shared config
 *
 * Useful when you need both managers and want to share
 * configuration and authentication.
 *
 * @param options Creation options
 * @returns Object with both managers
 *
 * @example
 * ```typescript
 * const { work, repo } = await createManagers();
 *
 * // Fetch issue and create branch
 * const issue = await work.fetchIssue(123);
 * await repo.createBranch(`feature/${issue.number}-${slug(issue.title)}`);
 * ```
 */
export async function createManagers(
  options: CreateManagerOptions = {}
): Promise<{ work: WorkManager; repo: RepoManager }> {
  const { config: providedConfig, cwd, skipAuth = false } = options;

  // Load config once
  const config = providedConfig || await loadConfig({ skipAuth });

  // Get token once
  let token: string | undefined;
  if (!skipAuth && config.tokenProvider) {
    try {
      token = await config.tokenProvider.getToken();
    } catch {
      // Token provider failed - continue without token
    }
  }

  // Build configs
  const workConfig = buildWorkConfig(config, token);
  const repoConfig = buildRepoConfig(config, token);

  return {
    work: new WorkManager(workConfig),
    repo: new RepoManager(repoConfig, cwd),
  };
}
