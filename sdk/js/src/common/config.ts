/**
 * @fractary/core - Configuration Utilities
 *
 * Utilities for finding project roots and loading configuration.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Find the project root directory by looking for common markers
 */
export function findProjectRoot(startDir: string = process.cwd()): string {
  let currentDir = startDir;

  // Common project root markers
  const markers = [
    'package.json',
    '.git',
    'tsconfig.json',
    'pyproject.toml',
    'setup.py',
  ];

  while (currentDir !== path.parse(currentDir).root) {
    // Check if any marker exists in current directory
    for (const marker of markers) {
      const markerPath = path.join(currentDir, marker);
      if (fs.existsSync(markerPath)) {
        return currentDir;
      }
    }

    // Move up one directory
    currentDir = path.dirname(currentDir);
  }

  // If no marker found, return the starting directory
  return startDir;
}

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
  const root = projectRoot || findProjectRoot();
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

import { loadYamlConfig } from './yaml-config';

/**
 * Load work plugin configuration from unified YAML
 */
export function loadWorkConfig(projectRoot?: string): any | null {
  const config = loadYamlConfig({ projectRoot });
  return config?.work || null;
}

/**
 * Load repository plugin configuration from unified YAML
 */
export function loadRepoConfig(projectRoot?: string): any | null {
  const config = loadYamlConfig({ projectRoot });
  return config?.repo || null;
}

/**
 * Load specification plugin configuration from unified YAML
 */
export function loadSpecConfig(projectRoot?: string): any | null {
  const config = loadYamlConfig({ projectRoot });
  return config?.spec || null;
}

/**
 * Load logging plugin configuration from unified YAML
 */
export function loadLogConfig(projectRoot?: string): any | null {
  const config = loadYamlConfig({ projectRoot });
  return config?.logs || null;
}

/**
 * Load file storage plugin configuration from unified YAML
 */
export function loadFileConfig(projectRoot?: string): any | null {
  const config = loadYamlConfig({ projectRoot });
  return config?.file || null;
}

/**
 * Load documentation plugin configuration from unified YAML
 */
export function loadDocsConfig(projectRoot?: string): any | null {
  const config = loadYamlConfig({ projectRoot });
  return config?.docs || null;
}
