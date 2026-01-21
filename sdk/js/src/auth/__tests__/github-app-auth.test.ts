/**
 * Unit tests for GitHubAppAuth
 */

import { GitHubAppAuth } from '../github-app-auth';
import { AuthenticationError } from '../../common/errors';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked.jwt.token'),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Sample PEM key for testing (just needs to look like a PEM)
const SAMPLE_PEM_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy0AHB7MaXsNxkTMnMQgKpq
-----END RSA PRIVATE KEY-----`;

describe('GitHubAppAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.GITHUB_APP_PRIVATE_KEY;
  });

  describe('constructor', () => {
    it('should throw if neither private_key_path nor private_key_env_var is provided', () => {
      expect(() => new GitHubAppAuth({
        id: '123',
        installation_id: '456',
      })).toThrow('GitHub App config must specify either private_key_path or private_key_env_var');
    });

    it('should throw if private key file does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);

      expect(() => new GitHubAppAuth({
        id: '123',
        installation_id: '456',
        private_key_path: '/path/to/nonexistent.pem',
      })).toThrow('Private key file not found');
    });

    it('should load private key from file', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(SAMPLE_PEM_KEY);

      const auth = new GitHubAppAuth({
        id: '123',
        installation_id: '456',
        private_key_path: '/path/to/key.pem',
      });

      expect(auth).toBeInstanceOf(GitHubAppAuth);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith('/path/to/key.pem', 'utf-8');
    });

    it('should throw if env var is not set', () => {
      expect(() => new GitHubAppAuth({
        id: '123',
        installation_id: '456',
        private_key_env_var: 'GITHUB_APP_PRIVATE_KEY',
      })).toThrow('Environment variable GITHUB_APP_PRIVATE_KEY is not set');
    });

    it('should decode base64 private key from env var', () => {
      const base64Key = Buffer.from(SAMPLE_PEM_KEY).toString('base64');
      process.env.GITHUB_APP_PRIVATE_KEY = base64Key;

      const auth = new GitHubAppAuth({
        id: '123',
        installation_id: '456',
        private_key_env_var: 'GITHUB_APP_PRIVATE_KEY',
      });

      expect(auth).toBeInstanceOf(GitHubAppAuth);
    });

    it('should throw if decoded env var is not a PEM key', () => {
      process.env.GITHUB_APP_PRIVATE_KEY = Buffer.from('not a pem key').toString('base64');

      expect(() => new GitHubAppAuth({
        id: '123',
        installation_id: '456',
        private_key_env_var: 'GITHUB_APP_PRIVATE_KEY',
      })).toThrow('does not appear to be a PEM key');
    });
  });

  describe('getInstallationToken', () => {
    let auth: GitHubAppAuth;

    beforeEach(() => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(SAMPLE_PEM_KEY);

      auth = new GitHubAppAuth({
        id: '123',
        installation_id: '456',
        private_key_path: '/path/to/key.pem',
      });
    });

    it('should fetch token from GitHub API', async () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'ghs_testToken', expires_at: expiresAt }),
      });

      const token = await auth.getInstallationToken();

      expect(token).toBe('ghs_testToken');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/app/installations/456/access_tokens',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          }),
        })
      );
    });

    it('should cache the token', async () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'ghs_cached', expires_at: expiresAt }),
      });

      // First call - should fetch
      const token1 = await auth.getInstallationToken();
      expect(token1).toBe('ghs_cached');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const token2 = await auth.getInstallationToken();
      expect(token2).toBe('ghs_cached');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, no new fetch
    });

    it('should refresh token before expiration (5 min buffer)', async () => {
      // Token that expires in 4 minutes (within 5-min buffer)
      const expiresAt = new Date(Date.now() + 4 * 60 * 1000).toISOString();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'ghs_expiring', expires_at: expiresAt }),
      });

      await auth.getInstallationToken();

      // Set up mock for refresh
      const newExpiresAt = new Date(Date.now() + 3600000).toISOString();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'ghs_refreshed', expires_at: newExpiresAt }),
      });

      // Next call should trigger refresh because within buffer
      const token = await auth.getInstallationToken();
      expect(token).toBe('ghs_refreshed');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw AuthenticationError on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      await expect(auth.getInstallationToken()).rejects.toThrow(AuthenticationError);
    });

    describe('race condition prevention', () => {
      it('should share pending request between concurrent calls', async () => {
        const expiresAt = new Date(Date.now() + 3600000).toISOString();
        let resolvePromise: (value: Response) => void;

        // Create a delayed response
        mockFetch.mockReturnValueOnce(new Promise<Response>((resolve) => {
          resolvePromise = resolve;
        }));

        // Start multiple concurrent requests
        const promise1 = auth.getInstallationToken();
        const promise2 = auth.getInstallationToken();
        const promise3 = auth.getInstallationToken();

        // All should be waiting on the same request
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Resolve the request
        resolvePromise!({
          ok: true,
          json: async () => ({ token: 'ghs_shared', expires_at: expiresAt }),
        } as Response);

        // All promises should resolve to the same token
        const [token1, token2, token3] = await Promise.all([promise1, promise2, promise3]);

        expect(token1).toBe('ghs_shared');
        expect(token2).toBe('ghs_shared');
        expect(token3).toBe('ghs_shared');
        expect(mockFetch).toHaveBeenCalledTimes(1); // Only one fetch call
      });

      it('should clear pending request after completion', async () => {
        const expiresAt = new Date(Date.now() + 100).toISOString(); // Expires immediately

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ token: 'ghs_first', expires_at: expiresAt }),
        });

        await auth.getInstallationToken();

        // Clear cache to force new request
        auth.clearCache();

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ token: 'ghs_second', expires_at: new Date(Date.now() + 3600000).toISOString() }),
        });

        const token = await auth.getInstallationToken();

        expect(token).toBe('ghs_second');
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      it('should clear pending request on error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(auth.getInstallationToken()).rejects.toThrow();

        // Next call should try again (not reuse failed promise)
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ token: 'ghs_retry', expires_at: new Date(Date.now() + 3600000).toISOString() }),
        });

        const token = await auth.getInstallationToken();
        expect(token).toBe('ghs_retry');
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('clearCache', () => {
    it('should clear cached token', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(SAMPLE_PEM_KEY);

      const auth = new GitHubAppAuth({
        id: '123',
        installation_id: '456',
        private_key_path: '/path/to/key.pem',
      });

      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ token: 'ghs_token', expires_at: expiresAt }),
      });

      await auth.getInstallationToken();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      auth.clearCache();

      await auth.getInstallationToken();
      expect(mockFetch).toHaveBeenCalledTimes(2); // New fetch after cache clear
    });
  });

  describe('getCacheInfo', () => {
    it('should return null when no token is cached', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(SAMPLE_PEM_KEY);

      const auth = new GitHubAppAuth({
        id: '123',
        installation_id: '456',
        private_key_path: '/path/to/key.pem',
      });

      expect(auth.getCacheInfo()).toBeNull();
    });

    it('should return cache info when token is cached', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(SAMPLE_PEM_KEY);

      const auth = new GitHubAppAuth({
        id: '123',
        installation_id: '456',
        private_key_path: '/path/to/key.pem',
      });

      const expiresAt = new Date(Date.now() + 3600000);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'ghs_token', expires_at: expiresAt.toISOString() }),
      });

      await auth.getInstallationToken();

      const cacheInfo = auth.getCacheInfo();
      expect(cacheInfo).not.toBeNull();
      expect(cacheInfo?.isValid).toBe(true);
      expect(cacheInfo?.expiresAt).toEqual(expiresAt);
    });
  });
});
