/**
 * Unit tests for StaticTokenProvider
 */

import { StaticTokenProvider } from '../static-token-provider';

describe('StaticTokenProvider', () => {
  describe('constructor', () => {
    it('should accept a valid token string', () => {
      const provider = new StaticTokenProvider('ghp_test123');
      expect(provider).toBeInstanceOf(StaticTokenProvider);
    });

    it('should throw error for empty string', () => {
      expect(() => new StaticTokenProvider('')).toThrow('Token must be a non-empty string');
    });

    it('should throw error for whitespace-only string', () => {
      expect(() => new StaticTokenProvider('   ')).toThrow('Token must be a non-empty string');
    });

    it('should throw error for undefined', () => {
      expect(() => new StaticTokenProvider(undefined as unknown as string)).toThrow('Token must be a non-empty string');
    });

    it('should throw error for null', () => {
      expect(() => new StaticTokenProvider(null as unknown as string)).toThrow('Token must be a non-empty string');
    });

    it('should throw error for non-string values', () => {
      expect(() => new StaticTokenProvider(123 as unknown as string)).toThrow('Token must be a non-empty string');
    });
  });

  describe('getToken', () => {
    it('should return the token', async () => {
      const token = 'ghp_testToken123';
      const provider = new StaticTokenProvider(token);

      const result = await provider.getToken();

      expect(result).toBe(token);
    });

    it('should return the same token on multiple calls', async () => {
      const token = 'ghp_testToken456';
      const provider = new StaticTokenProvider(token);

      const result1 = await provider.getToken();
      const result2 = await provider.getToken();
      const result3 = await provider.getToken();

      expect(result1).toBe(token);
      expect(result2).toBe(token);
      expect(result3).toBe(token);
    });

    it('should handle tokens with special characters', async () => {
      const token = 'github_pat_1234567890abcdef_GHIJKL';
      const provider = new StaticTokenProvider(token);

      const result = await provider.getToken();

      expect(result).toBe(token);
    });
  });
});
