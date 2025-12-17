/**
 * Configuration Management Utilities
 *
 * Handles configuration file discovery, loading, and migration from old paths.
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Core configuration structure
 */
export interface CoreConfig {
  work?: any;
  repo?: any;
  spec?: any;
  logs?: any;
  file?: any;
  docs?: any;
}

/**
 * Configuration paths
 */
const CONFIG_DIR = '.fractary/core';
const CONFIG_FILE = 'config.json';
const LEGACY_CONFIG_DIR = '.fractary/faber';

/**
 * Find the configuration file path by walking up the directory tree
 *
 * @param startDir - Directory to start searching from (default: current working directory)
 * @returns Path to config file or null if not found
 */
export function findConfigPath(startDir: string = process.cwd()): string | null {
  let currentDir = startDir;

  while (true) {
    const configPath = path.join(currentDir, CONFIG_DIR, CONFIG_FILE);

    if (fs.existsSync(configPath)) {
      return configPath;
    }

    const parentDir = path.dirname(currentDir);

    // Reached filesystem root
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return null;
}

/**
 * Find the legacy configuration file path
 *
 * @param startDir - Directory to start searching from
 * @returns Path to legacy config file or null if not found
 */
export function findLegacyConfigPath(startDir: string = process.cwd()): string | null {
  let currentDir = startDir;

  while (true) {
    const legacyPath = path.join(currentDir, LEGACY_CONFIG_DIR, CONFIG_FILE);

    if (fs.existsSync(legacyPath)) {
      return legacyPath;
    }

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  return null;
}

/**
 * Load configuration from file
 *
 * @param configPath - Path to config file (optional, will auto-discover if not provided)
 * @returns Configuration object or null if not found
 */
export function loadConfig(configPath?: string): CoreConfig | null {
  try {
    const actualPath = configPath || findConfigPath();

    if (!actualPath) {
      // Try to migrate from legacy path
      const legacyPath = findLegacyConfigPath();
      if (legacyPath) {
        return migrateLegacyConfig(legacyPath);
      }
      return null;
    }

    const content = fs.readFileSync(actualPath, 'utf-8');
    return JSON.parse(content) as CoreConfig;
  } catch (error) {
    // Failed to load config
    return null;
  }
}

/**
 * Migrate legacy configuration from .fractary/faber to .fractary/core
 *
 * @param legacyPath - Path to legacy config file
 * @returns Migrated configuration
 */
function migrateLegacyConfig(legacyPath: string): CoreConfig | null {
  try {
    console.log(chalk.yellow('Notice:'), 'Migrating configuration from', LEGACY_CONFIG_DIR, 'to', CONFIG_DIR);

    const content = fs.readFileSync(legacyPath, 'utf-8');
    const legacyConfig = JSON.parse(content);

    // Extract relevant configuration sections
    const coreConfig: CoreConfig = {
      work: legacyConfig.work,
      repo: legacyConfig.repo,
      spec: legacyConfig.spec,
      logs: legacyConfig.logs,
      file: legacyConfig.file,
      docs: legacyConfig.docs,
    };

    // Write to new location
    const legacyDir = path.dirname(legacyPath);
    const projectRoot = path.dirname(path.dirname(legacyDir));
    const newPath = path.join(projectRoot, CONFIG_DIR, CONFIG_FILE);

    writeConfig(coreConfig, newPath);

    console.log(chalk.green('✓'), 'Configuration migrated successfully');

    return coreConfig;
  } catch (error) {
    console.error(chalk.red('Failed to migrate configuration:'), error);
    return null;
  }
}

/**
 * Write configuration to file
 *
 * @param config - Configuration object
 * @param configPath - Path to write config to (optional, will use default if not provided)
 */
export function writeConfig(config: CoreConfig, configPath?: string): void {
  const actualPath = configPath || getDefaultConfigPath();

  // Ensure directory exists
  const dir = path.dirname(actualPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write configuration with pretty formatting
  fs.writeFileSync(actualPath, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Get the default configuration file path for the current project
 *
 * @returns Default config path
 */
export function getDefaultConfigPath(): string {
  return path.join(process.cwd(), CONFIG_DIR, CONFIG_FILE);
}

/**
 * Check if configuration exists
 *
 * @returns True if config exists, false otherwise
 */
export function configExists(): boolean {
  return findConfigPath() !== null || findLegacyConfigPath() !== null;
}

/**
 * Get configuration directory path
 *
 * @returns Config directory path
 */
export function getConfigDir(): string {
  return path.join(process.cwd(), CONFIG_DIR);
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
    work: override.work !== undefined ? override.work : base.work,
    repo: override.repo !== undefined ? override.repo : base.repo,
    spec: override.spec !== undefined ? override.spec : base.spec,
    logs: override.logs !== undefined ? override.logs : base.logs,
    file: override.file !== undefined ? override.file : base.file,
    docs: override.docs !== undefined ? override.docs : base.docs,
  };
}
