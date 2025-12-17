import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  handleWorkIssueFetch,
  handleWorkIssueCreate,
  handleWorkIssueUpdate,
  handleWorkIssueClose,
  handleWorkIssueReopen,
  handleWorkIssueSearch,
  handleWorkCommentCreate,
  handleWorkLabelAdd,
} from '../handlers/work.js';
import { Config } from '../config.js';

// Mock the WorkManager
jest.mock('@fractary/core/work', () => ({
  WorkManager: jest.fn().mockImplementation(() => ({
    fetchIssue: jest.fn().mockResolvedValue({ number: '123', title: 'Test Issue', state: 'open' }),
    createIssue: jest.fn().mockResolvedValue({ number: '124', title: 'New Issue' }),
    updateIssue: jest.fn().mockResolvedValue({ number: '123', title: 'Updated', state: 'closed' }),
    closeIssue: jest.fn().mockResolvedValue({ number: '123', state: 'closed' }),
    reopenIssue: jest.fn().mockResolvedValue({ number: '123', state: 'open' }),
    searchIssues: jest.fn().mockResolvedValue([{ number: '123' }, { number: '124' }]),
    createComment: jest.fn().mockResolvedValue({ id: '1', body: 'Test comment' }),
    addLabels: jest.fn().mockResolvedValue(['bug', 'priority']),
  })),
}));

describe('Work Handlers', () => {
  const mockConfig: Config = {
    work: {
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
    it('should reject operations without work config', async () => {
      const result = await handleWorkIssueFetch({ issue_number: '123' }, invalidConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Work configuration is missing');
    });

    it('should accept operations with valid work config', async () => {
      const result = await handleWorkIssueFetch({ issue_number: '123' }, mockConfig);

      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleWorkIssueFetch', () => {
    it('should fetch issue successfully', async () => {
      const result = await handleWorkIssueFetch({ issue_number: '123' }, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.number).toBe('123');
      expect(content.title).toBe('Test Issue');
    });

    it('should handle fetch errors gracefully', async () => {
      const { WorkManager } = await import('@fractary/core/work');
      const mockInstance = new WorkManager(mockConfig.work!);
      (mockInstance.fetchIssue as jest.Mock).mockRejectedValue(new Error('Issue not found'));

      const result = await handleWorkIssueFetch({ issue_number: '999' }, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Issue not found');
    });
  });

  describe('handleWorkIssueCreate', () => {
    it('should create issue successfully', async () => {
      const result = await handleWorkIssueCreate(
        { title: 'New Bug', body: 'Description', labels: ['bug'] },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.number).toBe('124');
    });

    it('should create issue with minimal params', async () => {
      const result = await handleWorkIssueCreate({ title: 'Minimal Issue' }, mockConfig);

      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleWorkIssueUpdate', () => {
    it('should update issue successfully', async () => {
      const result = await handleWorkIssueUpdate(
        { issue_number: '123', title: 'Updated Title', state: 'closed' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.state).toBe('closed');
    });

    it('should accept valid issue states (open, closed)', async () => {
      const openResult = await handleWorkIssueUpdate(
        { issue_number: '123', state: 'open' },
        mockConfig
      );
      expect(openResult.isError).toBeUndefined();

      const closedResult = await handleWorkIssueUpdate(
        { issue_number: '123', state: 'closed' },
        mockConfig
      );
      expect(closedResult.isError).toBeUndefined();
    });

    it('should reject "all" state (not valid for updates)', async () => {
      const result = await handleWorkIssueUpdate(
        { issue_number: '123', state: 'all' },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Invalid state');
      expect(content.error).not.toContain('all'); // Error message should say 'open' or 'closed' only
    });

    it('should reject invalid states', async () => {
      const result = await handleWorkIssueUpdate(
        { issue_number: '123', state: 'invalid' },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Invalid state');
    });

    it('should update without state parameter', async () => {
      const result = await handleWorkIssueUpdate(
        { issue_number: '123', title: 'New Title' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleWorkIssueClose', () => {
    it('should close issue successfully', async () => {
      const result = await handleWorkIssueClose({ issue_number: '123' }, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.state).toBe('closed');
    });

    it('should close issue with comment', async () => {
      const { WorkManager } = await import('@fractary/core/work');
      const mockInstance = new WorkManager(mockConfig.work!);
      const createCommentSpy = mockInstance.createComment as jest.Mock;

      await handleWorkIssueClose(
        { issue_number: '123', comment: 'Closing as resolved' },
        mockConfig
      );

      expect(createCommentSpy).toHaveBeenCalledWith('123', 'Closing as resolved');
    });
  });

  describe('handleWorkIssueReopen', () => {
    it('should reopen issue successfully', async () => {
      const result = await handleWorkIssueReopen({ issue_number: '123' }, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.state).toBe('open');
    });

    it('should reopen issue with comment', async () => {
      const { WorkManager } = await import('@fractary/core/work');
      const mockInstance = new WorkManager(mockConfig.work!);
      const createCommentSpy = mockInstance.createComment as jest.Mock;

      await handleWorkIssueReopen(
        { issue_number: '123', comment: 'Reopening due to regression' },
        mockConfig
      );

      expect(createCommentSpy).toHaveBeenCalledWith('123', 'Reopening due to regression');
    });
  });

  describe('handleWorkIssueSearch', () => {
    it('should search issues successfully', async () => {
      const result = await handleWorkIssueSearch({ query: 'bug' }, mockConfig);

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content).toHaveLength(2);
    });

    it('should accept "all" state for search (valid for filtering)', async () => {
      const result = await handleWorkIssueSearch({ state: 'all' }, mockConfig);

      expect(result.isError).toBeUndefined();
    });

    it('should accept open/closed states for search', async () => {
      const openResult = await handleWorkIssueSearch({ state: 'open' }, mockConfig);
      expect(openResult.isError).toBeUndefined();

      const closedResult = await handleWorkIssueSearch({ state: 'closed' }, mockConfig);
      expect(closedResult.isError).toBeUndefined();
    });

    it('should reject invalid states', async () => {
      const result = await handleWorkIssueSearch({ state: 'invalid' }, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Invalid state');
    });

    it('should search with multiple filters', async () => {
      const result = await handleWorkIssueSearch(
        {
          query: 'security',
          state: 'open',
          labels: ['bug', 'security'],
          assignee: 'developer',
        },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
    });
  });

  describe('handleWorkCommentCreate', () => {
    it('should create comment successfully', async () => {
      const result = await handleWorkCommentCreate(
        { issue_number: '123', body: 'Test comment' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content.body).toBe('Test comment');
    });

    it('should create comment with FABER context', async () => {
      const result = await handleWorkCommentCreate(
        { issue_number: '123', body: 'Build phase complete', faber_context: 'build' },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
    });

    it('should reject invalid FABER context', async () => {
      const result = await handleWorkCommentCreate(
        { issue_number: '123', body: 'Comment', faber_context: 'invalid' },
        mockConfig
      );

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Invalid faber_context');
    });

    it('should accept all valid FABER contexts', async () => {
      const validContexts = ['frame', 'architect', 'build', 'evaluate', 'release'];

      for (const context of validContexts) {
        const result = await handleWorkCommentCreate(
          { issue_number: '123', body: 'Test', faber_context: context },
          mockConfig
        );
        expect(result.isError).toBeUndefined();
      }
    });
  });

  describe('handleWorkLabelAdd', () => {
    it('should add labels successfully', async () => {
      const result = await handleWorkLabelAdd(
        { issue_number: '123', labels: ['bug', 'priority'] },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
      const content = JSON.parse(result.content[0].text);
      expect(content).toContain('bug');
      expect(content).toContain('priority');
    });

    it('should add single label', async () => {
      const result = await handleWorkLabelAdd(
        { issue_number: '123', labels: ['enhancement'] },
        mockConfig
      );

      expect(result.isError).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const { WorkManager } = await import('@fractary/core/work');
      const mockInstance = new WorkManager(mockConfig.work!);
      (mockInstance.fetchIssue as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await handleWorkIssueFetch({ issue_number: '123' }, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Network error');
    });

    it('should handle unknown errors', async () => {
      const { WorkManager } = await import('@fractary/core/work');
      const mockInstance = new WorkManager(mockConfig.work!);
      (mockInstance.fetchIssue as jest.Mock).mockRejectedValue('String error');

      const result = await handleWorkIssueFetch({ issue_number: '123' }, mockConfig);

      expect(result.isError).toBe(true);
      const content = JSON.parse(result.content[0].text);
      expect(content.error).toContain('Unknown error');
    });
  });
});
