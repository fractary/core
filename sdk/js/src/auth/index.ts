/**
 * @fractary/core - Authentication Module
 *
 * Provides token providers and utilities for GitHub authentication.
 * Supports both Personal Access Token (PAT) and GitHub App authentication.
 */

// Types
export type { TokenProvider, GitHubAppConfig, GitHubConfig } from './types';

// Providers
export { StaticTokenProvider } from './static-token-provider';
export { GitHubAppAuth } from './github-app-auth';
export { GitHubAppTokenProvider } from './github-app-token-provider';

// Factory
import type { TokenProvider, GitHubConfig } from './types';
import { StaticTokenProvider } from './static-token-provider';
import { GitHubAppTokenProvider } from './github-app-token-provider';
import { AuthenticationError } from '../common/errors';

/**
 * Create a token provider from GitHub configuration
 *
 * Priority order:
 * 1. If config.app has id + installation_id → GitHubAppTokenProvider
 * 2. If GITHUB_TOKEN env var or config.token → StaticTokenProvider
 * 3. Otherwise throws AuthenticationError
 *
 * @param config GitHub configuration object
 * @returns TokenProvider instance
 * @throws AuthenticationError if no valid authentication method is found
 *
 * @example
 * ```typescript
 * // GitHub App authentication
 * const provider = createTokenProvider({
 *   app: {
 *     id: '123456',
 *     installation_id: '789012',
 *     private_key_path: '/path/to/key.pem'
 *   }
 * });
 *
 * // PAT authentication
 * const provider = createTokenProvider({
 *   token: 'ghp_xxxx'
 * });
 *
 * // Environment variable (GITHUB_TOKEN)
 * const provider = createTokenProvider({});
 * ```
 */
export function createTokenProvider(config: GitHubConfig = {}): TokenProvider {
  // Priority 1: GitHub App authentication
  if (config.app?.id && config.app?.installation_id) {
    if (!config.app.private_key_path && !config.app.private_key_env_var) {
      throw new AuthenticationError(
        'github-app',
        'GitHub App config must specify either private_key_path or private_key_env_var'
      );
    }
    return new GitHubAppTokenProvider(config.app);
  }

  // Priority 2: PAT from config
  if (config.token) {
    return new StaticTokenProvider(config.token);
  }

  // Priority 3: PAT from environment variable
  const envToken = process.env.GITHUB_TOKEN;
  if (envToken) {
    return new StaticTokenProvider(envToken);
  }

  // No valid authentication method found
  throw new AuthenticationError(
    'github',
    'No GitHub authentication configured. Set GITHUB_TOKEN environment variable, ' +
    'provide a token in config, or configure GitHub App authentication.'
  );
}
