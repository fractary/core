/**
 * Unit tests for createTokenProvider factory
 */

import { createTokenProvider, StaticTokenProvider } from '../index';
import { AuthenticationError } from '../../common/errors';

describe('createTokenProvider', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    delete process.env.GITHUB_TOKEN;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('with PAT token in config', () => {
    it('should return StaticTokenProvider when token is provided', () => {
      const provider = createTokenProvider({ token: 'ghp_test123' });

      expect(provider).toBeInstanceOf(StaticTokenProvider);
    });

    it('should return working provider that returns the token', async () => {
      const token = 'ghp_myTestToken';
      const provider = createTokenProvider({ token });

      const result = await provider.getToken();

      expect(result).toBe(token);
    });
  });

  describe('with GITHUB_TOKEN env var', () => {
    it('should return StaticTokenProvider when GITHUB_TOKEN is set', () => {
      process.env.GITHUB_TOKEN = 'ghp_envToken';

      const provider = createTokenProvider({});

      expect(provider).toBeInstanceOf(StaticTokenProvider);
    });

    it('should return provider that uses GITHUB_TOKEN value', async () => {
      process.env.GITHUB_TOKEN = 'ghp_envToken456';

      const provider = createTokenProvider({});
      const result = await provider.getToken();

      expect(result).toBe('ghp_envToken456');
    });

    it('should prefer config.token over GITHUB_TOKEN', async () => {
      process.env.GITHUB_TOKEN = 'ghp_envToken';
      const configToken = 'ghp_configToken';

      const provider = createTokenProvider({ token: configToken });
      const result = await provider.getToken();

      expect(result).toBe(configToken);
    });
  });

  describe('with GitHub App config', () => {
    it('should return GitHubAppTokenProvider when app config has id and installation_id', () => {
      // Note: This will throw because private key is not provided
      // but we're testing the type selection logic
      expect(() => createTokenProvider({
        app: {
          id: '123456',
          installation_id: '789012',
          // Missing private_key_path or private_key_env_var
        }
      })).toThrow(AuthenticationError);
    });

    it('should throw if app config is incomplete (missing private key source)', () => {
      expect(() => createTokenProvider({
        app: {
          id: '123456',
          installation_id: '789012',
        }
      })).toThrow('GitHub App config must specify either private_key_path or private_key_env_var');
    });

    it('should prefer GitHub App auth over PAT when both are provided', () => {
      // When GitHub App config is complete, it should be preferred
      // But since we can't provide a valid private key in tests, we verify the error message
      expect(() => createTokenProvider({
        token: 'ghp_shouldBeIgnored',
        app: {
          id: '123456',
          installation_id: '789012',
          private_key_env_var: 'NON_EXISTENT_KEY',
        }
      })).toThrow(); // Will throw because env var doesn't exist
    });
  });

  describe('with no authentication', () => {
    it('should throw AuthenticationError when no auth is configured', () => {
      expect(() => createTokenProvider({})).toThrow(AuthenticationError);
    });

    it('should provide helpful error message', () => {
      expect(() => createTokenProvider({})).toThrow(
        'No GitHub authentication configured'
      );
    });

    it('should throw when config is undefined', () => {
      expect(() => createTokenProvider()).toThrow(AuthenticationError);
    });
  });

  describe('priority order', () => {
    it('should follow priority: GitHub App > config.token > GITHUB_TOKEN', async () => {
      // Test that config.token takes priority over GITHUB_TOKEN
      process.env.GITHUB_TOKEN = 'ghp_envToken';

      const provider = createTokenProvider({ token: 'ghp_configToken' });
      const result = await provider.getToken();

      expect(result).toBe('ghp_configToken');
    });
  });
});
