import { resolve, relative } from 'path';

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
  return paths.map(path => validatePath(path, basePath));
}

/**
 * Sanitizes token/secret values from error messages and logs
 * Replaces common secret patterns with [REDACTED]
 *
 * @param message - Error message or log string
 * @returns Sanitized message with secrets redacted
 */
export function sanitizeSecrets(message: string): string {
  return message
    // Redact tokens in key-value patterns (JSON, env vars, config)
    .replace(/(token|key|password|secret|api[_-]?key|access[_-]?token|auth[_-]?token|bearer)["']?\s*[=:]\s*["']?[^\s"',}]+/gi, '$1: [REDACTED]')
    // Redact bearer tokens
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    // Redact Basic auth
    .replace(/Basic\s+[A-Za-z0-9+/=]+/gi, 'Basic [REDACTED]')
    // Redact GitHub tokens (ghp_, gho_, ghs_, ghu_)
    .replace(/gh[pousr]_[A-Za-z0-9]{36,}/gi, '[REDACTED_GITHUB_TOKEN]')
    // Redact GitLab tokens
    .replace(/glpat-[A-Za-z0-9_\-]{20,}/gi, '[REDACTED_GITLAB_TOKEN]')
    // Redact generic API keys (long alphanumeric strings after common keywords)
    .replace(/(api[_-]?key|apikey|access[_-]?key)\s*[=:]\s*["']?[A-Za-z0-9\-._~+/]{20,}["']?/gi, '$1: [REDACTED]');
}

/**
 * Checks if a string contains potential security-sensitive information
 *
 * @param value - String to check
 * @returns True if string might contain secrets
 */
export function containsSecrets(value: string): boolean {
  const secretPatterns = [
    /token/i,
    /password/i,
    /secret/i,
    /api[_-]?key/i,
    /bearer/i,
    /authorization/i,
    /gh[pousr]_/,
    /glpat-/,
  ];

  return secretPatterns.some(pattern => pattern.test(value));
}
