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
 * Stub config loaders - these return null to indicate no config found
 * Individual SDKs will use sensible defaults
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function loadWorkConfig(..._args: unknown[]): null {
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function loadRepoConfig(..._args: unknown[]): null {
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function loadSpecConfig(..._args: unknown[]): null {
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function loadLogConfig(..._args: unknown[]): null {
  return null;
}
