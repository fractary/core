/**
 * @fractary/core - GitHub App Authentication
 *
 * Full GitHub App authentication with JWT generation, token exchange, and caching.
 */

import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import type { GitHubAppConfig } from './types';
import { AuthenticationError } from '../common/errors';

/**
 * Cached installation access token
 */
interface CachedToken {
  token: string;
  expiresAt: Date;
}

/**
 * GitHub App authentication handler
 *
 * Handles the complete GitHub App authentication flow:
 * 1. Generates JWT signed with the app's private key
 * 2. Exchanges JWT for an installation access token via GitHub API
 * 3. Caches tokens and auto-refreshes before expiration
 *
 * @example
 * ```typescript
 * const auth = new GitHubAppAuth({
 *   id: '123456',
 *   installation_id: '789012',
 *   private_key_path: '/path/to/private-key.pem'
 * });
 *
 * const token = await auth.getInstallationToken();
 * ```
 */
export class GitHubAppAuth {
  private readonly config: GitHubAppConfig;
  private readonly privateKey: string;
  private cachedToken: CachedToken | null = null;

  /** Token refresh buffer - refresh 5 minutes before expiration */
  private static readonly REFRESH_BUFFER_MS = 5 * 60 * 1000;

  /** JWT expiration time - 10 minutes (GitHub's maximum) */
  private static readonly JWT_EXPIRATION_SECONDS = 600;

  /**
   * Create a new GitHub App authentication handler
   *
   * @param config GitHub App configuration
   * @throws AuthenticationError if private key cannot be loaded
   */
  constructor(config: GitHubAppConfig) {
    this.config = config;
    this.privateKey = this.loadPrivateKey();
  }

  /**
   * Load private key from file or environment variable
   *
   * @returns The PEM-encoded private key
   * @throws AuthenticationError if private key cannot be loaded
   */
  private loadPrivateKey(): string {
    // Try loading from file path first
    if (this.config.private_key_path) {
      try {
        const keyPath = this.config.private_key_path;
        if (!fs.existsSync(keyPath)) {
          throw new AuthenticationError(
            'github-app',
            `Private key file not found: ${keyPath}`
          );
        }
        return fs.readFileSync(keyPath, 'utf-8');
      } catch (error) {
        if (error instanceof AuthenticationError) throw error;
        throw new AuthenticationError(
          'github-app',
          `Failed to read private key file: ${(error as Error).message}`
        );
      }
    }

    // Try loading from environment variable (base64-encoded)
    if (this.config.private_key_env_var) {
      const envValue = process.env[this.config.private_key_env_var];
      if (!envValue) {
        throw new AuthenticationError(
          'github-app',
          `Environment variable ${this.config.private_key_env_var} is not set`
        );
      }

      try {
        // Decode base64-encoded private key
        const decoded = Buffer.from(envValue, 'base64').toString('utf-8');
        if (!decoded.includes('-----BEGIN')) {
          throw new Error('Decoded value does not appear to be a PEM key');
        }
        return decoded;
      } catch (error) {
        throw new AuthenticationError(
          'github-app',
          `Failed to decode private key from ${this.config.private_key_env_var}: ${(error as Error).message}`
        );
      }
    }

    throw new AuthenticationError(
      'github-app',
      'GitHub App config must specify either private_key_path or private_key_env_var'
    );
  }

  /**
   * Generate a JWT for GitHub App authentication
   *
   * The JWT is signed with the app's private key using RS256.
   *
   * @returns Signed JWT string
   */
  private generateJWT(): string {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      // Issued at time (60 seconds in the past to account for clock drift)
      iat: now - 60,
      // Expiration time (10 minutes from now)
      exp: now + GitHubAppAuth.JWT_EXPIRATION_SECONDS,
      // GitHub App's identifier
      iss: this.config.id,
    };

    return jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
  }

  /**
   * Exchange JWT for an installation access token
   *
   * @returns Installation access token response from GitHub
   * @throws AuthenticationError if token exchange fails
   */
  private async exchangeJWTForToken(): Promise<{ token: string; expires_at: string }> {
    const jwtToken = this.generateJWT();
    const url = `https://api.github.com/app/installations/${this.config.installation_id}/access_tokens`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${jwtToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new AuthenticationError(
          'github-app',
          `GitHub API returned ${response.status}: ${errorBody}`
        );
      }

      const data = await response.json() as { token: string; expires_at: string };
      return data;
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      throw new AuthenticationError(
        'github-app',
        `Failed to exchange JWT for installation token: ${(error as Error).message}`
      );
    }
  }

  /**
   * Check if the cached token is still valid
   *
   * A token is considered valid if it exists and won't expire within
   * the refresh buffer window (5 minutes).
   *
   * @returns true if cached token is valid and not near expiration
   */
  private isCachedTokenValid(): boolean {
    if (!this.cachedToken) return false;

    const now = new Date();
    const expirationWithBuffer = new Date(
      this.cachedToken.expiresAt.getTime() - GitHubAppAuth.REFRESH_BUFFER_MS
    );

    return now < expirationWithBuffer;
  }

  /**
   * Get a valid installation access token
   *
   * Returns a cached token if still valid, otherwise generates a new one.
   * Tokens are automatically refreshed 5 minutes before expiration.
   *
   * @returns Installation access token string
   * @throws AuthenticationError if token cannot be obtained
   */
  async getInstallationToken(): Promise<string> {
    // Return cached token if still valid
    if (this.isCachedTokenValid()) {
      return this.cachedToken!.token;
    }

    // Exchange JWT for new installation token
    const response = await this.exchangeJWTForToken();

    // Cache the token
    this.cachedToken = {
      token: response.token,
      expiresAt: new Date(response.expires_at),
    };

    return response.token;
  }

  /**
   * Clear the cached token
   *
   * Forces the next getInstallationToken() call to fetch a fresh token.
   */
  clearCache(): void {
    this.cachedToken = null;
  }

  /**
   * Get information about the cached token (for debugging)
   *
   * @returns Object with cache status, or null if no cached token
   */
  getCacheInfo(): { expiresAt: Date; isValid: boolean } | null {
    if (!this.cachedToken) return null;

    return {
      expiresAt: this.cachedToken.expiresAt,
      isValid: this.isCachedTokenValid(),
    };
  }
}
