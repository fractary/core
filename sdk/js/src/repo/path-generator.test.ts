/**
 * @fractary/sdk - Path Generator Tests
 *
 * Tests for worktree path generation following SPEC-00030 pattern.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join } from 'path';
import { generateWorktreePath } from './path-generator.js';
import * as organization from './organization.js';
import * as config from './config.js';

// Mock modules
vi.mock('./organization.js');
vi.mock('./config.js');

describe('generateWorktreePath', () => {
  const HOME = '/home/testuser';
  const CWD = '/home/testuser/projects/repo';

  beforeEach(() => {
    // Mock HOME environment variable
    process.env.HOME = HOME;

    // Default config mock
    vi.mocked(config.loadRepoConfig).mockResolvedValue({
      repo: {
        worktree: {
          defaultLocation: '~/.claude-worktrees/',
          pathPattern: '{organization}-{project}-{work-id}',
          legacySupport: true,
          autoMigrate: false,
        },
      },
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('SPEC-00030 path pattern', () => {
    beforeEach(() => {
      vi.mocked(organization.getRemoteInfo).mockResolvedValue({
        name: 'origin',
        url: 'git@github.com:fractary/core.git',
        organization: 'fractary',
        project: 'core',
      });
    });

    it('should generate SPEC-00030 path with organization and project', async () => {
      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      expect(path).toBe(join(HOME, '.claude-worktrees', 'fractary-core-258'));
    });

    it('should use provided organization', async () => {
      const path = await generateWorktreePath(CWD, {
        workId: '258',
        organization: 'mycompany',
      });

      expect(path).toBe(join(HOME, '.claude-worktrees', 'mycompany-core-258'));
    });

    it('should use provided project', async () => {
      const path = await generateWorktreePath(CWD, {
        workId: '258',
        project: 'backend',
      });

      expect(path).toBe(join(HOME, '.claude-worktrees', 'fractary-backend-258'));
    });

    it('should use both provided organization and project', async () => {
      const path = await generateWorktreePath(CWD, {
        workId: '258',
        organization: 'acme',
        project: 'webapp',
      });

      expect(path).toBe(join(HOME, '.claude-worktrees', 'acme-webapp-258'));
    });

    it('should fallback to "local" organization if no remote', async () => {
      vi.mocked(organization.getRemoteInfo).mockResolvedValue(null);

      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      expect(path).toBe(join(HOME, '.claude-worktrees', 'local-repo-258'));
    });

    it('should use directory basename as project if no remote', async () => {
      vi.mocked(organization.getRemoteInfo).mockResolvedValue(null);

      const path = await generateWorktreePath('/home/user/my-project', {
        workId: '123',
      });

      expect(path).toBe(join(HOME, '.claude-worktrees', 'local-my-project-123'));
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
        repo: {
          worktree: {
            defaultLocation: '~/my-worktrees/',
            pathPattern: '{organization}-{project}-{work-id}',
            legacySupport: true,
            autoMigrate: false,
          },
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
        repo: {
          worktree: {
            defaultLocation: '~/.claude-worktrees/',
            pathPattern: '{project}/{work-id}',
            legacySupport: true,
            autoMigrate: false,
          },
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

      expect(path).toBe(join(HOME, '.claude-worktrees', 'core', '258'));
    });

    it('should pass through custom config in options', async () => {
      const customConfig = {
        defaultLocation: '/tmp/worktrees/',
        pathPattern: 'wt-{work-id}',
        legacySupport: false,
        autoMigrate: false,
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
    it('should expand ~ to HOME directory', async () => {
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
    });

    it('should handle paths without tilde', async () => {
      vi.mocked(config.loadRepoConfig).mockResolvedValue({
        repo: {
          worktree: {
            defaultLocation: '/absolute/path/',
            pathPattern: '{organization}-{project}-{work-id}',
            legacySupport: true,
            autoMigrate: false,
          },
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
        repo: {
          worktree: {
            defaultLocation: '~/.worktrees/',
            pathPattern: '{work-id}',
            legacySupport: true,
            autoMigrate: false,
          },
        },
      } as any);

      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      expect(path).toBe(join(HOME, '.worktrees', '258'));
    });

    it('should handle pattern with prefix and suffix', async () => {
      vi.mocked(config.loadRepoConfig).mockResolvedValue({
        repo: {
          worktree: {
            defaultLocation: '~/.worktrees/',
            pathPattern: 'issue-{work-id}-branch',
            legacySupport: true,
            autoMigrate: false,
          },
        },
      } as any);

      const path = await generateWorktreePath(CWD, {
        workId: '258',
      });

      expect(path).toBe(join(HOME, '.worktrees', 'issue-258-branch'));
    });
  });
});
