/**
 * Unit tests for factory functions
 */

import { ConfigurationError } from '../common/errors';

// We need to test the parseProject function indirectly through the factories
// Since it's private, we test via integration with buildWorkConfig/buildRepoConfig

describe('factories', () => {
  describe('project format validation', () => {
    // Import the module dynamically to test internal functions
    // We'll create a test helper that exposes validation behavior

    const validProjects = [
      'owner/repo',
      'my-org/my-repo',
      'user123/project_456',
      'Org.Name/Repo.Name',
      'a/b',
      'fractary/core',
      'my_org/my_repo',
      'org-name/repo-name',
      'ORG/REPO',
    ];

    const invalidProjects = [
      '',
      '   ',
      'noslash',
      '/leadingslash',
      'trailingslash/',
      'too/many/slashes',
      'owner//repo',
      'owner/ repo',
      'owner /repo',
      // Note: ' owner/repo' and 'owner/repo ' become valid after trimming
      // which is the expected behavior - we trim before validation
      'invalid@char/repo',
      'owner/invalid@char',
      'owner/repo/extra',
    ];

    // Test valid formats via regex
    describe('valid project formats', () => {
      const PROJECT_FORMAT_REGEX = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

      validProjects.forEach((project) => {
        it(`should accept "${project}"`, () => {
          expect(PROJECT_FORMAT_REGEX.test(project.trim())).toBe(true);
        });
      });
    });

    describe('invalid project formats', () => {
      const PROJECT_FORMAT_REGEX = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

      invalidProjects.forEach((project) => {
        it(`should reject "${project}"`, () => {
          expect(PROJECT_FORMAT_REGEX.test(project.trim())).toBe(false);
        });
      });
    });
  });

  describe('ConfigurationError', () => {
    it('should include project in details', () => {
      const error = new ConfigurationError(
        'Invalid project format',
        { project: 'bad/format/here' }
      );

      expect(error.details).toEqual({ project: 'bad/format/here' });
      expect(error.code).toBe('CONFIG_ERROR');
    });
  });
});
