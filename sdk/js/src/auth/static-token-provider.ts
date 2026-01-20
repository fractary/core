/**
 * @fractary/core - Static Token Provider
 *
 * Simple token provider for Personal Access Token (PAT) authentication.
 */

import type { TokenProvider } from './types';

/**
 * Static token provider for PAT authentication
 *
 * Provides a simple implementation that returns a static token.
 * Suitable for Personal Access Token (PAT) authentication.
 *
 * @example
 * ```typescript
 * const provider = new StaticTokenProvider('ghp_xxxx');
 * const token = await provider.getToken();
 * ```
 */
export class StaticTokenProvider implements TokenProvider {
  private readonly token: string;

  /**
   * Create a new static token provider
   *
   * @param token The authentication token (e.g., GitHub PAT)
   * @throws Error if token is empty or undefined
   */
  constructor(token: string) {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Token must be a non-empty string');
    }
    this.token = token;
  }

  /**
   * Get the authentication token
   *
   * @returns Promise resolving to the token string
   */
  async getToken(): Promise<string> {
    return this.token;
  }
}
