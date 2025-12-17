import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  handleRepoStatus,
  handleRepoBranchCurrent,
  handleRepoBranchCreate,
  handleRepoBranchDelete,
  handleRepoCommit,
  handleRepoPush,
  handleRepoPrCreate,
  handleRepoPrMerge,
} from '../handlers/repo.js';
import { Config } from '../config.js';

// Mock the RepoManager
jest.mock('@fractary/core/repo', () => ({
  RepoManager: jest.fn().mockImplementation(() => ({
    getStatus: jest.fn().mockResolvedValue({ branch: 'main', dirty: false }),
    getCurrentBranch: jest.fn().mockResolvedValue('main'),
    createBranch: jest.fn().mockResolvedValue({ name: 'feature/test', created: true }),
    deleteBranch: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn().mockResolvedValue({ sha: 'abc123', message: 'Test commit' }),
    push: jest.fn().mockResolvedValue(undefined),
    createPR: jest.fn().mockResolvedValue({ number: 123, title: 'Test PR', url: 'https://github.com/test/test/pull/123' }),
    mergePR: jest.fn().mockResolvedValue({ merged: true, sha: 'def456' }),
  })),
}));

describe('Repo Handlers', () => {
  const mockConfig: Config = {
    repo: {
      platform: 'github',
      owner: 'test-owner',
      repo: 'test-repo',
      token: 'test-token',
    },
  };

  const invalidConfig: Config = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Config Validation', () => {
    it('should reject operations without repo config', async () => {
      const result = await handleRepoStatus({}, invalidConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Repository configuration is missing');
    });

    it('should accept operations with valid repo config', async () => {
      const result = await handleRepoStatus({}, mockConfig);

      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleRepoStatus', () => {
    it('should get repository status successfully', async () => {
      const result = await handleRepoStatus({}, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.branch).toBe('main');
      expect(content.dirty).toBe(false);
    });

    it('should handle status errors gracefully', async () => {
      const { RepoManager } = await import('@fractary/core/repo');
      const mockInstance = new RepoManager(mockConfig.repo!);
      (mockInstance.getStatus as jest.Mock).mockRejectedValue(new Error('Not a git repository'));

      const result = await handleRepoStatus({}, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Not a git repository');
    });
  });

  describe('handleRepoBranchCurrent', () => {
    it('should get current branch successfully', async () => {
      const result = await handleRepoBranchCurrent({}, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.branch).toBe('main');
    });
  });

  describe('handleRepoBranchCreate', () => {
    it('should create branch successfully', async () => {
      const result = await handleRepoBranchCreate(
        { name: 'feature/new-feature' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.name).toBe('feature/test');
      expect(content.created).toBe(true);
    });

    it('should create branch from base branch', async () => {
      const result = await handleRepoBranchCreate(
        { name: 'hotfix/urgent', base_branch: 'production' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
    });

    it('should handle branch creation errors', async () => {
      const { RepoManager } = await import('@fractary/core/repo');
      const mockInstance = new RepoManager(mockConfig.repo!);
      (mockInstance.createBranch as jest.Mock).mockRejectedValue(new Error('Branch already exists'));

      const result = await handleRepoBranchCreate({ name: 'existing' }, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Branch already exists');
    });
  });

  describe('handleRepoBranchDelete', () => {
    it('should delete branch successfully', async () => {
      const result = await handleRepoBranchDelete({ name: 'old-feature' }, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.deleted).toBe(true);
    });

    it('should accept valid location values', async () => {
      const locations = ['local', 'remote', 'both'];

      for (const location of locations) {
        const result = await handleRepoBranchDelete(
          { name: 'test', location },
          mockConfig
        );
        expect(result.isError).toBeUndefined();
      }
    });

    it('should reject invalid location values', async () => {
      const result = await handleRepoBranchDelete(
        { name: 'test', location: 'invalid' },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Invalid location');
    });
  });

  describe('handleRepoCommit', () => {
    it('should create commit successfully', async () => {
      const result = await handleRepoCommit(
        { message: 'Test commit' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.sha).toBe('abc123');
      expect(content.message).toBe('Test commit');
    });

    it('should create commit with conventional commit type', async () => {
      const result = await handleRepoCommit(
        { message: 'Add new feature', type: 'feat' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
    });

    it('should accept all valid commit types', async () => {
      const validTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'];

      for (const type of validTypes) {
        const result = await handleRepoCommit(
          { message: 'Test', type },
          mockConfig
        );
        expect(result.isError).toBeUndefined();
      }
    });

    it('should reject invalid commit types', async () => {
      const result = await handleRepoCommit(
        { message: 'Test', type: 'invalid' },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Invalid type');
    });

    it('should create commit with scope and breaking change', async () => {
      const result = await handleRepoCommit(
        {
          message: 'Breaking change',
          type: 'feat',
          scope: 'api',
          breaking: true,
          body: 'This is a breaking change',
        },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleRepoPush', () => {
    it('should push successfully', async () => {
      const result = await handleRepoPush({}, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.pushed).toBe(true);
    });

    it('should push specific branch', async () => {
      const result = await handleRepoPush({ branch: 'feature/test' }, mockConfig);

      expect(result.isError).toBeUndefined();
    });

    it('should push with set-upstream flag', async () => {
      const result = await handleRepoPush(
        { branch: 'feature/new', set_upstream: true },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
    });

    it('should handle push errors gracefully', async () => {
      const { RepoManager } = await import('@fractary/core/repo');
      const mockInstance = new RepoManager(mockConfig.repo!);
      (mockInstance.push as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      const result = await handleRepoPush({}, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Permission denied');
    });
  });

  describe('handleRepoPrCreate', () => {
    it('should create PR successfully', async () => {
      const result = await handleRepoPrCreate(
        { title: 'New Feature', body: 'Implements feature X' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.number).toBe(123);
      expect(content.title).toBe('Test PR');
      expect(content.url).toContain('github.com');
    });

    it('should create PR with custom branches', async () => {
      const result = await handleRepoPrCreate(
        {
          title: 'Feature',
          base: 'main',
          head: 'feature/branch',
        },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
    });

    it('should create draft PR', async () => {
      const result = await handleRepoPrCreate(
        { title: 'WIP Feature', draft: true },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleRepoPrMerge', () => {
    it('should merge PR successfully', async () => {
      const result = await handleRepoPrMerge({ number: 123 }, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.merged).toBe(true);
    });

    it('should accept valid merge strategies', async () => {
      const validStrategies = ['merge', 'squash', 'rebase'];

      for (const strategy of validStrategies) {
        const result = await handleRepoPrMerge(
          { number: 123, strategy },
          mockConfig
        );
        expect(result.isError).toBeUndefined();
      }
    });

    it('should reject invalid merge strategies', async () => {
      const result = await handleRepoPrMerge(
        { number: 123, strategy: 'invalid' },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Invalid strategy');
    });

    it('should delete branch after merge', async () => {
      const result = await handleRepoPrMerge(
        { number: 123, delete_branch: true },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const { RepoManager } = await import('@fractary/core/repo');
      const mockInstance = new RepoManager(mockConfig.repo!);
      (mockInstance.getStatus as jest.Mock).mockRejectedValue(new Error('Authentication failed'));

      const result = await handleRepoStatus({}, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Authentication failed');
    });

    it('should handle unknown errors', async () => {
      const { RepoManager } = await import('@fractary/core/repo');
      const mockInstance = new RepoManager(mockConfig.repo!);
      (mockInstance.getStatus as jest.Mock).mockRejectedValue('String error');

      const result = await handleRepoStatus({}, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Unknown error');
    });
  });
});
