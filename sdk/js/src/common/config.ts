/**
 * @fractary/core - Configuration Utilities
 *
 * Utilities for finding project roots and loading configuration.
 */

import * as fs from 'fs';
import * as path from 'path';
import { findProjectRoot as yamlFindProjectRoot, loadYamlConfig } from './yaml-config';

// Re-export findProjectRoot from yaml-config for backward compatibility
// The yaml-config version includes better path normalization and safety checks
export { yamlFindProjectRoot as findProjectRoot };

/**
 * Check if a directory is a git repository
 */
export function isGitRepository(dir: string = process.cwd()): boolean {
  const gitDir = path.join(dir, '.git');
  return fs.existsSync(gitDir);
}

/**
 * Get the .fractary directory path
 */
export function getFractaryDir(projectRoot?: string): string {
  const root = projectRoot || yamlFindProjectRoot();
  return path.join(root, '.fractary');
}

/**
 * Ensure a directory exists
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Config loaders - extract plugin sections from unified YAML config
 * Uses .fractary/core/config.yaml as the single source of truth
 */

/**
 * Load work plugin configuration from unified YAML
 */
export function loadWorkConfig(projectRoot?: string): any | null {
  const config = loadYamlConfig({ projectRoot, warnMissingEnvVars: false });
  return config?.work || null;
}

/**
 * Load repository plugin configuration from unified YAML
 */
export function loadRepoConfig(projectRoot?: string): any | null {
  const config = loadYamlConfig({ projectRoot, warnMissingEnvVars: false });
  return config?.repo || null;
}

/**
 * Load logging plugin configuration from unified YAML
 */
export function loadLogConfig(projectRoot?: string): any | null {
  const config = loadYamlConfig({ projectRoot, warnMissingEnvVars: false });
  return config?.logs || null;
}

/**
 * Load file storage plugin configuration from unified YAML
 */
export function loadFileConfig(projectRoot?: string): any | null {
  const config = loadYamlConfig({ projectRoot, warnMissingEnvVars: false });
  return config?.file || null;
}

/**
 * Load documentation plugin configuration from unified YAML
 */
export function loadDocsConfig(projectRoot?: string): any | null {
  const config = loadYamlConfig({ projectRoot, warnMissingEnvVars: false });
  return config?.docs || null;
}
