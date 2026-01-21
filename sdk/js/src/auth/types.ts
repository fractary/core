/**
 * @fractary/core - Authentication Types
 *
 * Token provider interfaces and configuration types for GitHub authentication.
 */

/**
 * Token provider interface for authentication
 *
 * Implementations must provide a way to get a valid authentication token.
 * Tokens may be cached and auto-refreshed by implementations.
 */
export interface TokenProvider {
  /**
   * Get a valid authentication token
   *
   * @returns Promise resolving to the token string
   * @throws AuthenticationError if token cannot be obtained
   */
  getToken(): Promise<string>;
}

/**
 * GitHub App configuration
 *
 * Used to configure GitHub App authentication with JWT exchange.
 */
export interface GitHubAppConfig {
  /** GitHub App ID */
  id: string;
  /** Installation ID for the target organization/repository */
  installation_id: string;
  /** Path to the private key PEM file (mutually exclusive with private_key_env_var) */
  private_key_path?: string;
  /** Environment variable containing base64-encoded private key (mutually exclusive with private_key_path) */
  private_key_env_var?: string;
}

/**
 * GitHub configuration from yaml config
 */
export interface GitHubConfig {
  /** Personal access token (PAT) */
  token?: string;
  /** GitHub organization name */
  organization?: string;
  /** GitHub project (owner/repo) */
  project?: string;
  /** GitHub App configuration (alternative to PAT) */
  app?: GitHubAppConfig;
}
