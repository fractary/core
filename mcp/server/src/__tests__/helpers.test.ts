import { describe, it, expect } from '@jest/globals';
import {
  isValidIssueState,
  isValidPrState,
  isValidFaberContext,
  isValidBranchLocation,
  isValidBranchType,
  isValidCommitType,
  isValidReviewAction,
  isValidMergeStrategy,
  validateWorkConfig,
  validateRepoConfig,
} from '../handlers/helpers.js';

describe('Type Guard Functions', () => {
  describe('isValidIssueState', () => {
    it('should accept valid issue states', () => {
      expect(isValidIssueState('open')).toBe(true);
      expect(isValidIssueState('closed')).toBe(true);
      expect(isValidIssueState('all')).toBe(true);
      expect(isValidIssueState(undefined)).toBe(true);
    });

    it('should reject invalid issue states', () => {
      expect(isValidIssueState('invalid')).toBe(false);
      expect(isValidIssueState('pending')).toBe(false);
    });
  });

  describe('isValidPrState', () => {
    it('should accept valid PR states', () => {
      expect(isValidPrState('open')).toBe(true);
      expect(isValidPrState('closed')).toBe(true);
      expect(isValidPrState(undefined)).toBe(true);
    });

    it('should reject invalid PR states', () => {
      expect(isValidPrState('all')).toBe(false);
      expect(isValidPrState('merged')).toBe(false);
    });
  });

  describe('isValidFaberContext', () => {
    it('should accept valid FABER contexts', () => {
      expect(isValidFaberContext('frame')).toBe(true);
      expect(isValidFaberContext('architect')).toBe(true);
      expect(isValidFaberContext('build')).toBe(true);
      expect(isValidFaberContext('evaluate')).toBe(true);
      expect(isValidFaberContext('release')).toBe(true);
      expect(isValidFaberContext(undefined)).toBe(true);
    });

    it('should reject invalid FABER contexts', () => {
      expect(isValidFaberContext('invalid')).toBe(false);
      expect(isValidFaberContext('test')).toBe(false);
    });
  });

  describe('isValidBranchLocation', () => {
    it('should accept valid branch locations', () => {
      expect(isValidBranchLocation('local')).toBe(true);
      expect(isValidBranchLocation('remote')).toBe(true);
      expect(isValidBranchLocation('both')).toBe(true);
      expect(isValidBranchLocation(undefined)).toBe(true);
    });

    it('should reject invalid branch locations', () => {
      expect(isValidBranchLocation('origin')).toBe(false);
      expect(isValidBranchLocation('upstream')).toBe(false);
    });
  });

  describe('isValidBranchType', () => {
    it('should accept valid branch types', () => {
      expect(isValidBranchType('feature')).toBe(true);
      expect(isValidBranchType('fix')).toBe(true);
      expect(isValidBranchType('chore')).toBe(true);
      expect(isValidBranchType('docs')).toBe(true);
    });

    it('should reject invalid branch types', () => {
      expect(isValidBranchType('invalid')).toBe(false);
      expect(isValidBranchType('bugfix')).toBe(false);
    });
  });

  describe('isValidCommitType', () => {
    it('should accept valid commit types', () => {
      expect(isValidCommitType('feat')).toBe(true);
      expect(isValidCommitType('fix')).toBe(true);
      expect(isValidCommitType('docs')).toBe(true);
      expect(isValidCommitType('style')).toBe(true);
      expect(isValidCommitType('refactor')).toBe(true);
      expect(isValidCommitType('test')).toBe(true);
      expect(isValidCommitType('chore')).toBe(true);
      expect(isValidCommitType(undefined)).toBe(true);
    });

    it('should reject invalid commit types', () => {
      expect(isValidCommitType('invalid')).toBe(false);
      expect(isValidCommitType('feature')).toBe(false);
    });
  });

  describe('isValidReviewAction', () => {
    it('should accept valid review actions', () => {
      expect(isValidReviewAction('approve')).toBe(true);
      expect(isValidReviewAction('request_changes')).toBe(true);
      expect(isValidReviewAction('comment')).toBe(true);
    });

    it('should reject invalid review actions', () => {
      expect(isValidReviewAction('reject')).toBe(false);
      expect(isValidReviewAction('approved')).toBe(false);
    });
  });

  describe('isValidMergeStrategy', () => {
    it('should accept valid merge strategies', () => {
      expect(isValidMergeStrategy('merge')).toBe(true);
      expect(isValidMergeStrategy('squash')).toBe(true);
      expect(isValidMergeStrategy('rebase')).toBe(true);
      expect(isValidMergeStrategy(undefined)).toBe(true);
    });

    it('should reject invalid merge strategies', () => {
      expect(isValidMergeStrategy('fast-forward')).toBe(false);
      expect(isValidMergeStrategy('no-ff')).toBe(false);
    });
  });
});

describe('Config Validation Functions', () => {
  describe('validateWorkConfig', () => {
    it('should accept valid work config', () => {
      const config = {
        work: {
          platform: 'github',
          token: 'test-token',
        },
      };
      expect(validateWorkConfig(config)).toBe(true);
    });

    it('should reject config without work', () => {
      const config = {};
      expect(validateWorkConfig(config)).toBe(false);
    });

    it('should reject work config without platform', () => {
      const config = {
        work: {
          token: 'test-token',
        },
      };
      expect(validateWorkConfig(config)).toBe(false);
    });

    it('should reject work config without token', () => {
      const config = {
        work: {
          platform: 'github',
        },
      };
      expect(validateWorkConfig(config)).toBe(false);
    });
  });

  describe('validateRepoConfig', () => {
    it('should accept valid repo config', () => {
      const config = {
        repo: {
          platform: 'github',
          token: 'test-token',
        },
      };
      expect(validateRepoConfig(config)).toBe(true);
    });

    it('should reject config without repo', () => {
      const config = {};
      expect(validateRepoConfig(config)).toBe(false);
    });

    it('should reject repo config without platform', () => {
      const config = {
        repo: {
          token: 'test-token',
        },
      };
      expect(validateRepoConfig(config)).toBe(false);
    });

    it('should reject repo config without token', () => {
      const config = {
        repo: {
          platform: 'github',
        },
      };
      expect(validateRepoConfig(config)).toBe(false);
    });
  });
});
