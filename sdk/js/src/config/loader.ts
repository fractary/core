/**
 * @fractary/core - Unified Configuration Loader
 *
 * Builds on yaml-config.ts to provide a unified configuration object
 * with integrated authentication support.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
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
import { findProjectRoot } from '../common/yaml-config';

/** Track whether loadEnv has been called */
let envLoaded = false;

/** Track the current environment name */
let currentEnv: string | undefined;

/**
 * Load environment variables from .env files with multi-environment support
 *
 * This function explicitly loads .env files - it must be called manually
 * rather than being a side effect of importing the module.
 *
 * ## Multi-Environment Support
 *
 * Set `FRACTARY_ENV` to load environment-specific .env files:
 * - `FRACTARY_ENV=staging` loads `.env.staging`
 * - `FRACTARY_ENV=production` loads `.env.production`
 *
 * Loading order (later files override earlier):
 * 1. `.env` - Base configuration (always loaded if exists)
 * 2. `.env.{FRACTARY_ENV}` - Environment-specific overrides
 * 3. `.env.local` - Local overrides (never committed, always loaded last)
 *
 * All files are optional. Missing files are silently skipped.
 *
 * ## File Locations
 *
 * Searches for .env files in:
 * 1. Current working directory
 * 2. Project root (directory containing .fractary or .git)
 *
 * @param options Loading options
 * @returns true if any .env file was loaded, false if no .env files found
 *
 * @example
 * ```typescript
 * import { loadEnv, loadConfig } from '@fractary/core';
 *
 * // Load default .env
 * loadEnv();
 *
 * // Or set environment before loading
 * process.env.FRACTARY_ENV = 'production';
 * loadEnv({ force: true });
 *
 * // From CLI: FRACTARY_ENV=production fractary-core:work issue-list
 * ```
 */
export function loadEnv(options: { cwd?: string; force?: boolean } = {}): boolean {
  const { cwd = process.cwd(), force = false } = options;

  // Skip if already loaded (unless force is true)
  if (envLoaded && !force) {
    return true;
  }

  // Determine project root
  let projectRoot: string;
  try {
    projectRoot = findProjectRoot(cwd);
  } catch {
    projectRoot = cwd;
  }

  // Get the target environment from FRACTARY_ENV
  const fractaryEnv = process.env.FRACTARY_ENV;
  currentEnv = fractaryEnv;

  // Build list of .env files to load (in order of priority, lowest first)
  // Later files override earlier ones
  const envFiles: string[] = [];

  // 1. Base .env file (always loaded first if exists)
  envFiles.push('.env');

  // 2. Environment-specific file (e.g., .env.staging, .env.production)
  if (fractaryEnv) {
    envFiles.push(`.env.${fractaryEnv}`);
  }

  // 3. Local overrides (never committed, highest priority)
  envFiles.push('.env.local');

  let anyLoaded = false;

  // Try loading from project root (preferred)
  for (const envFile of envFiles) {
    const envPath = path.join(projectRoot, envFile);
    if (fs.existsSync(envPath)) {
      // override: false means existing vars are NOT overwritten
      // We load in reverse priority order so this works correctly
      // Actually, we want later files to override, so we use override: true
      dotenv.config({ path: envPath, override: true });
      anyLoaded = true;
    }
  }

  // If project root didn't have .env files, try cwd as fallback
  if (!anyLoaded && cwd !== projectRoot) {
    for (const envFile of envFiles) {
      const envPath = path.join(cwd, envFile);
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: true });
        anyLoaded = true;
      }
    }
  }

  envLoaded = anyLoaded;
  return anyLoaded;
}

/**
 * Get the currently loaded environment name
 *
 * @returns The value of FRACTARY_ENV when loadEnv was called, or undefined
 */
export function getCurrentEnv(): string | undefined {
  return currentEnv;
}

/**
 * Switch to a different environment mid-session
 *
 * This function allows changing environments during a Claude session, which is
 * useful for workflows like FABR where you move through phases that target
 * different environments:
 *
 * - **Local/Dev**: Writing code, running local tests
 * - **Test**: Deploying during evaluate phase
 * - **Prod**: Deploying during release phase
 *
 * ## What It Does
 *
 * 1. Sets `process.env.FRACTARY_ENV` to the new environment
 * 2. Reloads environment variables in order: `.env` → `.env.{newEnv}` → `.env.local`
 * 3. Updates `getCurrentEnv()` to return the new environment
 *
 * ## Important Notes
 *
 * - Variables from the previous environment that aren't overwritten will persist
 * - To start fresh, call `clearEnv()` before `switchEnv()`
 * - The config.yaml is NOT reloaded automatically; credentials are resolved
 *   from process.env when API calls are made
 *
 * @param envName The environment to switch to (e.g., 'test', 'staging', 'prod')
 * @param options Optional settings
 * @returns true if the environment was switched successfully
 *
 * @example
 * ```typescript
 * import { switchEnv, getCurrentEnv } from '@fractary/core';
 *
 * // FABR Workflow Example
 *
 * // Frame & Architect phases - local development
 * console.log(getCurrentEnv()); // undefined or 'dev'
 *
 * // Build phase - still local
 * // ... build and test locally ...
 *
 * // Evaluate phase - switch to test environment
 * switchEnv('test');
 * console.log(getCurrentEnv()); // 'test'
 * // Now GITHUB_TOKEN, AWS_* etc. come from .env.test
 * // ... deploy to test, run integration tests ...
 *
 * // Release phase - switch to production
 * switchEnv('prod');
 * console.log(getCurrentEnv()); // 'prod'
 * // Now credentials come from .env.prod
 * // ... deploy to production ...
 * ```
 */
export function switchEnv(
  envName: string,
  options: { cwd?: string } = {}
): boolean {
  // Validate environment name
  if (!envName || typeof envName !== 'string') {
    console.warn('switchEnv: Invalid environment name provided');
    return false;
  }

  // Sanitize: only allow alphanumeric, dash, underscore
  if (!/^[a-zA-Z0-9_-]+$/.test(envName)) {
    console.warn(`switchEnv: Invalid characters in environment name: ${envName}`);
    return false;
  }

  // Set the new environment
  process.env.FRACTARY_ENV = envName;

  // Force reload environment variables
  const result = loadEnv({ cwd: options.cwd, force: true });

  if (result) {
    console.log(`Switched to environment: ${envName}`);
  } else {
    console.warn(`Switched to environment '${envName}' but no .env.${envName} file found`);
  }

  return true;
}

/**
 * Clear environment-specific variables and reset to base state
 *
 * This removes variables that were loaded from `.env.{FRACTARY_ENV}` files,
 * leaving only system environment variables and base `.env` values.
 *
 * Useful before `switchEnv()` if you want to ensure no variables from the
 * previous environment persist.
 *
 * @param variablesToClear Optional list of specific variables to clear.
 *                         If not provided, clears common Fractary variables.
 *
 * @example
 * ```typescript
 * // Clear before switching to ensure clean state
 * clearEnv();
 * switchEnv('prod');
 *
 * // Or clear specific variables
 * clearEnv(['GITHUB_TOKEN', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']);
 * ```
 */
export function clearEnv(variablesToClear?: string[]): void {
  const defaultVars = [
    'GITHUB_TOKEN',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_DEFAULT_REGION',
    'AWS_PROFILE',
    'JIRA_URL',
    'JIRA_EMAIL',
    'JIRA_TOKEN',
    'JIRA_PROJECT_KEY',
    'LINEAR_API_KEY',
    'LINEAR_TEAM_KEY',
  ];

  const toClear = variablesToClear || defaultVars;

  for (const varName of toClear) {
    delete process.env[varName];
  }

  // Reset internal state
  currentEnv = undefined;
  envLoaded = false;
}

/**
 * Check if environment variables have been loaded
 *
 * @returns true if loadEnv() has been called successfully
 */
export function isEnvLoaded(): boolean {
  return envLoaded;
}

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
  /** Skip auto-loading .env file (default: false - .env is loaded automatically) */
  skipEnvLoad?: boolean;
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
 * 1. Auto-loads .env files (unless skipEnvLoad is true)
 * 2. Loads and parses the YAML configuration
 * 3. Extracts GitHub configuration from handlers
 * 4. Creates a TokenProvider for authentication (if configured)
 * 5. Returns a unified config object
 *
 * Environment variables from .env files are loaded automatically by default,
 * so GITHUB_TOKEN and other secrets can be read from .env without manual sourcing.
 *
 * @param options Configuration loading options
 * @returns Loaded configuration with authentication
 *
 * @example
 * ```typescript
 * // .env is loaded automatically - GITHUB_TOKEN will be available
 * const config = await loadConfig();
 *
 * if (config.tokenProvider) {
 *   const token = await config.tokenProvider.getToken();
 *   // Use token for API calls
 * }
 * ```
 */
export async function loadConfig(options: LoadConfigOptions = {}): Promise<LoadedConfig> {
  const { skipAuth = false, skipEnvLoad = false, ...yamlOptions } = options;

  // Auto-load .env files by default (searches CWD and project root)
  if (!skipEnvLoad) {
    loadEnv({ cwd: yamlOptions.projectRoot });
  }

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
