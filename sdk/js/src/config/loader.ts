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
  DocsConfig,
  CodexConfig,
} from '../common/yaml-config';
import type { TokenProvider, GitHubConfig, GitHubAppConfig } from '../auth/types';
import { createTokenProvider } from '../auth';
import { findProjectRoot } from '../common/yaml-config';

/**
 * Track whether loadEnv has been called.
 * Note: Module-level state is not thread-safe. For concurrent usage,
 * call loadEnv() once during application initialization.
 */
let envLoaded = false;

/**
 * Track the current environment name (value of FRACTARY_ENV when loadEnv was called).
 * Note: Module-level state is not thread-safe.
 */
let currentEnv: string | undefined;

/**
 * Track whether the deprecation warning for root-level .env files has been shown.
 * Fires once per session, not per file.
 */
let deprecationWarned = false;

// ─── Env Directory Utilities ────────────────────────────────────────────────

/**
 * Get the canonical env directory path (.fractary/env/)
 *
 * @param projectRoot Project root directory. If not provided, auto-detected.
 * @returns Absolute path to .fractary/env/
 */
export function getEnvDir(projectRoot?: string): string {
  const root = projectRoot || findProjectRoot();
  return path.join(root, '.fractary', 'env');
}

/**
 * Ensure .fractary/env/ directory exists, creating it if needed.
 *
 * @param projectRoot Project root directory. If not provided, auto-detected.
 * @returns Absolute path to the created/existing .fractary/env/ directory
 */
export function ensureEnvDir(projectRoot?: string): string {
  const envDir = getEnvDir(projectRoot);
  if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir, { recursive: true });
  }
  return envDir;
}

/**
 * Information about an env file found in the project.
 */
export interface EnvFileInfo {
  /** Human-readable name, e.g., "(default)", "test", "prod", "local" */
  name: string;
  /** Relative file path, e.g., ".fractary/env/.env.test" */
  file: string;
  /** Whether this file is in the standard (.fractary/env/) or legacy (root) location */
  location: 'standard' | 'legacy';
  /** Whether the file actually exists on disk */
  exists: boolean;
}

/**
 * Extract the environment name from an env file basename.
 */
function envFileName(basename: string): string {
  if (basename === '.env') return '(default)';
  if (basename === '.env.local') return 'local';
  return basename.replace('.env.', '');
}

/**
 * List all env files across .fractary/env/ (standard) and project root (legacy).
 *
 * Standard-location files take precedence over legacy when both exist
 * for the same base name (deduplication).
 *
 * @param projectRoot Project root directory. If not provided, auto-detected.
 * @returns Array of EnvFileInfo sorted by name
 */
export function listEnvFiles(projectRoot?: string): EnvFileInfo[] {
  const root = projectRoot || findProjectRoot();
  const envDir = getEnvDir(root);
  const seen = new Map<string, EnvFileInfo>();

  // 1. Scan .fractary/env/ (standard location)
  if (fs.existsSync(envDir)) {
    const files = fs.readdirSync(envDir).filter(
      (f) => f.startsWith('.env') && f !== '.env.example'
    );
    for (const file of files) {
      const name = envFileName(file);
      seen.set(file, {
        name,
        file: path.join('.fractary', 'env', file),
        location: 'standard',
        exists: true,
      });
    }
  }

  // 2. Scan project root (legacy location)
  if (fs.existsSync(root)) {
    const files = fs.readdirSync(root).filter(
      (f) => f.startsWith('.env') && f !== '.env.example'
    );
    for (const file of files) {
      // Standard wins over legacy (skip duplicates)
      if (seen.has(file)) continue;
      const name = envFileName(file);
      seen.set(file, {
        name,
        file,
        location: 'legacy',
        exists: true,
      });
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Resolve a specific env file path, checking .fractary/env/ first, then project root.
 *
 * @param fileName The env file name, e.g. ".env", ".env.test", ".env.local"
 * @param projectRoot Project root directory. If not provided, auto-detected.
 * @returns Object with path and location, or null if not found anywhere
 */
export function resolveEnvFile(
  fileName: string,
  projectRoot?: string
): { path: string; location: 'standard' | 'legacy' } | null {
  const root = projectRoot || findProjectRoot();

  // Try .fractary/env/ first (standard)
  const standardPath = path.join(root, '.fractary', 'env', fileName);
  if (fs.existsSync(standardPath)) {
    return { path: standardPath, location: 'standard' };
  }

  // Fallback to project root (legacy)
  const legacyPath = path.join(root, fileName);
  if (fs.existsSync(legacyPath)) {
    return { path: legacyPath, location: 'legacy' };
  }

  return null;
}

// ─── Managed Section Utilities ──────────────────────────────────────────────

/**
 * Read a plugin's managed section from an env file.
 *
 * Section markers:
 * ```
 * # ===== {pluginName} (managed) =====
 * KEY=VALUE
 * # ===== end {pluginName} =====
 * ```
 *
 * @param filePath Absolute path to the env file
 * @param pluginName Plugin name, e.g. "fractary-core"
 * @returns Key-value pairs within the section, or null if section not found
 */
export function readManagedSection(
  filePath: string,
  pluginName: string
): Record<string, string> | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const startMarker = `# ===== ${pluginName} (managed) =====`;
  const endMarker = `# ===== end ${pluginName} =====`;

  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return null;

  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx === -1) return null;

  const sectionContent = content.substring(startIdx + startMarker.length, endIdx);
  const result: Record<string, string> = {};

  for (const line of sectionContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();
      result[key] = value;
    }
  }

  return result;
}

/**
 * Write/update a plugin's managed section in an env file.
 *
 * Creates the file if it doesn't exist. Preserves all other sections and
 * content outside managed sections.
 *
 * If the plugin's section already exists, replaces content between markers.
 * Otherwise, appends a new section at the end.
 *
 * @param filePath Absolute path to the env file
 * @param pluginName Plugin name, e.g. "fractary-core"
 * @param entries Key-value pairs to write in the section
 */
export function writeManagedSection(
  filePath: string,
  pluginName: string,
  entries: Record<string, string>
): void {
  const startMarker = `# ===== ${pluginName} (managed) =====`;
  const endMarker = `# ===== end ${pluginName} =====`;

  // Build section content
  const lines: string[] = [];
  for (const [key, value] of Object.entries(entries)) {
    lines.push(`${key}=${value}`);
  }
  const sectionBlock = `${startMarker}\n${lines.join('\n')}\n${endMarker}`;

  // Ensure parent directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    // Create new file with just this section
    fs.writeFileSync(filePath, sectionBlock + '\n', 'utf-8');
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const startIdx = content.indexOf(startMarker);

  if (startIdx === -1) {
    // Section doesn't exist — append at end
    const separator = content.length > 0 && !content.endsWith('\n') ? '\n\n' :
      content.length > 0 ? '\n' : '';
    fs.writeFileSync(filePath, content + separator + sectionBlock + '\n', 'utf-8');
    return;
  }

  // Section exists — replace content between markers
  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx === -1) {
    // Malformed: start marker without end marker — append end and replace
    const before = content.substring(0, startIdx);
    const after = content.substring(startIdx + startMarker.length);
    fs.writeFileSync(filePath, before + sectionBlock + after + '\n', 'utf-8');
    return;
  }

  const before = content.substring(0, startIdx);
  const after = content.substring(endIdx + endMarker.length);
  fs.writeFileSync(filePath, before + sectionBlock + after, 'utf-8');
}

// ─── Environment Loading ────────────────────────────────────────────────────

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
 * ## File Locations (per file, checked in order)
 *
 * 1. `.fractary/env/<file>` — standard location (preferred)
 * 2. `<projectRoot>/<file>` — legacy fallback (with deprecation warning)
 * 3. `<cwd>/<file>` — if cwd differs from projectRoot
 *
 * Each file is resolved independently, so `.fractary/env/.env` can coexist
 * with a legacy `<root>/.env.prod`.
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

  // For each env file, resolve independently:
  //   1. .fractary/env/<file>  (standard)
  //   2. <projectRoot>/<file>  (legacy, with deprecation warning)
  //   3. <cwd>/<file>          (if cwd != projectRoot)
  for (const envFile of envFiles) {
    // Try standard location first
    const standardPath = path.join(projectRoot, '.fractary', 'env', envFile);
    if (fs.existsSync(standardPath)) {
      dotenv.config({ path: standardPath, override: true });
      anyLoaded = true;
      continue;
    }

    // Fallback to project root (legacy)
    const rootPath = path.join(projectRoot, envFile);
    if (fs.existsSync(rootPath)) {
      if (!deprecationWarned) {
        console.warn(
          `[fractary] Deprecation: Loading ${envFile} from project root. ` +
          `Move env files to .fractary/env/ for the standard location.`
        );
        deprecationWarned = true;
      }
      dotenv.config({ path: rootPath, override: true });
      anyLoaded = true;
      continue;
    }

    // Fallback to cwd if different from projectRoot
    if (cwd !== projectRoot) {
      const cwdPath = path.join(cwd, envFile);
      if (fs.existsSync(cwdPath)) {
        dotenv.config({ path: cwdPath, override: true });
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
    console.warn(`Switched to environment '${envName}' but no .env.${envName} file found in .fractary/env/ or project root`);
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
 * ## State Reset Behavior
 *
 * After calling `clearEnv()`:
 * - `getCurrentEnv()` returns `undefined`
 * - `isEnvLoaded()` returns `false`
 * - The next `loadEnv()` or `switchEnv()` call will reload from files
 *
 * Note: This only clears the specified variables from `process.env`.
 * System environment variables (set outside Node.js) are not affected
 * and may still be present.
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

  // Validate input if provided
  if (variablesToClear !== undefined) {
    if (!Array.isArray(variablesToClear)) {
      console.warn('clearEnv: variablesToClear must be an array of strings');
      return;
    }
  }

  const toClear = variablesToClear || defaultVars;

  for (const varName of toClear) {
    // Only process valid string variable names
    if (typeof varName === 'string' && varName.length > 0) {
      delete process.env[varName];
    }
  }

  // Reset internal state
  currentEnv = undefined;
  envLoaded = false;
  deprecationWarned = false;
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
    docs: raw.docs,
    codex: raw.codex,
    raw,
  };
}
