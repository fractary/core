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
 * Unified configuration structure for all Fractary Core plugins
 */
export interface CoreYamlConfig {
  version: string;
  work?: any;
  repo?: any;
  logs?: any;
  file?: any;
  spec?: any;
  docs?: any;
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
  const configPath = path.join(root, '.fractary', 'core', 'config.yaml');

  if (!fs.existsSync(configPath)) {
    if (throwIfMissing) {
      throw new Error(
        `Configuration file not found: ${configPath}\n` +
        `Run 'fractary-core:init' to create it.`
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
 * Write unified configuration to `.fractary/core/config.yaml`
 *
 * @param config Configuration object to write
 * @param projectRoot Project root directory (auto-detected if not provided)
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
 * ```
 */
export function writeYamlConfig(
  config: CoreYamlConfig,
  projectRoot?: string
): void {
  const root = projectRoot || findProjectRoot();
  const fractaryDir = path.join(root, '.fractary', 'core');
  const configPath = path.join(fractaryDir, 'config.yaml');

  // Ensure directory exists
  if (!fs.existsSync(fractaryDir)) {
    fs.mkdirSync(fractaryDir, { recursive: true });
  }

  // Convert to YAML with proper formatting
  const yamlContent = yaml.dump(config, {
    indent: 2,
    lineWidth: 100,
    noRefs: true,
    sortKeys: false,
  });

  fs.writeFileSync(configPath, yamlContent, 'utf-8');
}

/**
 * Substitute ${ENV_VAR} placeholders with actual environment variables
 *
 * Supports:
 * - ${VAR_NAME} - Replace with env var value
 * - ${VAR_NAME:-default} - Replace with env var value or default if not set
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
  return content.replace(
    /\$\{([A-Z_][A-Z0-9_]*)(:-([^}]+))?\}/g,
    (match, varName, _, defaultValue) => {
      const value = process.env[varName];

      if (value !== undefined) {
        return value;
      }

      if (defaultValue !== undefined) {
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
 * @param startDir Directory to start searching from (default: current working directory)
 * @returns Project root directory
 */
export function findProjectRoot(startDir: string = process.cwd()): string {
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    // Check for .fractary directory
    if (fs.existsSync(path.join(currentDir, '.fractary'))) {
      return currentDir;
    }

    // Check for .git directory
    if (fs.existsSync(path.join(currentDir, '.git'))) {
      return currentDir;
    }

    // Move up one directory
    currentDir = path.dirname(currentDir);
  }

  // If no marker found, return the starting directory
  return startDir;
}

/**
 * Check if a valid configuration file exists
 *
 * @param projectRoot Project root directory (auto-detected if not provided)
 * @returns true if `.fractary/core/config.yaml` exists
 */
export function configExists(projectRoot?: string): boolean {
  const root = projectRoot || findProjectRoot();
  const configPath = path.join(root, '.fractary', 'core', 'config.yaml');
  return fs.existsSync(configPath);
}

/**
 * Get the configuration file path
 *
 * @param projectRoot Project root directory (auto-detected if not provided)
 * @returns Full path to configuration file
 */
export function getConfigPath(projectRoot?: string): string {
  const root = projectRoot || findProjectRoot();
  return path.join(root, '.fractary', 'core', 'config.yaml');
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
