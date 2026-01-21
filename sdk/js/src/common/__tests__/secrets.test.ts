/**
 * @fractary/core - Secrets Sanitization Tests
 *
 * Comprehensive unit tests for the secrets sanitization utilities.
 */

import {
  sanitizeSecrets,
  containsSecrets,
  isSensitiveKey,
  redactConfig,
  redactValue,
} from '../secrets';

describe('sanitizeSecrets', () => {
  describe('GitHub tokens', () => {
    it('should redact GitHub personal access tokens (ghp_)', () => {
      const input = 'Token: ghp_1234567890abcdefghijklmnopqrstuvwxyz12';
      const result = sanitizeSecrets(input);
      expect(result).toBe('Token: [REDACTED_GITHUB_TOKEN]');
    });

    it('should redact GitHub OAuth tokens (gho_)', () => {
      const input = 'Auth: gho_1234567890abcdefghijklmnopqrstuvwxyz12';
      const result = sanitizeSecrets(input);
      expect(result).toBe('Auth: [REDACTED_GITHUB_TOKEN]');
    });

    it('should redact GitHub user-to-server tokens (ghu_)', () => {
      const input = 'ghu_abcdefghijklmnopqrstuvwxyz1234567890ab';
      const result = sanitizeSecrets(input);
      expect(result).toBe('[REDACTED_GITHUB_TOKEN]');
    });

    it('should redact GitHub server-to-server tokens (ghs_)', () => {
      const input = 'ghs_abcdefghijklmnopqrstuvwxyz1234567890ab';
      const result = sanitizeSecrets(input);
      expect(result).toBe('[REDACTED_GITHUB_TOKEN]');
    });

    it('should redact GitHub refresh tokens (ghr_)', () => {
      const input = 'ghr_abcdefghijklmnopqrstuvwxyz1234567890ab';
      const result = sanitizeSecrets(input);
      expect(result).toBe('[REDACTED_GITHUB_TOKEN]');
    });

    it('should redact multiple GitHub tokens in one string', () => {
      const input =
        'Token1: ghp_abc123456789012345678901234567890123 and Token2: gho_xyz123456789012345678901234567890123';
      const result = sanitizeSecrets(input);
      expect(result).toBe('Token1: [REDACTED_GITHUB_TOKEN] and Token2: [REDACTED_GITHUB_TOKEN]');
    });
  });

  describe('GitLab tokens', () => {
    it('should redact GitLab personal access tokens', () => {
      const input = 'token: glpat-xxxxxxxxxxxxxxxxxxxx';
      const result = sanitizeSecrets(input);
      expect(result).toBe('token: [REDACTED]');
    });

    it('should redact GitLab tokens with hyphens and underscores', () => {
      const input = 'glpat-abc_def-123_456_789_012_345';
      const result = sanitizeSecrets(input);
      expect(result).toBe('[REDACTED_GITLAB_TOKEN]');
    });
  });

  describe('Bearer tokens', () => {
    it('should redact Bearer tokens', () => {
      const input = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0';
      const result = sanitizeSecrets(input);
      expect(result).toBe('Authorization: Bearer [REDACTED]');
    });

    it('should redact Bearer tokens with padding', () => {
      const input = 'Bearer abc123==';
      const result = sanitizeSecrets(input);
      expect(result).toBe('Bearer [REDACTED]');
    });
  });

  describe('Basic auth', () => {
    it('should redact Basic auth tokens', () => {
      const input = 'Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=';
      const result = sanitizeSecrets(input);
      expect(result).toBe('Authorization: Basic [REDACTED]');
    });
  });

  describe('key-value patterns', () => {
    it('should redact token in JSON format', () => {
      const input = '{"token": "secret123"}';
      const result = sanitizeSecrets(input);
      expect(result).toContain('[REDACTED]');
    });

    it('should redact password in config', () => {
      const input = 'password: mysecretpassword';
      const result = sanitizeSecrets(input);
      expect(result).toBe('password: [REDACTED]');
    });

    it('should redact api_key values', () => {
      const input = 'api_key=sk-1234567890abcdefghij';
      const result = sanitizeSecrets(input);
      expect(result).toBe('api_key: [REDACTED]');
    });

    it('should redact secret values', () => {
      const input = 'secret: "my_super_secret_value"';
      const result = sanitizeSecrets(input);
      expect(result).toBe('secret: [REDACTED]');
    });

    it('should redact access_token values', () => {
      const input = 'access_token=abcdef123456';
      const result = sanitizeSecrets(input);
      expect(result).toBe('access_token: [REDACTED]');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(sanitizeSecrets('')).toBe('');
    });

    it('should handle string with no secrets', () => {
      const input = 'This is a normal message with no secrets';
      expect(sanitizeSecrets(input)).toBe(input);
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000) + 'ghp_' + 'b'.repeat(36) + 'c'.repeat(10000);
      const result = sanitizeSecrets(longString);
      expect(result).toContain('[REDACTED_GITHUB_TOKEN]');
      expect(result).not.toContain('ghp_');
    });

    it('should handle strings with special characters', () => {
      const input = 'token: ghp_abc123!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = sanitizeSecrets(input);
      expect(result).toContain('[REDACTED]');
    });
  });
});

describe('containsSecrets', () => {
  it('should detect token keyword', () => {
    expect(containsSecrets('my token is here')).toBe(true);
  });

  it('should detect password keyword', () => {
    expect(containsSecrets('enter your password')).toBe(true);
  });

  it('should detect secret keyword', () => {
    expect(containsSecrets('this is a secret')).toBe(true);
  });

  it('should detect api_key keyword', () => {
    expect(containsSecrets('set your api_key')).toBe(true);
  });

  it('should detect api-key keyword', () => {
    expect(containsSecrets('set your api-key')).toBe(true);
  });

  it('should detect bearer keyword', () => {
    expect(containsSecrets('Bearer token required')).toBe(true);
  });

  it('should detect authorization keyword', () => {
    expect(containsSecrets('Authorization header')).toBe(true);
  });

  it('should detect GitHub token prefix', () => {
    expect(containsSecrets('ghp_token')).toBe(true);
    expect(containsSecrets('gho_token')).toBe(true);
  });

  it('should detect GitLab token prefix', () => {
    expect(containsSecrets('glpat-token')).toBe(true);
  });

  it('should return false for normal text', () => {
    expect(containsSecrets('hello world')).toBe(false);
    expect(containsSecrets('this is normal text')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(containsSecrets('TOKEN')).toBe(true);
    expect(containsSecrets('Password')).toBe(true);
    expect(containsSecrets('SECRET')).toBe(true);
  });
});

describe('isSensitiveKey', () => {
  it('should identify token keys', () => {
    expect(isSensitiveKey('token')).toBe(true);
    expect(isSensitiveKey('access_token')).toBe(true);
    expect(isSensitiveKey('refresh_token')).toBe(true);
    expect(isSensitiveKey('GITHUB_TOKEN')).toBe(true);
  });

  it('should identify key keys', () => {
    expect(isSensitiveKey('api_key')).toBe(true);
    expect(isSensitiveKey('apiKey')).toBe(true);
    expect(isSensitiveKey('private_key')).toBe(true);
  });

  it('should identify secret keys', () => {
    expect(isSensitiveKey('secret')).toBe(true);
    expect(isSensitiveKey('client_secret')).toBe(true);
    expect(isSensitiveKey('SECRET_KEY')).toBe(true);
  });

  it('should identify password keys', () => {
    expect(isSensitiveKey('password')).toBe(true);
    expect(isSensitiveKey('db_password')).toBe(true);
    expect(isSensitiveKey('PASSWORD')).toBe(true);
  });

  it('should identify auth keys', () => {
    expect(isSensitiveKey('auth')).toBe(true);
    expect(isSensitiveKey('authorization')).toBe(true);
    expect(isSensitiveKey('auth_token')).toBe(true);
  });

  it('should return false for non-sensitive keys', () => {
    expect(isSensitiveKey('name')).toBe(false);
    expect(isSensitiveKey('email')).toBe(false);
    expect(isSensitiveKey('description')).toBe(false);
    expect(isSensitiveKey('owner')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(isSensitiveKey('TOKEN')).toBe(true);
    expect(isSensitiveKey('Token')).toBe(true);
    expect(isSensitiveKey('tOkEn')).toBe(true);
  });
});

describe('redactConfig', () => {
  it('should redact top-level token values', () => {
    const config = { token: 'secret123', owner: 'myorg' };
    const result = redactConfig(config) as typeof config;
    expect(result.token).toBe('********');
    expect(result.owner).toBe('myorg');
  });

  it('should redact nested sensitive values', () => {
    const config = {
      github: {
        token: 'ghp_secret',
        owner: 'myorg',
      },
    };
    const result = redactConfig(config) as typeof config;
    expect(result.github.token).toBe('********');
    expect(result.github.owner).toBe('myorg');
  });

  it('should redact deeply nested values', () => {
    const config = {
      level1: {
        level2: {
          level3: {
            api_key: 'secret',
          },
        },
      },
    };
    const result = redactConfig(config) as typeof config;
    expect(result.level1.level2.level3.api_key).toBe('********');
  });

  it('should preserve environment variable references', () => {
    const config = { token: '${GITHUB_TOKEN}', secret: '${MY_SECRET}' };
    const result = redactConfig(config) as typeof config;
    expect(result.token).toBe('${GITHUB_TOKEN}');
    expect(result.secret).toBe('${MY_SECRET}');
  });

  it('should not mutate original config', () => {
    const original = { token: 'secret123' };
    const originalToken = original.token;
    redactConfig(original);
    expect(original.token).toBe(originalToken);
  });

  it('should handle null and undefined', () => {
    expect(redactConfig(null)).toBe(null);
    expect(redactConfig(undefined)).toBe(undefined);
  });

  it('should handle arrays in config', () => {
    const config = {
      handlers: [{ token: 'secret1' }, { token: 'secret2' }],
    };
    const result = redactConfig(config) as typeof config;
    expect(result.handlers[0].token).toBe('********');
    expect(result.handlers[1].token).toBe('********');
  });

  it('should handle mixed content', () => {
    const config = {
      work: {
        active_handler: 'github',
        handlers: {
          github: {
            token: 'ghp_secret',
            owner: 'myorg',
            repo: 'myrepo',
          },
        },
      },
      repo: {
        defaults: {
          default_branch: 'main',
        },
      },
    };
    const result = redactConfig(config) as typeof config;
    expect(result.work.handlers.github.token).toBe('********');
    expect(result.work.handlers.github.owner).toBe('myorg');
    expect(result.work.active_handler).toBe('github');
    expect(result.repo.defaults.default_branch).toBe('main');
  });
});

describe('redactValue', () => {
  it('should redact value when key is sensitive', () => {
    expect(redactValue('secret123', 'token')).toBe('********');
    expect(redactValue('secret123', 'password')).toBe('********');
    expect(redactValue('secret123', 'api_key')).toBe('********');
  });

  it('should preserve env var references even with sensitive key', () => {
    expect(redactValue('${GITHUB_TOKEN}', 'token')).toBe('${GITHUB_TOKEN}');
    expect(redactValue('${DB_PASSWORD}', 'password')).toBe('${DB_PASSWORD}');
  });

  it('should redact GitHub tokens regardless of key', () => {
    expect(redactValue('ghp_1234567890abcdefghijklmnopqrstuvwxyz12')).toBe(
      '[REDACTED_GITHUB_TOKEN]'
    );
  });

  it('should redact GitLab tokens regardless of key', () => {
    expect(redactValue('glpat-xxxxxxxxxxxxxxxxxxxx')).toBe('[REDACTED_GITLAB_TOKEN]');
  });

  it('should return original value for non-sensitive content', () => {
    expect(redactValue('myorg', 'owner')).toBe('myorg');
    expect(redactValue('main', 'branch')).toBe('main');
  });
});

describe('performance', () => {
  it('should handle large strings efficiently', () => {
    const largeString = 'x'.repeat(100000);
    const start = Date.now();
    sanitizeSecrets(largeString);
    const elapsed = Date.now() - start;
    // Should complete in under 100ms
    expect(elapsed).toBeLessThan(100);
  });

  it('should handle many secrets efficiently', () => {
    const manySecrets = Array(100)
      .fill('token: ghp_1234567890abcdefghijklmnopqrstuvwxyz12')
      .join('\n');
    const start = Date.now();
    const result = sanitizeSecrets(manySecrets);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
    expect(result).not.toContain('ghp_');
  });
});
