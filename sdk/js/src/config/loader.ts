/**
 * @fractary/core - Unified Configuration Loader
 *
 * Builds on yaml-config.ts to provide a unified configuration object
 * with integrated authentication support.
 */

import {
  loadYamlConfig,
  CoreYamlConfig,
  ConfigLoadOptions,
  WorkConfig,
  RepoConfig,
  LogsConfig,
  FileConfig,
  SpecConfig,
  DocsConfig,
  CodexConfig,
} from '../common/yaml-config';
import type { TokenProvider, GitHubConfig, GitHubAppConfig } from '../auth/types';
import { createTokenProvider } from '../auth';

/**
 * GitHub configuration extracted from yaml config
 */
export interface ExtractedGitHubConfig {
  /** Personal access token (from handlers.github.token or environment) */
  token?: string;
  /** GitHub organization name */
  organization?: string;
  /** GitHub project (owner/repo format) */
  project?: string;
  /** GitHub App configuration */
  app?: GitHubAppConfig;
}

/**
 * Loaded configuration with authentication
 *
 * Extends the raw YAML configuration with computed authentication.
 */
export interface LoadedConfig {
  /** Raw configuration version */
  version: string;

  /** GitHub configuration extracted from work/repo handlers */
  github?: ExtractedGitHubConfig;

  /** Token provider for GitHub authentication (if configured) */
  tokenProvider?: TokenProvider;

  /** Work tracking configuration */
  work?: WorkConfig;

  /** Repository management configuration */
  repo?: RepoConfig;

  /** Logs management configuration */
  logs?: LogsConfig;

  /** File storage configuration */
  file?: FileConfig;

  /** Specification management configuration */
  spec?: SpecConfig;

  /** Documentation management configuration */
  docs?: DocsConfig;

  /** Codex configuration */
  codex?: CodexConfig;

  /** Raw configuration (for advanced use cases) */
  raw: CoreYamlConfig;
}

/**
 * Configuration loader options
 */
export interface LoadConfigOptions extends ConfigLoadOptions {
  /** Skip creating token provider (useful for non-GitHub operations) */
  skipAuth?: boolean;
}

/**
 * Extract GitHub configuration from yaml config
 *
 * Looks for GitHub configuration in:
 * 1. work.handlers.github
 * 2. repo.handlers.github
 *
 * @param config Raw yaml configuration
 * @returns Extracted GitHub configuration or undefined
 */
function extractGitHubConfig(config: CoreYamlConfig): ExtractedGitHubConfig | undefined {
  // Try work handlers first
  const workGithub = config.work?.handlers?.github;
  const repoGithub = config.repo?.handlers?.github;

  // Merge configurations (work takes priority for auth, repo for project info)
  const github: ExtractedGitHubConfig = {};
  let hasConfig = false;

  // Extract token
  if (workGithub?.token) {
    github.token = workGithub.token;
    hasConfig = true;
  } else if (repoGithub?.token) {
    github.token = repoGithub.token;
    hasConfig = true;
  }

  // Extract organization
  if (workGithub?.organization) {
    github.organization = workGithub.organization;
    hasConfig = true;
  } else if (repoGithub?.organization) {
    github.organization = repoGithub.organization;
    hasConfig = true;
  }

  // Extract project (owner/repo)
  if (workGithub?.project) {
    github.project = workGithub.project;
    hasConfig = true;
  } else if (repoGithub?.project) {
    github.project = repoGithub.project;
    hasConfig = true;
  } else if (workGithub?.owner && workGithub?.repo) {
    github.project = `${workGithub.owner}/${workGithub.repo}`;
    hasConfig = true;
  } else if (repoGithub?.owner && repoGithub?.repo) {
    github.project = `${repoGithub.owner}/${repoGithub.repo}`;
    hasConfig = true;
  }

  // Extract GitHub App config
  const appConfig = workGithub?.app || repoGithub?.app;
  if (appConfig?.id && appConfig?.installation_id) {
    github.app = {
      id: String(appConfig.id),
      installation_id: String(appConfig.installation_id),
      private_key_path: appConfig.private_key_path,
      private_key_env_var: appConfig.private_key_env_var,
    };
    hasConfig = true;
  }

  return hasConfig ? github : undefined;
}

/**
 * Load unified configuration with authentication
 *
 * This function:
 * 1. Loads and parses the YAML configuration
 * 2. Extracts GitHub configuration from handlers
 * 3. Creates a TokenProvider for authentication (if configured)
 * 4. Returns a unified config object
 *
 * Note: dotenv should be imported at the entry point, so environment
 * variables are already loaded when this function is called.
 *
 * @param options Configuration loading options
 * @returns Loaded configuration with authentication
 *
 * @example
 * ```typescript
 * const config = await loadConfig();
 *
 * if (config.tokenProvider) {
 *   const token = await config.tokenProvider.getToken();
 *   // Use token for API calls
 * }
 * ```
 */
export async function loadConfig(options: LoadConfigOptions = {}): Promise<LoadedConfig> {
  const { skipAuth = false, ...yamlOptions } = options;

  // Load raw YAML configuration
  const raw = loadYamlConfig(yamlOptions);

  // Handle case where config file doesn't exist
  if (!raw) {
    return {
      version: '0.0.0',
      raw: { version: '0.0.0' },
    };
  }

  // Extract GitHub configuration
  const github = extractGitHubConfig(raw);

  // Create token provider (unless skipped)
  let tokenProvider: TokenProvider | undefined;
  if (!skipAuth && github) {
    try {
      const githubConfig: GitHubConfig = {
        token: github.token,
        organization: github.organization,
        project: github.project,
        app: github.app,
      };
      tokenProvider = createTokenProvider(githubConfig);
    } catch {
      // Token provider creation failed - that's okay, it's optional
      // The user might not have configured authentication yet
    }
  }

  return {
    version: raw.version || '0.0.0',
    github,
    tokenProvider,
    work: raw.work,
    repo: raw.repo,
    logs: raw.logs,
    file: raw.file,
    spec: raw.spec,
    docs: raw.docs,
    codex: raw.codex,
    raw,
  };
}

/**
 * Load configuration synchronously (without token provider)
 *
 * Useful for cases where you only need the configuration data
 * without authentication.
 *
 * @param options Configuration loading options
 * @returns Loaded configuration without token provider
 */
export function loadConfigSync(options: ConfigLoadOptions = {}): Omit<LoadedConfig, 'tokenProvider'> {
  const raw = loadYamlConfig(options);

  if (!raw) {
    return {
      version: '0.0.0',
      raw: { version: '0.0.0' },
    };
  }

  const github = extractGitHubConfig(raw);

  return {
    version: raw.version || '0.0.0',
    github,
    work: raw.work,
    repo: raw.repo,
    logs: raw.logs,
    file: raw.file,
    spec: raw.spec,
    docs: raw.docs,
    codex: raw.codex,
    raw,
  };
}
