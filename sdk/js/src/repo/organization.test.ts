/**
 * @fractary/sdk - Organization Extraction Tests
 *
 * Tests for parsing git remote URLs and extracting organization/project information.
 */

import { describe, it, expect } from 'vitest';
import { parseGitRemote, extractOrganization, extractProjectName } from './organization.js';

describe('parseGitRemote', () => {
  describe('GitHub SSH format', () => {
    it('should parse standard SSH URL', () => {
      const result = parseGitRemote('git@github.com:fractary/core.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'git@github.com:fractary/core.git',
        organization: 'fractary',
        project: 'core',
      });
    });

    it('should parse SSH URL without .git extension', () => {
      const result = parseGitRemote('git@github.com:fractary/core');
      expect(result).toEqual({
        name: 'origin',
        url: 'git@github.com:fractary/core',
        organization: 'fractary',
        project: 'core',
      });
    });

    it('should handle organization with hyphens', () => {
      const result = parseGitRemote('git@github.com:my-company/my-project.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'git@github.com:my-company/my-project.git',
        organization: 'my-company',
        project: 'my-project',
      });
    });

    it('should handle project with underscores', () => {
      const result = parseGitRemote('git@github.com:org/my_project.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'git@github.com:org/my_project.git',
        organization: 'org',
        project: 'my_project',
      });
    });
  });

  describe('GitHub HTTPS format', () => {
    it('should parse standard HTTPS URL', () => {
      const result = parseGitRemote('https://github.com/fractary/core.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'https://github.com/fractary/core.git',
        organization: 'fractary',
        project: 'core',
      });
    });

    it('should parse HTTPS URL without .git extension', () => {
      const result = parseGitRemote('https://github.com/fractary/core');
      expect(result).toEqual({
        name: 'origin',
        url: 'https://github.com/fractary/core',
        organization: 'fractary',
        project: 'core',
      });
    });

    it('should parse HTTP URL (not HTTPS)', () => {
      const result = parseGitRemote('http://github.com/fractary/core.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'http://github.com/fractary/core.git',
        organization: 'fractary',
        project: 'core',
      });
    });
  });

  describe('GitLab formats', () => {
    it('should parse GitLab SSH URL', () => {
      const result = parseGitRemote('git@gitlab.com:myorg/myproject.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'git@gitlab.com:myorg/myproject.git',
        organization: 'myorg',
        project: 'myproject',
      });
    });

    it('should parse GitLab HTTPS URL', () => {
      const result = parseGitRemote('https://gitlab.com/myorg/myproject.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'https://gitlab.com/myorg/myproject.git',
        organization: 'myorg',
        project: 'myproject',
      });
    });

    it('should handle GitLab subgroups with SSH', () => {
      const result = parseGitRemote('git@gitlab.com:org/subgroup/project.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'git@gitlab.com:org/subgroup/project.git',
        organization: 'org-subgroup',
        project: 'project',
      });
    });

    it('should handle GitLab subgroups with HTTPS', () => {
      const result = parseGitRemote('https://gitlab.com/org/subgroup/project.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'https://gitlab.com/org/subgroup/project.git',
        organization: 'org-subgroup',
        project: 'project',
      });
    });

    it('should handle deeply nested GitLab subgroups', () => {
      const result = parseGitRemote('git@gitlab.com:org/team/subteam/project.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'git@gitlab.com:org/team/subteam/project.git',
        organization: 'org-team-subteam',
        project: 'project',
      });
    });
  });

  describe('Bitbucket formats', () => {
    it('should parse Bitbucket SSH URL', () => {
      const result = parseGitRemote('git@bitbucket.org:workspace/repo.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'git@bitbucket.org:workspace/repo.git',
        organization: 'workspace',
        project: 'repo',
      });
    });

    it('should parse Bitbucket HTTPS URL', () => {
      const result = parseGitRemote('https://bitbucket.org/workspace/repo.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'https://bitbucket.org/workspace/repo.git',
        organization: 'workspace',
        project: 'repo',
      });
    });
  });

  describe('Self-hosted git servers', () => {
    it('should parse self-hosted SSH URL', () => {
      const result = parseGitRemote('git@git.company.com:engineering/backend.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'git@git.company.com:engineering/backend.git',
        organization: 'engineering',
        project: 'backend',
      });
    });

    it('should parse self-hosted HTTPS URL', () => {
      const result = parseGitRemote('https://git.company.com/engineering/backend.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'https://git.company.com/engineering/backend.git',
        organization: 'engineering',
        project: 'backend',
      });
    });

    it('should handle self-hosted with port number', () => {
      const result = parseGitRemote('https://git.company.com:8080/org/project.git');
      expect(result).toEqual({
        name: 'origin',
        url: 'https://git.company.com:8080/org/project.git',
        organization: 'org',
        project: 'project',
      });
    });
  });

  describe('Edge cases and invalid formats', () => {
    it('should return null for invalid SSH format', () => {
      const result = parseGitRemote('git@invalid');
      expect(result).toBeNull();
    });

    it('should return null for invalid HTTPS format', () => {
      const result = parseGitRemote('https://invalid');
      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const result = parseGitRemote('');
      expect(result).toBeNull();
    });

    it('should return null for local path', () => {
      const result = parseGitRemote('/path/to/local/repo');
      expect(result).toBeNull();
    });

    it('should return null for file:// URL', () => {
      const result = parseGitRemote('file:///path/to/repo.git');
      expect(result).toBeNull();
    });
  });

  describe('.git extension handling', () => {
    it('should strip .git from project name', () => {
      const result = parseGitRemote('git@github.com:org/project.git');
      expect(result?.project).toBe('project');
    });

    it('should handle projects that naturally end in .git', () => {
      const result = parseGitRemote('git@github.com:org/my.git.project.git');
      expect(result?.project).toBe('my.git.project');
    });
  });
});

describe('extractOrganization', () => {
  it('should extract organization from SSH URL', () => {
    expect(extractOrganization('git@github.com:fractary/core.git')).toBe('fractary');
  });

  it('should extract organization from HTTPS URL', () => {
    expect(extractOrganization('https://github.com/fractary/core.git')).toBe('fractary');
  });

  it('should return "local" for invalid URL', () => {
    expect(extractOrganization('invalid-url')).toBe('local');
  });

  it('should return "local" for empty string', () => {
    expect(extractOrganization('')).toBe('local');
  });

  it('should handle GitLab subgroups', () => {
    expect(extractOrganization('git@gitlab.com:org/subgroup/project.git')).toBe('org-subgroup');
  });
});

describe('extractProjectName', () => {
  it('should extract project from SSH URL', () => {
    expect(extractProjectName('git@github.com:fractary/core.git')).toBe('core');
  });

  it('should extract project from HTTPS URL', () => {
    expect(extractProjectName('https://github.com/fractary/core.git')).toBe('core');
  });

  it('should return empty string for invalid URL', () => {
    expect(extractProjectName('invalid-url')).toBe('');
  });

  it('should return empty string for empty string', () => {
    expect(extractProjectName('')).toBe('');
  });

  it('should strip .git extension', () => {
    expect(extractProjectName('git@github.com:org/project.git')).toBe('project');
  });
});
