/**
 * @fractary/core - GitHub App Token Provider
 *
 * TokenProvider implementation that wraps GitHubAppAuth.
 */

import type { TokenProvider, GitHubAppConfig } from './types';
import { GitHubAppAuth } from './github-app-auth';

/**
 * GitHub App token provider
 *
 * Implements the TokenProvider interface using GitHub App authentication.
 * Wraps GitHubAppAuth to provide automatic token caching and refresh.
 *
 * @example
 * ```typescript
 * const provider = new GitHubAppTokenProvider({
 *   id: '123456',
 *   installation_id: '789012',
 *   private_key_path: '/path/to/private-key.pem'
 * });
 *
 * const token = await provider.getToken();
 * ```
 */
export class GitHubAppTokenProvider implements TokenProvider {
  private readonly auth: GitHubAppAuth;

  /**
   * Create a new GitHub App token provider
   *
   * @param config GitHub App configuration
   * @throws AuthenticationError if private key cannot be loaded
   */
  constructor(config: GitHubAppConfig) {
    this.auth = new GitHubAppAuth(config);
  }

  /**
   * Get a valid authentication token
   *
   * Delegates to GitHubAppAuth.getInstallationToken() which handles
   * caching and automatic refresh.
   *
   * @returns Promise resolving to the installation access token
   * @throws AuthenticationError if token cannot be obtained
   */
  async getToken(): Promise<string> {
    return this.auth.getInstallationToken();
  }

  /**
   * Clear the token cache
   *
   * Forces the next getToken() call to fetch a fresh token.
   */
  clearCache(): void {
    this.auth.clearCache();
  }

  /**
   * Get cache information (for debugging)
   *
   * @returns Cache status or null if no cached token
   */
  getCacheInfo(): { expiresAt: Date; isValid: boolean } | null {
    return this.auth.getCacheInfo();
  }
}
