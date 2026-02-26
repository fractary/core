/**
 * @fractary/sdk - Path Generator Tests
 *
 * Tests for worktree path generation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join } from 'path';
import { generateWorktreePath } from './path-generator.js';
import * as organization from './organization.js';
import * as config from './config.js';

// Mock modules - partial mock config to keep expandTilde and applyPathPattern real
vi.mock('./organization.js');
vi.mock('./config.js', async () => {
  const actual = await vi.importActual('./config.js');
  return {
    ...actual as object,
    loadRepoConfig: vi.fn(),
  };
});

describe('generateWorktreePath', () => {
  const HOME = '/home/testuser';
  const CWD = '/home/testuser/projects/repo';

  beforeEach(() => {
    // Mock HOME environment variable
    process.env.HOME = HOME;

    // Default config mock - returns RepoConfigExtended with worktree at top level
    vi.mocked(config.loadRepoConfig).mockResolvedValue({
      active_handler: 'github',
      handlers: {},
      worktree: {
        defaultLocation: '.claude/worktrees',
        pathPattern: 'work-id-{work-id}',
      },
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('default path pattern (work-id-{id})', () => {
    beforeEach(() => {
      vi.mocked(organization.getRemoteInfo).mockResolvedValue({
        name: 'origin',
        url: 'git@github.com:fractary/core.git',
        organization: 'fractary',
        project: 'core',
      });
    });

    it('should generate path under .claude/worktrees with work-id prefix', async () => {
      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      expect(path).toBe(join(CWD, '.claude', 'worktrees', 'work-id-258'));
    });

    it('should resolve relative location against cwd', async () => {
      const path = await generateWorktreePath(CWD, {
        workId: '123',
      });

      expect(path).toBe(join(CWD, '.claude', 'worktrees', 'work-id-123'));
    });

    it('should fallback to defaults if no remote', async () => {
      vi.mocked(organization.getRemoteInfo).mockResolvedValue(null);

      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      // Pattern is work-id-{work-id} so org/project don't matter
      expect(path).toBe(join(CWD, '.claude', 'worktrees', 'work-id-258'));
    });
  });

  describe('Custom path override', () => {
    it('should use customPath if provided', async () => {
      const customPath = '/custom/worktree/location';
      const path = await generateWorktreePath(CWD, {
        workId: '258',
        customPath,
      });

      expect(path).toBe(customPath);
      expect(organization.getRemoteInfo).not.toHaveBeenCalled();
    });

    it('should resolve relative customPath', async () => {
      const path = await generateWorktreePath(CWD, {
        workId: '258',
        customPath: '../my-worktree',
      });

      expect(path).toBe(join(CWD, '../my-worktree'));
    });
  });

  describe('Custom configuration', () => {
    it('should use custom defaultLocation from config', async () => {
      vi.mocked(config.loadRepoConfig).mockResolvedValue({
        active_handler: 'github',
        handlers: {},
        worktree: {
          defaultLocation: '~/my-worktrees/',
          pathPattern: '{organization}-{project}-{work-id}',
        },
      } as any);

      vi.mocked(organization.getRemoteInfo).mockResolvedValue({
        name: 'origin',
        url: 'git@github.com:fractary/core.git',
        organization: 'fractary',
        project: 'core',
      });

      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      expect(path).toBe(join(HOME, 'my-worktrees', 'fractary-core-258'));
    });

    it('should use custom pathPattern from config', async () => {
      vi.mocked(config.loadRepoConfig).mockResolvedValue({
        active_handler: 'github',
        handlers: {},
        worktree: {
          defaultLocation: '.claude/worktrees',
          pathPattern: '{project}/{work-id}',
        },
      } as any);

      vi.mocked(organization.getRemoteInfo).mockResolvedValue({
        name: 'origin',
        url: 'git@github.com:fractary/core.git',
        organization: 'fractary',
        project: 'core',
      });

      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      expect(path).toBe(join(CWD, '.claude', 'worktrees', 'core', '258'));
    });

    it('should pass through custom config in options', async () => {
      const customConfig = {
        defaultLocation: '/tmp/worktrees/',
        pathPattern: 'wt-{work-id}',
      };

      vi.mocked(organization.getRemoteInfo).mockResolvedValue({
        name: 'origin',
        url: 'git@github.com:fractary/core.git',
        organization: 'fractary',
        project: 'core',
      });

      const path = await generateWorktreePath(CWD, {
        workId: '258',
        config: customConfig,
      });

      expect(path).toBe('/tmp/worktrees/wt-258');
      expect(config.loadRepoConfig).not.toHaveBeenCalled();
    });
  });

  describe('Tilde expansion', () => {
    it('should expand ~ in tilde-prefixed location', async () => {
      vi.mocked(config.loadRepoConfig).mockResolvedValue({
        active_handler: 'github',
        handlers: {},
        worktree: {
          defaultLocation: '~/my-worktrees',
          pathPattern: 'work-id-{work-id}',
        },
      } as any);

      vi.mocked(organization.getRemoteInfo).mockResolvedValue({
        name: 'origin',
        url: 'git@github.com:fractary/core.git',
        organization: 'fractary',
        project: 'core',
      });

      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      expect(path).not.toContain('~');
      expect(path).toContain(HOME);
      expect(path).toBe(join(HOME, 'my-worktrees', 'work-id-258'));
    });

    it('should handle absolute paths without tilde', async () => {
      vi.mocked(config.loadRepoConfig).mockResolvedValue({
        active_handler: 'github',
        handlers: {},
        worktree: {
          defaultLocation: '/absolute/path/',
          pathPattern: '{organization}-{project}-{work-id}',
        },
      } as any);

      vi.mocked(organization.getRemoteInfo).mockResolvedValue({
        name: 'origin',
        url: 'git@github.com:fractary/core.git',
        organization: 'fractary',
        project: 'core',
      });

      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      expect(path).toBe('/absolute/path/fractary-core-258');
    });
  });

  describe('Pattern substitution', () => {
    it('should handle pattern with only work-id', async () => {
      vi.mocked(config.loadRepoConfig).mockResolvedValue({
        active_handler: 'github',
        handlers: {},
        worktree: {
          defaultLocation: '~/.worktrees/',
          pathPattern: '{work-id}',
        },
      } as any);

      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      expect(path).toBe(join(HOME, '.worktrees', '258'));
    });

    it('should handle pattern with prefix and suffix', async () => {
      vi.mocked(config.loadRepoConfig).mockResolvedValue({
        active_handler: 'github',
        handlers: {},
        worktree: {
          defaultLocation: '~/.worktrees/',
          pathPattern: 'issue-{work-id}-branch',
        },
      } as any);

      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      expect(path).toBe(join(HOME, '.worktrees', 'issue-258-branch'));
    });
  });
});
