/**
 * @fractary/core - Secrets Sanitization Utilities
 *
 * Unified utilities for redacting sensitive values from strings and objects.
 * Used by CLI, MCP server, and other components to prevent token/secret exposure.
 */

/**
 * Sensitive key names that should be redacted
 */
const SENSITIVE_KEYS = ['token', 'key', 'secret', 'password', 'api_key', 'apikey', 'auth'];

/**
 * Token patterns for detection and redaction
 */
const TOKEN_PATTERNS = {
  // GitHub tokens (ghp_, gho_, ghs_, ghu_, ghr_)
  github: /gh[posuhr]_[A-Za-z0-9]{36,}/gi,
  // GitLab tokens
  gitlab: /glpat-[A-Za-z0-9_\-]{20,}/gi,
  // Bearer tokens
  bearer: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  // Basic auth
  basic: /Basic\s+[A-Za-z0-9+/=]+/gi,
  // Generic key-value patterns (JSON, env vars, config)
  keyValue:
    /(token|key|password|secret|api[_-]?key|access[_-]?token|auth[_-]?token|bearer)["']?\s*[=:]\s*["']?[^\s"',}]+/gi,
  // Generic API keys (long alphanumeric strings after common keywords)
  genericKey:
    /(api[_-]?key|apikey|access[_-]?key)\s*[=:]\s*["']?[A-Za-z0-9\-._~+/]{20,}["']?/gi,
};

/**
 * Redaction placeholders
 */
const REDACTED = {
  default: '[REDACTED]',
  github: '[REDACTED_GITHUB_TOKEN]',
  gitlab: '[REDACTED_GITLAB_TOKEN]',
  value: '********',
};

/**
 * Sanitize token/secret values from error messages and logs.
 * Replaces common secret patterns with [REDACTED].
 *
 * @param message - Error message or log string
 * @returns Sanitized message with secrets redacted
 *
 * @example
 * ```typescript
 * const safe = sanitizeSecrets('Failed with token ghp_abc123...');
 * // Returns: 'Failed with token [REDACTED_GITHUB_TOKEN]'
 * ```
 */
export function sanitizeSecrets(message: string): string {
  return (
    message
      // Redact tokens in key-value patterns (JSON, env vars, config)
      .replace(TOKEN_PATTERNS.keyValue, '$1: [REDACTED]')
      // Redact bearer tokens
      .replace(TOKEN_PATTERNS.bearer, 'Bearer [REDACTED]')
      // Redact Basic auth
      .replace(TOKEN_PATTERNS.basic, 'Basic [REDACTED]')
      // Redact GitHub tokens (ghp_, gho_, ghs_, ghu_, ghr_)
      .replace(TOKEN_PATTERNS.github, REDACTED.github)
      // Redact GitLab tokens
      .replace(TOKEN_PATTERNS.gitlab, REDACTED.gitlab)
      // Redact generic API keys (long alphanumeric strings after common keywords)
      .replace(TOKEN_PATTERNS.genericKey, '$1: [REDACTED]')
  );
}

/**
 * Check if a string contains potential security-sensitive information.
 *
 * @param value - String to check
 * @returns True if string might contain secrets
 *
 * @example
 * ```typescript
 * containsSecrets('my api_key is xyz'); // true
 * containsSecrets('hello world'); // false
 * ```
 */
export function containsSecrets(value: string): boolean {
  const secretPatterns = [
    /token/i,
    /password/i,
    /secret/i,
    /api[_-]?key/i,
    /bearer/i,
    /authorization/i,
    /gh[posuhr]_/,
    /glpat-/,
  ];

  return secretPatterns.some((pattern) => pattern.test(value));
}

/**
 * Check if a key name indicates it holds a sensitive value.
 *
 * @param key - Key name to check
 * @returns True if the key likely holds a secret
 */
export function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitiveKey) => lowerKey.includes(sensitiveKey));
}

/**
 * Redact sensitive values from a configuration object for display.
 * Preserves environment variable references like `${GITHUB_TOKEN}`.
 *
 * @param config - Configuration object to redact
 * @returns Deep copy with sensitive values redacted
 *
 * @example
 * ```typescript
 * const config = {
 *   token: 'ghp_secret123',
 *   owner: 'myorg',
 *   nested: { api_key: 'abc123' }
 * };
 * const safe = redactConfig(config);
 * // Returns: { token: '********', owner: 'myorg', nested: { api_key: '********' } }
 * ```
 */
export function redactConfig(config: unknown): unknown {
  if (!config) return config;

  // Deep clone to avoid mutating original
  const redacted = JSON.parse(JSON.stringify(config));

  function redactObject(obj: Record<string, unknown>): void {
    for (const key in obj) {
      const value = obj[key];

      if (typeof value === 'string') {
        // Check if key indicates sensitive data
        if (isSensitiveKey(key)) {
          // Preserve environment variable references
          if (value.includes('${')) {
            // Keep env var reference as-is
            continue;
          }
          // Redact actual values
          obj[key] = REDACTED.value;
        }
      } else if (typeof value === 'object' && value !== null) {
        redactObject(value as Record<string, unknown>);
      }
    }
  }

  if (typeof redacted === 'object' && redacted !== null) {
    redactObject(redacted as Record<string, unknown>);
  }

  return redacted;
}

/**
 * Redact a single value if it appears to be a secret.
 *
 * @param value - Value to potentially redact
 * @param key - Optional key name for context-aware redaction
 * @returns Redacted value or original value if not sensitive
 */
export function redactValue(value: string, key?: string): string {
  // If key suggests it's sensitive, redact
  if (key && isSensitiveKey(key)) {
    // Preserve env var references
    if (value.includes('${')) {
      return value;
    }
    return REDACTED.value;
  }

  // Check for known token patterns
  if (TOKEN_PATTERNS.github.test(value)) {
    return REDACTED.github;
  }
  if (TOKEN_PATTERNS.gitlab.test(value)) {
    return REDACTED.gitlab;
  }

  return value;
}
