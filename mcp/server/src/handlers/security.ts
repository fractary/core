import { resolve, relative } from 'path';

// Re-export secrets utilities from SDK for backward compatibility
// All secret sanitization logic now lives in @fractary/core/common/secrets
export { sanitizeSecrets, containsSecrets } from '@fractary/core/common/secrets';

/**
 * Security helper functions for preventing common vulnerabilities
 */

/**
 * Validates that a path does not escape the base directory
 * Prevents directory traversal attacks like ../../etc/passwd
 *
 * @param userPath - User-provided path (potentially unsafe)
 * @param basePath - Base directory that must contain the final path
 * @returns Normalized safe path if valid
 * @throws Error if path attempts directory traversal
 */
export function validatePath(userPath: string, basePath: string): string {
  // Normalize both paths to resolve . and .. segments
  const normalizedBase = resolve(basePath);
  const normalizedPath = resolve(normalizedBase, userPath);

  // Check if the resolved path is within the base directory
  const relativePath = relative(normalizedBase, normalizedPath);

  // If relative path starts with .. or is absolute, it's escaping the base
  if (relativePath.startsWith('..') || resolve(relativePath) === relativePath) {
    throw new Error(`Path traversal detected: ${userPath} attempts to escape base directory`);
  }

  // Return the safe, normalized path relative to base
  return relativePath;
}

/**
 * Validates multiple paths in bulk
 *
 * @param paths - Array of user-provided paths
 * @param basePath - Base directory that must contain all paths
 * @returns Array of normalized safe paths
 * @throws Error if any path attempts directory traversal
 */
export function validatePaths(paths: string[], basePath: string): string[] {
  return paths.map((path) => validatePath(path, basePath));
}
