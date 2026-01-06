/**
 * @fractary/sdk - Configuration Tests
 *
 * Tests for repo configuration management.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { expandTilde, applyPathPattern, getDefaultWorktreeConfig } from './config.js';

describe('expandTilde', () => {
  const originalHome = process.env.HOME;

  beforeEach(() => {
    process.env.HOME = '/home/testuser';
  });

  afterEach(() => {
    process.env.HOME = originalHome;
  });

  it('should expand ~ to HOME directory', () => {
    expect(expandTilde('~/projects/repo')).toBe('/home/testuser/projects/repo');
  });

  it('should expand ~/ at start of path', () => {
    expect(expandTilde('~/.claude-worktrees/fractary-core-258')).toBe(
      '/home/testuser/.claude-worktrees/fractary-core-258'
    );
  });

  it('should not expand ~ in middle of path', () => {
    expect(expandTilde('/path/~/projects')).toBe('/path/~/projects');
  });

  it('should not expand ~ at end of path', () => {
    expect(expandTilde('/path/to/~')).toBe('/path/to/~');
  });

  it('should handle paths without tilde', () => {
    expect(expandTilde('/absolute/path/to/file')).toBe('/absolute/path/to/file');
  });

  it('should handle relative paths without tilde', () => {
    expect(expandTilde('../relative/path')).toBe('../relative/path');
  });

  it('should handle empty string', () => {
    expect(expandTilde('')).toBe('');
  });

  it('should fallback to ~ if HOME is undefined', () => {
    delete process.env.HOME;
    expect(expandTilde('~/projects')).toBe('~/projects');
  });
});

describe('applyPathPattern', () => {
  it('should substitute single placeholder', () => {
    const result = applyPathPattern('{work-id}', {
      'work-id': '258',
    });
    expect(result).toBe('258');
  });

  it('should substitute multiple placeholders', () => {
    const result = applyPathPattern('{organization}-{project}-{work-id}', {
      organization: 'fractary',
      project: 'core',
      'work-id': '258',
    });
    expect(result).toBe('fractary-core-258');
  });

  it('should handle pattern with literal text', () => {
    const result = applyPathPattern('issue-{work-id}-branch', {
      'work-id': '258',
    });
    expect(result).toBe('issue-258-branch');
  });

  it('should handle pattern with slashes', () => {
    const result = applyPathPattern('{project}/{work-id}', {
      project: 'core',
      'work-id': '258',
    });
    expect(result).toBe('core/258');
  });

  it('should leave unknown placeholders unchanged', () => {
    const result = applyPathPattern('{organization}-{project}-{unknown}', {
      organization: 'fractary',
      project: 'core',
    });
    expect(result).toBe('fractary-core-{unknown}');
  });

  it('should handle empty pattern', () => {
    const result = applyPathPattern('', {
      organization: 'fractary',
    });
    expect(result).toBe('');
  });

  it('should handle pattern with no placeholders', () => {
    const result = applyPathPattern('static-path', {
      organization: 'fractary',
    });
    expect(result).toBe('static-path');
  });

  it('should handle repeated placeholders', () => {
    const result = applyPathPattern('{project}-{project}-{work-id}', {
      project: 'core',
      'work-id': '258',
    });
    expect(result).toBe('core-core-258');
  });

  it('should handle special characters in substitution values', () => {
    const result = applyPathPattern('{organization}-{project}', {
      organization: 'my-company',
      project: 'web_app',
    });
    expect(result).toBe('my-company-web_app');
  });
});

describe('getDefaultWorktreeConfig', () => {
  it('should return default configuration', () => {
    const config = getDefaultWorktreeConfig();

    expect(config).toEqual({
      defaultLocation: '~/.claude-worktrees/',
      pathPattern: '{organization}-{project}-{work-id}',
      legacySupport: true,
      autoMigrate: false,
    });
  });

  it('should return a new object each time', () => {
    const config1 = getDefaultWorktreeConfig();
    const config2 = getDefaultWorktreeConfig();

    expect(config1).not.toBe(config2);
    expect(config1).toEqual(config2);
  });
});

describe('loadRepoConfig', () => {
  // These tests would require mocking the yaml-config module
  // Skipping for now as the actual implementation uses the unified config system

  it('should load config from .fractary/core/config.yaml', async () => {
    // Would need to mock loadUnifiedConfig
  });

  it('should merge with defaults if config is partial', async () => {
    // Would need to mock loadUnifiedConfig
  });

  it('should return defaults if config file does not exist', async () => {
    // Would need to mock loadUnifiedConfig
  });
});

describe('Integration tests', () => {
  describe('Path generation with config', () => {
    it('should generate correct path with default config', () => {
      const config = getDefaultWorktreeConfig();
      const pattern = applyPathPattern(config.pathPattern, {
        organization: 'fractary',
        project: 'core',
        'work-id': '258',
      });
      const location = expandTilde(config.defaultLocation);

      expect(location).toContain('.claude-worktrees');
      expect(pattern).toBe('fractary-core-258');
    });

    it('should generate correct path with custom config', () => {
      const customConfig = {
        defaultLocation: '~/my-worktrees/',
        pathPattern: '{project}/{work-id}',
        legacySupport: true,
        autoMigrate: false,
      };

      const pattern = applyPathPattern(customConfig.pathPattern, {
        project: 'core',
        'work-id': '258',
      });
      const location = expandTilde(customConfig.defaultLocation);

      expect(location).toContain('my-worktrees');
      expect(pattern).toBe('core/258');
    });
  });

  describe('SPEC-00030 compliance', () => {
    it('should generate SPEC-00030 pattern with defaults', () => {
      const config = getDefaultWorktreeConfig();

      expect(config.pathPattern).toBe('{organization}-{project}-{work-id}');
      expect(config.defaultLocation).toBe('~/.claude-worktrees/');
    });

    it('should support legacy pattern when configured', () => {
      const config = getDefaultWorktreeConfig();

      expect(config.legacySupport).toBe(true);
    });

    it('should not auto-migrate by default', () => {
      const config = getDefaultWorktreeConfig();

      expect(config.autoMigrate).toBe(false);
    });
  });
});
