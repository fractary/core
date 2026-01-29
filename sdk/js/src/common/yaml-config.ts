/**
 * Unified YAML Configuration Loader
 *
 * Loads and parses `.fractary/core/config.yaml` with environment variable substitution.
 * Provides a single source of truth for all plugin configurations.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * Base URL for Fractary Core documentation on GitHub
 */
const GITHUB_DOCS_BASE_URL = 'https://github.com/fractary/core/blob/main';

/**
 * Documentation URLs for each configuration section
 * These are injected as comments when writing config.yaml
 */
export const PLUGIN_DOC_URLS: Record<string, string> = {
  work: `${GITHUB_DOCS_BASE_URL}/plugins/work/README.md`,
  repo: `${GITHUB_DOCS_BASE_URL}/plugins/repo/README.md`,
  logs: `${GITHUB_DOCS_BASE_URL}/plugins/logs/README.md`,
  file: `${GITHUB_DOCS_BASE_URL}/plugins/file/README.md`,
  spec: `${GITHUB_DOCS_BASE_URL}/plugins/spec/README.md`,
  docs: `${GITHUB_DOCS_BASE_URL}/plugins/docs/README.md`,
  codex: `${GITHUB_DOCS_BASE_URL}/docs/guides/configuration.md#codex-configuration`,
};

/**
 * URL for the main configuration guide
 */
export const CONFIG_GUIDE_URL = `${GITHUB_DOCS_BASE_URL}/docs/guides/configuration.md`;

/**
 * Work tracking configuration
 */
export interface WorkConfig {
  active_handler: string;
  handlers: Record<string, any>;
  defaults?: Record<string, any>;
  hooks?: Record<string, any>;
  advanced?: Record<string, any>;
}

/**
 * PR merge default options
 */
export interface PRMergeDefaults {
  /** Default merge strategy: 'squash', 'merge', or 'rebase' */
  strategy?: 'squash' | 'merge' | 'rebase';
  /** Whether to delete the branch after merge by default */
  delete_branch?: boolean;
}

/**
 * PR configuration defaults
 */
export interface PRDefaults {
  template?: string;
  require_work_id?: boolean;
  auto_link_issues?: boolean;
  ci_polling?: {
    enabled?: boolean;
    interval_seconds?: number;
    timeout_seconds?: number;
    initial_delay_seconds?: number;
  };
  /** Default options for PR merge operations */
  merge?: PRMergeDefaults;
}

/**
 * Repository defaults configuration
 */
export interface RepoDefaults {
  default_branch?: string;
  protected_branches?: string[];
  branch_naming?: Record<string, any>;
  commit_format?: string;
  require_signed_commits?: boolean;
  merge_strategy?: string;
  auto_delete_merged_branches?: boolean;
  remote?: Record<string, any>;
  push_sync_strategy?: string;
  pull_sync_strategy?: string;
  pr?: PRDefaults;
}

/**
 * Repository management configuration
 */
export interface RepoConfig {
  active_handler: string;
  handlers: Record<string, any>;
  defaults?: RepoDefaults;
  faber_integration?: Record<string, any>;
  hooks?: Record<string, any>;
  platform_specific?: Record<string, any>;
}

/**
 * Logs management configuration
 */
export interface LogsConfig {
  schema_version: string;
  /**
   * Path to custom log type templates manifest (local project overrides)
   * Falls back to core templates if not specified
   */
  custom_templates_path?: string;
  storage?: Record<string, any>;
  retention?: Record<string, any>;
  session_logging?: Record<string, any>;
  auto_backup?: Record<string, any>;
  summarization?: Record<string, any>;
  archive?: Record<string, any>;
  search?: Record<string, any>;
  integration?: Record<string, any>;
  docs_integration?: Record<string, any>;
}

/**
 * File storage source configuration (v2.0)
 */
export interface FileSource {
  type: string;
  bucket?: string;
  prefix?: string;
  region?: string;
  project_id?: string;
  local: {
    base_path: string;
  };
  push?: {
    compress?: boolean;
    keep_local?: boolean;
  };
  auth?: Record<string, any>;
}

/**
 * File storage configuration (supports both v1.0 and v2.0)
 */
export interface FileConfig {
  schema_version: string;
  // v2.0 handlers-based config (named file handlers like 'logs', 'specs')
  handlers?: Record<string, FileSource>;
  global_settings?: Record<string, any>;
  // v1.0 config (deprecated) - used active_handler to select from handlers
  active_handler?: string;
}

/**
 * Specification management configuration
 */
export interface SpecConfig {
  schema_version: string;
  storage?: Record<string, any>;
  naming?: Record<string, any>;
  archive?: Record<string, any>;
  integration?: Record<string, any>;
  templates?: Record<string, any>;
}

/**
 * Documentation management configuration
 */
export interface DocsConfig {
  schema_version: string;
  /**
   * Path to custom doc type templates manifest (local project overrides)
   * Falls back to core templates if not specified
   */
  custom_templates_path?: string;
  hooks?: Record<string, any>;
  doc_types?: Record<string, any>;
  output_paths?: Record<string, any>;
  templates?: Record<string, any>;
  frontmatter?: Record<string, any>;
  validation?: Record<string, any>;
  linking?: Record<string, any>;
}

/**
 * Codex configuration for cross-project context
 */
export interface CodexConfig {
  schema_version: string;
  organization: string;
  project: string;
  dependencies?: Record<string, any>;
}

/**
 * Unified configuration structure for all Fractary Core plugins
 */
export interface CoreYamlConfig {
  version: string;
  work?: WorkConfig;
  repo?: RepoConfig;
  logs?: LogsConfig;
  file?: FileConfig;
  spec?: SpecConfig;
  docs?: DocsConfig;
  codex?: CodexConfig;
}

/**
 * Configuration loading options
 */
export interface ConfigLoadOptions {
  /** Project root directory (auto-detected if not provided) */
  projectRoot?: string;
  /** Warn about missing environment variables (default: true) */
  warnMissingEnvVars?: boolean;
  /** Throw error if config file doesn't exist (default: false) */
  throwIfMissing?: boolean;
}

/**
 * Load and parse `.fractary/core/config.yaml` with environment variable substitution
 *
 * @param options Configuration loading options
 * @returns Parsed configuration object or null if not found
 * @throws Error if config is invalid or throwIfMissing is true and file doesn't exist
 *
 * @example
 * ```typescript
 * const config = loadYamlConfig();
 * if (config?.work) {
 *   console.log('Work config:', config.work);
 * }
 * ```
 */
export function loadYamlConfig(options: ConfigLoadOptions = {}): CoreYamlConfig | null {
  const {
    projectRoot,
    warnMissingEnvVars = true,
    throwIfMissing = false,
  } = options;

  const root = projectRoot || findProjectRoot();

  // Try new location first (.fractary/config.yaml)
  const newConfigPath = path.join(root, '.fractary', 'config.yaml');
  const oldConfigPath = path.join(root, '.fractary', 'core', 'config.yaml');

  let configPath: string;
  if (fs.existsSync(newConfigPath)) {
    configPath = newConfigPath;
  } else if (fs.existsSync(oldConfigPath)) {
    configPath = oldConfigPath;
    console.warn(
      `Warning: Using deprecated config location: ${oldConfigPath}\n` +
      `Please move to: ${newConfigPath}`
    );
  } else {
    if (throwIfMissing) {
      throw new Error(
        `Configuration file not found at:\n` +
        `  - ${newConfigPath} (preferred)\n` +
        `  - ${oldConfigPath} (deprecated)\n` +
        `Run 'fractary-core:configure' to create it.`
      );
    }
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const substituted = substituteEnvVars(content, warnMissingEnvVars);
    const parsed = yaml.load(substituted) as CoreYamlConfig;

    // Validate basic structure
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid configuration: must be a YAML object');
    }

    if (!parsed.version) {
      console.warn(`Warning: Configuration missing version field in ${configPath}`);
    }

    return parsed;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load config from ${configPath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Options for writing YAML configuration
 */
export interface WriteYamlConfigOptions {
  /** Project root directory (auto-detected if not provided) */
  projectRoot?: string;
  /** Include documentation URL comments for each section (default: true) */
  includeDocComments?: boolean;
}

/**
 * Inject documentation URL comments into YAML content
 *
 * Adds a comment with the documentation URL above each plugin section.
 * Also adds a header comment with the main configuration guide URL.
 *
 * @param yamlContent The raw YAML string
 * @param config The configuration object (used to determine which sections exist)
 * @returns YAML string with documentation comments injected
 */
export function injectDocumentationComments(
  yamlContent: string,
  config: CoreYamlConfig
): string {
  const lines = yamlContent.split('\n');
  const result: string[] = [];

  // Add header comment with main configuration guide
  result.push('# Fractary Core Configuration');
  result.push(`# Documentation: ${CONFIG_GUIDE_URL}`);
  result.push('#');
  result.push('');

  // Get sections that actually exist in the config
  const configSections = new Set(Object.keys(config));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this line starts a plugin section (top-level key, no indentation)
    // Match pattern: "sectionName:" at the start of a line (no leading whitespace)
    const sectionMatch = line.match(/^([a-z_]+):\s*$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1];

      // Only add comment if section exists in config and has a documentation URL
      if (configSections.has(sectionName) && PLUGIN_DOC_URLS[sectionName]) {
        // Add a blank line before the comment (if not at start)
        if (result.length > 0 && result[result.length - 1] !== '') {
          result.push('');
        }
        // Add the documentation comment
        result.push(`# ${sectionName} - ${PLUGIN_DOC_URLS[sectionName]}`);
      }
    }

    result.push(line);
  }

  return result.join('\n');
}

/**
 * Write unified configuration to `.fractary/config.yaml`
 *
 * @param config Configuration object to write
 * @param options Write options (projectRoot, includeDocComments)
 *
 * @example
 * ```typescript
 * writeYamlConfig({
 *   version: '2.0',
 *   work: {
 *     active_handler: 'github',
 *     handlers: { ... }
 *   }
 * });
 *
 * // Without documentation comments
 * writeYamlConfig(config, { includeDocComments: false });
 * ```
 */
export function writeYamlConfig(
  config: CoreYamlConfig,
  options: WriteYamlConfigOptions | string = {}
): void {
  // Handle backward compatibility: if options is a string, treat it as projectRoot
  const opts: WriteYamlConfigOptions = typeof options === 'string'
    ? { projectRoot: options }
    : options;

  const {
    projectRoot,
    includeDocComments = true,
  } = opts;

  const root = projectRoot || findProjectRoot();
  const fractaryDir = path.join(root, '.fractary');
  const configPath = path.join(fractaryDir, 'config.yaml');

  // Ensure directory exists
  if (!fs.existsSync(fractaryDir)) {
    fs.mkdirSync(fractaryDir, { recursive: true });
  }

  // Convert to YAML with proper formatting
  let yamlContent = yaml.dump(config, {
    indent: 2,
    lineWidth: 100,
    noRefs: true,
    sortKeys: false,
  });

  // Inject documentation comments if enabled
  if (includeDocComments) {
    yamlContent = injectDocumentationComments(yamlContent, config);
  }

  fs.writeFileSync(configPath, yamlContent, 'utf-8');
}

/**
 * Substitute ${ENV_VAR} placeholders with actual environment variables
 *
 * Supports:
 * - ${VAR_NAME} - Replace with env var value
 * - ${VAR_NAME:-default} - Replace with env var value or default if not set
 *
 * Security: Default values are limited to 1000 characters to prevent abuse.
 * Variable names must match pattern: [A-Z_][A-Z0-9_]*
 *
 * @param content Content with environment variable placeholders
 * @param warnMissing Whether to warn about missing environment variables
 * @returns Content with substituted values
 *
 * @example
 * ```typescript
 * const content = 'token: ${GITHUB_TOKEN}';
 * const result = substituteEnvVars(content);
 * // result: 'token: ghp_xxxxx'
 * ```
 */
export function substituteEnvVars(content: string, warnMissing = true): string {
  // Input validation
  if (typeof content !== 'string') {
    throw new TypeError('Content must be a string');
  }

  // Maximum length for default values to prevent abuse
  const MAX_DEFAULT_LENGTH = 1000;

  return content.replace(
    /\$\{([A-Z_][A-Z0-9_]*)(:-([^}]+))?\}/g,
    (match, varName, _, defaultValue) => {
      // Validate variable name format
      if (!/^[A-Z_][A-Z0-9_]*$/.test(varName)) {
        console.warn(`Warning: Invalid environment variable name: ${varName}`);
        return match;
      }

      const value = process.env[varName];

      if (value !== undefined) {
        return value;
      }

      if (defaultValue !== undefined) {
        // Validate default value length
        if (defaultValue.length > MAX_DEFAULT_LENGTH) {
          console.warn(
            `Warning: Default value for ${varName} exceeds maximum length (${MAX_DEFAULT_LENGTH} chars). ` +
            `Truncating to prevent abuse.`
          );
          return defaultValue.substring(0, MAX_DEFAULT_LENGTH);
        }

        return defaultValue;
      }

      if (warnMissing) {
        console.warn(
          `Warning: Environment variable ${varName} not set. ` +
          `Using placeholder value.`
        );
      }

      // Keep original placeholder if no value found
      return match;
    }
  );
}

/**
 * Find project root by looking for .fractary directory or .git
 *
 * Walks up the directory tree from startDir until it finds:
 * - A directory containing `.fractary/`
 * - A directory containing `.git/`
 * - The filesystem root
 *
 * Security: Normalizes paths and prevents traversal outside filesystem boundaries.
 * Maximum of 100 directory levels to prevent infinite loops.
 *
 * @param startDir Directory to start searching from (default: current working directory)
 * @returns Project root directory (normalized absolute path)
 */
export function findProjectRoot(startDir: string = process.cwd()): string {
  // Input validation and normalization
  if (typeof startDir !== 'string') {
    throw new TypeError('startDir must be a string');
  }

  // Normalize and resolve to absolute path to prevent path traversal
  let currentDir = path.resolve(path.normalize(startDir));

  // Get filesystem root for comparison
  const fsRoot = path.parse(currentDir).root;

  // Safety limit: maximum 100 directory levels to prevent infinite loops
  const MAX_LEVELS = 100;
  let levels = 0;

  while (currentDir !== fsRoot && levels < MAX_LEVELS) {
    try {
      // Check for .fractary directory
      if (fs.existsSync(path.join(currentDir, '.fractary'))) {
        return currentDir;
      }

      // Check for .git directory
      if (fs.existsSync(path.join(currentDir, '.git'))) {
        return currentDir;
      }

      // Move up one directory
      const parentDir = path.dirname(currentDir);

      // Safety check: ensure we're actually moving up
      if (parentDir === currentDir) {
        // Reached filesystem root
        break;
      }

      currentDir = parentDir;
      levels++;
    } catch (error) {
      // Handle permission errors or invalid paths gracefully
      console.warn(`Warning: Error accessing directory ${currentDir}: ${error}`);
      break;
    }
  }

  if (levels >= MAX_LEVELS) {
    console.warn(`Warning: Exceeded maximum directory depth (${MAX_LEVELS} levels) while searching for project root`);
  }

  // If no marker found, return the normalized starting directory
  return path.resolve(path.normalize(startDir));
}

/**
 * Check if a valid configuration file exists
 *
 * @param projectRoot Project root directory (auto-detected if not provided)
 * @returns true if config exists at either new or old location
 */
export function configExists(projectRoot?: string): boolean {
  const root = projectRoot || findProjectRoot();
  const newConfigPath = path.join(root, '.fractary', 'config.yaml');
  const oldConfigPath = path.join(root, '.fractary', 'core', 'config.yaml');
  return fs.existsSync(newConfigPath) || fs.existsSync(oldConfigPath);
}

/**
 * Get the configuration file path
 *
 * @param projectRoot Project root directory (auto-detected if not provided)
 * @returns Full path to configuration file (prefers new location)
 */
export function getConfigPath(projectRoot?: string): string {
  const root = projectRoot || findProjectRoot();
  const newConfigPath = path.join(root, '.fractary', 'config.yaml');
  const oldConfigPath = path.join(root, '.fractary', 'core', 'config.yaml');

  if (fs.existsSync(newConfigPath)) {
    return newConfigPath;
  } else if (fs.existsSync(oldConfigPath)) {
    return oldConfigPath;
  }

  // Return new path if neither exists (for creation)
  return newConfigPath;
}

/**
 * Get the .fractary/core directory path
 *
 * @param projectRoot Project root directory (auto-detected if not provided)
 * @returns Full path to .fractary/core directory
 */
export function getCoreDir(projectRoot?: string): string {
  const root = projectRoot || findProjectRoot();
  return path.join(root, '.fractary', 'core');
}

/**
 * Validate that environment variables referenced in config exist
 *
 * @param config Configuration object to validate
 * @returns Array of missing environment variable names
 */
export function validateEnvVars(config: CoreYamlConfig): string[] {
  const content = yaml.dump(config);
  const missing: string[] = [];

  // Find all ${VAR_NAME} references
  const matches = content.matchAll(/\$\{([A-Z_][A-Z0-9_]*)(:-[^}]+)?\}/g);

  for (const match of matches) {
    const varName = match[1];
    const hasDefault = match[2] !== undefined;

    // Only check if no default value provided
    if (!hasDefault && process.env[varName] === undefined) {
      if (!missing.includes(varName)) {
        missing.push(varName);
      }
    }
  }

  return missing;
}
