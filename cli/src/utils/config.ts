/**
 * Configuration Management Utilities
 *
 * Handles unified YAML configuration loading from .fractary/core/config.yaml
 */

import {
  loadYamlConfig as sdkLoadYamlConfig,
  writeYamlConfig as sdkWriteYamlConfig,
  configExists as sdkConfigExists,
  getConfigPath as sdkGetConfigPath,
  getCoreDir as sdkGetCoreDir,
  findProjectRoot,
  CoreYamlConfig,
} from '@fractary/core/common/yaml-config';

/**
 * Core configuration structure (alias for CoreYamlConfig)
 */
export type CoreConfig = CoreYamlConfig;

/**
 * Load configuration from .fractary/core/config.yaml
 *
 * @param projectRoot - Project root directory (auto-detected if not provided)
 * @returns Configuration object or null if not found
 *
 * @example
 * ```typescript
 * const config = loadConfig();
 * if (config) {
 *   console.log('Work config:', config.work);
 * }
 * ```
 */
export function loadConfig(projectRoot?: string): CoreConfig | null {
  try {
    return sdkLoadYamlConfig({ projectRoot });
  } catch (error) {
    // Return null instead of throwing to maintain backward compatibility
    console.error('Error loading config:', error);
    return null;
  }
}

/**
 * Write configuration to .fractary/core/config.yaml
 *
 * @param config - Configuration object to write
 * @param projectRoot - Project root directory (auto-detected if not provided)
 *
 * @example
 * ```typescript
 * writeConfig({
 *   version: '2.0',
 *   work: {
 *     active_handler: 'github',
 *     handlers: { github: { token: '${GITHUB_TOKEN}' } }
 *   }
 * });
 * ```
 */
export function writeConfig(config: CoreConfig, projectRoot?: string): void {
  sdkWriteYamlConfig(config, projectRoot);
}

/**
 * Check if configuration file exists
 *
 * @param projectRoot - Project root directory (auto-detected if not provided)
 * @returns true if .fractary/core/config.yaml exists
 */
export function configExists(projectRoot?: string): boolean {
  return sdkConfigExists(projectRoot);
}

/**
 * Get the configuration file path
 *
 * @param projectRoot - Project root directory (auto-detected if not provided)
 * @returns Full path to .fractary/core/config.yaml
 */
export function getConfigPath(projectRoot?: string): string {
  return sdkGetConfigPath(projectRoot);
}

/**
 * Get the .fractary/core directory path
 *
 * @param projectRoot - Project root directory (auto-detected if not provided)
 * @returns Full path to .fractary/core directory
 */
export function getCoreDir(projectRoot?: string): string {
  return sdkGetCoreDir(projectRoot);
}

/**
 * Get the default configuration file path for the current project
 *
 * @returns Default config path (.fractary/core/config.yaml)
 * @deprecated Use getConfigPath() instead
 */
export function getDefaultConfigPath(): string {
  return getConfigPath();
}

/**
 * Get configuration directory path
 *
 * @returns Config directory path (.fractary/core)
 * @deprecated Use getCoreDir() instead
 */
export function getConfigDir(): string {
  return getCoreDir();
}

/**
 * Merge configuration objects
 *
 * @param base - Base configuration
 * @param override - Configuration to merge in
 * @returns Merged configuration
 */
export function mergeConfig(base: CoreConfig, override: Partial<CoreConfig>): CoreConfig {
  return {
    version: override.version || base.version,
    work: override.work !== undefined ? override.work : base.work,
    repo: override.repo !== undefined ? override.repo : base.repo,
    spec: override.spec !== undefined ? override.spec : base.spec,
    logs: override.logs !== undefined ? override.logs : base.logs,
    file: override.file !== undefined ? override.file : base.file,
    docs: override.docs !== undefined ? override.docs : base.docs,
  };
}

/**
 * Find project root by looking for .fractary or .git directory
 *
 * @param startDir - Directory to start searching from (default: current working directory)
 * @returns Project root directory path
 */
export { findProjectRoot };
