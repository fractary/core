import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { loadConfig } from '../config.js';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should load config from GITHUB_TOKEN environment variable', async () => {
    process.env.GITHUB_TOKEN = 'test-github-token';
    process.env.GITHUB_OWNER = 'test-owner';
    process.env.GITHUB_REPO = 'test-repo';

    const config = await loadConfig();

    expect(config.work).toBeDefined();
    expect(config.work?.platform).toBe('github');
    expect(config.work?.token).toBe('test-github-token');
    expect(config.work?.owner).toBe('test-owner');
    expect(config.work?.repo).toBe('test-repo');

    expect(config.repo).toBeDefined();
    expect(config.repo?.platform).toBe('github');
    expect(config.repo?.token).toBe('test-github-token');
  });

  it('should prioritize GITHUB over JIRA for work config', async () => {
    process.env.GITHUB_TOKEN = 'github-token';
    process.env.JIRA_TOKEN = 'jira-token';

    const config = await loadConfig();

    expect(config.work?.platform).toBe('github');
    expect(config.work?.token).toBe('github-token');
  });

  it('should use JIRA when GITHUB is not available', async () => {
    process.env.JIRA_TOKEN = 'jira-token';
    process.env.JIRA_PROJECT = 'test-project';

    const config = await loadConfig();

    expect(config.work?.platform).toBe('jira');
    expect(config.work?.token).toBe('jira-token');
    expect(config.work?.project).toBe('test-project');
  });

  it('should use LINEAR when neither GITHUB nor JIRA are available', async () => {
    process.env.LINEAR_API_KEY = 'linear-key';

    const config = await loadConfig();

    expect(config.work?.platform).toBe('linear');
    expect(config.work?.token).toBe('linear-key');
  });

  it('should return empty config when no environment variables are set', async () => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.JIRA_TOKEN;
    delete process.env.LINEAR_API_KEY;
    delete process.env.GITLAB_TOKEN;
    delete process.env.BITBUCKET_TOKEN;

    const config = await loadConfig();

    expect(config.work).toBeUndefined();
    expect(config.repo).toBeUndefined();
  });
});
