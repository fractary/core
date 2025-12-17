import { describe, it, expect } from '@jest/globals';
import { validatePath, validatePaths, sanitizeSecrets, containsSecrets } from '../handlers/security.js';

describe('Security Functions', () => {
  describe('validatePath', () => {
    const basePath = '/app/data';

    it('should allow valid paths within base directory', () => {
      expect(validatePath('file.txt', basePath)).toBe('file.txt');
      expect(validatePath('subdir/file.txt', basePath)).toBe('subdir/file.txt');
      expect(validatePath('./file.txt', basePath)).toBe('file.txt');
    });

    it('should prevent directory traversal attacks', () => {
      expect(() => validatePath('../../../etc/passwd', basePath)).toThrow('Path traversal detected');
      expect(() => validatePath('../../file.txt', basePath)).toThrow('Path traversal detected');
      expect(() => validatePath('../file.txt', basePath)).toThrow('Path traversal detected');
    });

    it('should prevent absolute path escapes', () => {
      expect(() => validatePath('/etc/passwd', basePath)).toThrow('Path traversal detected');
      expect(() => validatePath('/tmp/malicious', basePath)).toThrow('Path traversal detected');
    });

    it('should handle complex traversal attempts', () => {
      expect(() => validatePath('subdir/../../etc/passwd', basePath)).toThrow('Path traversal detected');
      expect(() => validatePath('a/b/c/../../../etc/passwd', basePath)).toThrow('Path traversal detected');
    });

    it('should normalize paths with . segments', () => {
      expect(validatePath('a/./b/./c.txt', basePath)).toBe('a/b/c.txt');
      expect(validatePath('./a/./b.txt', basePath)).toBe('a/b.txt');
    });

    it('should handle empty and root paths', () => {
      expect(validatePath('', basePath)).toBe('');
      expect(validatePath('.', basePath)).toBe('');
    });
  });

  describe('validatePaths', () => {
    const basePath = '/app/data';

    it('should validate multiple paths successfully', () => {
      const paths = ['file1.txt', 'subdir/file2.txt', 'a/b/file3.txt'];
      const result = validatePaths(paths, basePath);
      expect(result).toEqual(paths);
    });

    it('should reject if any path is invalid', () => {
      const paths = ['file1.txt', '../../../etc/passwd', 'file3.txt'];
      expect(() => validatePaths(paths, basePath)).toThrow('Path traversal detected');
    });

    it('should handle empty array', () => {
      expect(validatePaths([], basePath)).toEqual([]);
    });
  });

  describe('sanitizeSecrets', () => {
    it('should redact tokens in JSON-like structures', () => {
      const input = 'Error: {"token": "ghp_abc123xyz", "key": "secret123"}';
      const output = sanitizeSecrets(input);
      expect(output).toContain('[REDACTED]');
      expect(output).not.toContain('ghp_abc123xyz');
      expect(output).not.toContain('secret123');
    });

    it('should redact bearer tokens', () => {
      const input = 'Authorization: Bearer abc123xyz789';
      const output = sanitizeSecrets(input);
      expect(output).toBe('Authorization: Bearer [REDACTED]');
    });

    it('should redact basic auth', () => {
      const input = 'Authorization: Basic dXNlcjpwYXNz';
      const output = sanitizeSecrets(input);
      expect(output).toBe('Authorization: Basic [REDACTED]');
    });

    it('should redact GitHub tokens', () => {
      const input = 'Using token: ghp_1234567890abcdefghijklmnopqrstuv';
      const output = sanitizeSecrets(input);
      expect(output).toContain('[REDACTED_GITHUB_TOKEN]');
      expect(output).not.toContain('ghp_');
    });

    it('should redact GitLab tokens', () => {
      const input = 'Token: glpat-abcdefghij1234567890';
      const output = sanitizeSecrets(input);
      expect(output).toContain('[REDACTED_GITLAB_TOKEN]');
      expect(output).not.toContain('glpat-');
    });

    it('should redact multiple secret types in same string', () => {
      const input = 'token: abc123, password: xyz789, api_key: secret999';
      const output = sanitizeSecrets(input);
      expect(output).not.toContain('abc123');
      expect(output).not.toContain('xyz789');
      expect(output).not.toContain('secret999');
      expect(output).toContain('[REDACTED]');
    });

    it('should handle various token formats', () => {
      const testCases = [
        { input: 'token="abc123"', shouldNotContain: 'abc123' },
        { input: "token='xyz789'", shouldNotContain: 'xyz789' },
        { input: 'token:abc123', shouldNotContain: 'abc123' },
        { input: 'token: abc123', shouldNotContain: 'abc123' },
        { input: 'token = abc123', shouldNotContain: 'abc123' },
      ];

      testCases.forEach(({ input, shouldNotContain }) => {
        const output = sanitizeSecrets(input);
        expect(output).not.toContain(shouldNotContain);
      });
    });

    it('should preserve non-secret content', () => {
      const input = 'Error loading config from /path/to/file: Invalid JSON';
      const output = sanitizeSecrets(input);
      expect(output).toBe(input); // No secrets to redact
    });

    it('should handle empty and null input', () => {
      expect(sanitizeSecrets('')).toBe('');
      expect(sanitizeSecrets('no secrets here')).toBe('no secrets here');
    });
  });

  describe('containsSecrets', () => {
    it('should detect common secret keywords', () => {
      expect(containsSecrets('token: abc123')).toBe(true);
      expect(containsSecrets('password: xyz')).toBe(true);
      expect(containsSecrets('api_key: 123')).toBe(true);
      expect(containsSecrets('bearer abc')).toBe(true);
      expect(containsSecrets('Authorization header')).toBe(true);
    });

    it('should detect platform-specific tokens', () => {
      expect(containsSecrets('ghp_abcd')).toBe(true);
      expect(containsSecrets('gho_xyz')).toBe(true);
      expect(containsSecrets('glpat-abc')).toBe(true);
    });

    it('should return false for non-secret content', () => {
      expect(containsSecrets('Hello world')).toBe(false);
      expect(containsSecrets('Error: file not found')).toBe(false);
      expect(containsSecrets('config.json')).toBe(false);
    });

    it('should be case-insensitive for keywords', () => {
      expect(containsSecrets('TOKEN: abc')).toBe(true);
      expect(containsSecrets('Password: xyz')).toBe(true);
      expect(containsSecrets('BEARER token')).toBe(true);
    });
  });
});
