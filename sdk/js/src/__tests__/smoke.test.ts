/**
 * Smoke tests for @fractary/core
 *
 * These tests verify basic functionality and module imports.
 */

import { WorkManager } from '../work/manager';
import { RepoManager } from '../repo/manager';
import { LogManager } from '../logs/manager';
import { FileManager } from '../file/manager';
import { DocsManager } from '../docs/manager';

describe('Fractary Core SDK - Smoke Tests', () => {
  describe('Module Imports', () => {
    it('should import WorkManager', () => {
      expect(WorkManager).toBeDefined();
    });

    it('should import RepoManager', () => {
      expect(RepoManager).toBeDefined();
    });

    it('should import LogManager', () => {
      expect(LogManager).toBeDefined();
    });

    it('should import FileManager', () => {
      expect(FileManager).toBeDefined();
    });

    it('should import DocsManager', () => {
      expect(DocsManager).toBeDefined();
    });
  });

  describe('Manager Instantiation', () => {
    it('should create WorkManager with GitHub config', () => {
      const config = {
        platform: 'github' as const,
        owner: 'test-org',
        repo: 'test-repo',
        token: 'test-token',
      };
      const manager = new WorkManager(config);
      expect(manager).toBeInstanceOf(WorkManager);
    });

    it('should create RepoManager with GitHub config', () => {
      const config = {
        platform: 'github' as const,
        owner: 'test-org',
        repo: 'test-repo',
        token: 'test-token',
        defaultBranch: 'main',
      };
      const manager = new RepoManager(config);
      expect(manager).toBeInstanceOf(RepoManager);
    });

    it('should create LogManager with config', () => {
      const config = { localPath: '.fractary/logs' };
      const manager = new LogManager(config);
      expect(manager).toBeInstanceOf(LogManager);
    });

    it('should create FileManager with config', () => {
      const config = { basePath: '.fractary/storage' };
      const manager = new FileManager(config);
      expect(manager).toBeInstanceOf(FileManager);
    });

    it('should create DocsManager with config', () => {
      const config = { docsDir: '.fractary/docs' };
      const manager = new DocsManager(config);
      expect(manager).toBeInstanceOf(DocsManager);
    });
  });

  describe('Provider Validation', () => {
    it('should reject unsupported work platform', () => {
      const config = {
        platform: 'unsupported' as any,
        owner: 'test-org',
        repo: 'test-repo',
      };
      expect(() => new WorkManager(config)).toThrow();
    });

    it('should reject unsupported repo platform', () => {
      const config = {
        platform: 'unsupported' as any,
        owner: 'test-org',
        repo: 'test-repo',
      };
      expect(() => new RepoManager(config)).toThrow();
    });

    it('should throw error for Jira provider (not implemented)', () => {
      const config = {
        platform: 'jira' as const,
        host: 'test.atlassian.net',
        project: 'TEST',
      };
      // Jira provider should throw since it's a stub
      expect(() => new WorkManager(config)).toThrow();
    });

    it('should throw error for Linear provider (not implemented)', () => {
      const config = {
        platform: 'linear' as const,
        teamId: 'test-team',
      };
      // Linear provider should throw since it's a stub
      expect(() => new WorkManager(config)).toThrow();
    });

    it('should throw error for GitLab provider (not implemented)', () => {
      const config = {
        platform: 'gitlab' as const,
        owner: 'test-org',
        repo: 'test-repo',
      };
      // GitLab provider should throw since it's a stub
      expect(() => new RepoManager(config)).toThrow();
    });

    it('should throw error for Bitbucket provider (not implemented)', () => {
      const config = {
        platform: 'bitbucket' as const,
        owner: 'test-workspace',
        repo: 'test-repo',
      };
      // Bitbucket provider should throw since it's a stub
      expect(() => new RepoManager(config)).toThrow();
    });
  });
});
