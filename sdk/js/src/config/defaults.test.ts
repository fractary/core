/**
 * Tests for config/defaults.ts
 *
 * Tests default configuration generation for all platforms and storage types.
 */

import {
  getDefaultConfig,
  getMinimalConfig,
  type DefaultConfigOptions,
} from './defaults';

describe('getDefaultConfig', () => {
  describe('basic structure', () => {
    it('returns a valid config object with version 2.0', () => {
      const config = getDefaultConfig();
      expect(config.version).toBe('2.0');
    });

    it('includes all plugin sections by default', () => {
      const config = getDefaultConfig();
      expect(config.work).toBeDefined();
      expect(config.repo).toBeDefined();
      expect(config.logs).toBeDefined();
      expect(config.file).toBeDefined();
      expect(config.spec).toBeDefined();
      expect(config.docs).toBeDefined();
    });

    it('does not include codex section by default', () => {
      const config = getDefaultConfig();
      expect(config.codex).toBeUndefined();
    });
  });

  describe('work platform: github (default)', () => {
    it('sets github as default work platform', () => {
      const config = getDefaultConfig();
      expect(config.work?.active_handler).toBe('github');
    });

    it('configures github handler with required fields', () => {
      const config = getDefaultConfig({ owner: 'myorg', repo: 'myrepo' });
      const github = config.work?.handlers?.github;

      expect(github).toBeDefined();
      expect(github.owner).toBe('myorg');
      expect(github.repo).toBe('myrepo');
      expect(github.token).toBe('${GITHUB_TOKEN}');
      expect(github.api_url).toBe('https://api.github.com');
    });

    it('does not include unused classification, states, labels, or defaults', () => {
      const config = getDefaultConfig();
      const github = config.work?.handlers?.github;

      expect(github.classification).toBeUndefined();
      expect(github.states).toBeUndefined();
      expect(github.labels).toBeUndefined();
      expect(config.work?.defaults).toBeUndefined();
    });
  });

  describe('work platform: jira', () => {
    it('configures jira handler when specified', () => {
      const config = getDefaultConfig({ workPlatform: 'jira' });

      expect(config.work?.active_handler).toBe('jira');
      expect(config.work?.handlers?.jira).toBeDefined();
      expect(config.work?.handlers?.github).toBeUndefined();
    });

    it('includes jira-specific fields', () => {
      const config = getDefaultConfig({ workPlatform: 'jira' });
      const jira = config.work?.handlers?.jira;

      expect(jira.base_url).toBe('${JIRA_BASE_URL}');
      expect(jira.email).toBe('${JIRA_EMAIL}');
      expect(jira.api_token).toBe('${JIRA_API_TOKEN}');
      expect(jira.project_key).toBe('PROJ');
    });

    it('does not include unused classification or states', () => {
      const config = getDefaultConfig({ workPlatform: 'jira' });
      const jira = config.work?.handlers?.jira;

      expect(jira.classification).toBeUndefined();
      expect(jira.states).toBeUndefined();
    });
  });

  describe('work platform: linear', () => {
    it('configures linear handler when specified', () => {
      const config = getDefaultConfig({ workPlatform: 'linear' });

      expect(config.work?.active_handler).toBe('linear');
      expect(config.work?.handlers?.linear).toBeDefined();
    });

    it('includes linear-specific fields', () => {
      const config = getDefaultConfig({ workPlatform: 'linear' });
      const linear = config.work?.handlers?.linear;

      expect(linear.api_key).toBe('${LINEAR_API_KEY}');
      expect(linear.team_key).toBe('TEAM');
    });

    it('does not include unused states', () => {
      const config = getDefaultConfig({ workPlatform: 'linear' });
      const linear = config.work?.handlers?.linear;

      expect(linear.states).toBeUndefined();
    });
  });

  describe('repo configuration', () => {
    it('sets github as default repo platform', () => {
      const config = getDefaultConfig();
      expect(config.repo?.active_handler).toBe('github');
    });

    it('configures github handler with token', () => {
      const config = getDefaultConfig();
      const github = config.repo?.handlers?.github;

      expect(github.token).toBe('${GITHUB_TOKEN}');
      expect(github.api_url).toBe('https://api.github.com');
    });

    it('includes only essential repo defaults', () => {
      const config = getDefaultConfig();
      const defaults = config.repo?.defaults;

      expect(defaults?.default_branch).toBe('main');
      expect(defaults?.protected_branches).toBeUndefined();
      expect(defaults?.commit_format).toBeUndefined();
      expect(defaults?.branch_naming).toBeUndefined();
    });

    it('includes merge configuration', () => {
      const config = getDefaultConfig();
      const merge = config.repo?.defaults?.pr?.merge;

      expect(merge?.strategy).toBe('squash');
      expect(merge?.delete_branch).toBe(true);
    });

    it('does not include unused PR settings', () => {
      const config = getDefaultConfig();
      const pr = config.repo?.defaults?.pr;

      expect(pr?.template).toBeUndefined();
      expect(pr?.require_work_id).toBeUndefined();
      expect(pr?.auto_link_issues).toBeUndefined();
      expect(pr?.ci_polling).toBeUndefined();
    });
  });

  describe('file handler: local (default)', () => {
    it('uses local storage by default', () => {
      const config = getDefaultConfig();

      expect(config.file?.handlers?.['specs-write']?.type).toBe('local');
      expect(config.file?.handlers?.['specs-archive']?.type).toBe('local');
      expect(config.file?.handlers?.['logs-write']?.type).toBe('local');
      expect(config.file?.handlers?.['logs-archive']?.type).toBe('local');
      expect(config.file?.handlers?.['docs-write']?.type).toBe('local');
      expect(config.file?.handlers?.['docs-archive']?.type).toBe('local');
    });

    it('configures local base paths', () => {
      const config = getDefaultConfig();

      expect(config.file?.handlers?.['specs-write']?.local?.base_path).toBe('.fractary/specs');
      expect(config.file?.handlers?.['specs-archive']?.local?.base_path).toBe('.fractary/specs/archive');
      expect(config.file?.handlers?.['logs-write']?.local?.base_path).toBe('.fractary/logs');
      expect(config.file?.handlers?.['logs-archive']?.local?.base_path).toBe('.fractary/logs/archive');
      expect(config.file?.handlers?.['docs-write']?.local?.base_path).toBe('.fractary/docs');
      expect(config.file?.handlers?.['docs-archive']?.local?.base_path).toBe('.fractary/docs/archive');
    });

    it('does not include S3-specific fields for local', () => {
      const config = getDefaultConfig();

      expect(config.file?.handlers?.['specs-write']?.bucket).toBeUndefined();
      expect(config.file?.handlers?.['specs-write']?.region).toBeUndefined();
    });

    it('does not include unused global settings', () => {
      const config = getDefaultConfig();

      expect(config.file?.global_settings).toBeUndefined();
    });
  });

  describe('file handler: s3', () => {
    it('configures S3 storage when specified with bucket', () => {
      const config = getDefaultConfig({
        fileHandler: 's3',
        s3Bucket: 'my-bucket',
        awsRegion: 'us-west-2',
      });

      expect(config.file?.handlers?.['specs-write']?.type).toBe('s3');
      expect(config.file?.handlers?.['specs-write']?.bucket).toBe('my-bucket');
      expect(config.file?.handlers?.['specs-write']?.region).toBe('us-west-2');
    });

    it('includes S3 prefixes', () => {
      const config = getDefaultConfig({
        fileHandler: 's3',
        s3Bucket: 'my-bucket',
      });

      expect(config.file?.handlers?.['specs-write']?.prefix).toBe('specs/');
      expect(config.file?.handlers?.['specs-archive']?.prefix).toBe('specs/archive/');
      expect(config.file?.handlers?.['logs-write']?.prefix).toBe('logs/');
      expect(config.file?.handlers?.['logs-archive']?.prefix).toBe('logs/archive/');
    });

    it('falls back to local when s3 specified without bucket', () => {
      const config = getDefaultConfig({ fileHandler: 's3' });

      expect(config.file?.handlers?.['specs-write']?.type).toBe('local');
    });

    it('uses default region when not specified', () => {
      const config = getDefaultConfig({
        fileHandler: 's3',
        s3Bucket: 'my-bucket',
      });

      expect(config.file?.handlers?.['specs-write']?.region).toBe('us-east-1');
    });
  });

  describe('logs configuration', () => {
    it('includes logs config with schema version', () => {
      const config = getDefaultConfig();
      expect(config.logs?.schema_version).toBe('2.0');
    });

    it('includes default file handler entries', () => {
      const config = getDefaultConfig();
      const handlers = config.logs?.storage?.file_handlers;
      expect(handlers).toHaveLength(1);
      expect(handlers?.[0]?.name).toBe('default');
      expect(handlers?.[0]?.write).toBe('logs-write');
      expect(handlers?.[0]?.archive).toBe('logs-archive');
    });

    it('does not include unused retention or session logging settings', () => {
      const config = getDefaultConfig();

      expect(config.logs?.retention).toBeUndefined();
      expect(config.logs?.session_logging).toBeUndefined();
      expect(config.logs?.custom_templates_path).toBeUndefined();
    });
  });

  describe('spec configuration', () => {
    it('includes spec config with schema version', () => {
      const config = getDefaultConfig();
      expect(config.spec?.schema_version).toBe('1.0');
    });

    it('includes default file handler entries', () => {
      const config = getDefaultConfig();
      const handlers = config.spec?.storage?.file_handlers;

      expect(handlers).toHaveLength(1);
      expect(handlers?.[0]?.name).toBe('default');
      expect(handlers?.[0]?.write).toBe('specs-write');
      expect(handlers?.[0]?.archive).toBe('specs-archive');
    });

    it('does not include unused naming, archive, or integration settings', () => {
      const config = getDefaultConfig();

      expect(config.spec?.naming).toBeUndefined();
      expect(config.spec?.archive).toBeUndefined();
      expect(config.spec?.integration).toBeUndefined();
    });
  });

  describe('docs configuration', () => {
    it('includes docs config with schema version', () => {
      const config = getDefaultConfig();
      expect(config.docs?.schema_version).toBe('1.1');
    });

    it('includes custom templates path', () => {
      const config = getDefaultConfig();
      expect(config.docs?.custom_templates_path).toBe('.fractary/docs/templates/manifest.yaml');
    });

    it('includes default file handler entries', () => {
      const config = getDefaultConfig();
      const handlers = config.docs?.storage?.file_handlers;

      expect(handlers).toHaveLength(1);
      expect(handlers?.[0]?.name).toBe('default');
      expect(handlers?.[0]?.write).toBe('docs-write');
      expect(handlers?.[0]?.archive).toBe('docs-archive');
    });
  });
});

describe('getMinimalConfig', () => {
  it('returns a valid config object with version 2.0', () => {
    const config = getMinimalConfig();
    expect(config.version).toBe('2.0');
  });

  it('includes only work and repo sections', () => {
    const config = getMinimalConfig();

    expect(config.work).toBeDefined();
    expect(config.repo).toBeDefined();
    expect(config.logs).toBeUndefined();
    expect(config.file).toBeUndefined();
    expect(config.spec).toBeUndefined();
    expect(config.docs).toBeUndefined();
  });

  it('respects workPlatform option', () => {
    const config = getMinimalConfig({ workPlatform: 'jira' });
    expect(config.work?.active_handler).toBe('jira');
  });

  it('respects owner and repo options', () => {
    const config = getMinimalConfig({ owner: 'test-org', repo: 'test-repo' });
    const github = config.work?.handlers?.github;

    expect(github?.owner).toBe('test-org');
    expect(github?.repo).toBe('test-repo');
  });

  it('configures repo section same as full config', () => {
    const minConfig = getMinimalConfig();
    const fullConfig = getDefaultConfig();

    expect(minConfig.repo?.active_handler).toBe(fullConfig.repo?.active_handler);
    expect(minConfig.repo?.defaults?.default_branch).toBe(fullConfig.repo?.defaults?.default_branch);
  });
});

describe('DefaultConfigOptions', () => {
  it('uses fallback values when options not provided', () => {
    const config = getDefaultConfig({});

    expect(config.work?.active_handler).toBe('github');
    expect(config.work?.handlers?.github?.owner).toBe('your-org');
    expect(config.work?.handlers?.github?.repo).toBe('your-repo');
  });

  it('uses provided values over defaults', () => {
    const options: DefaultConfigOptions = {
      workPlatform: 'linear',
      owner: 'custom-org',
      repo: 'custom-repo',
      fileHandler: 's3',
      s3Bucket: 'custom-bucket',
      awsRegion: 'eu-west-1',
    };

    const config = getDefaultConfig(options);

    expect(config.work?.active_handler).toBe('linear');
    expect(config.file?.handlers?.specs?.bucket).toBe('custom-bucket');
    expect(config.file?.handlers?.specs?.region).toBe('eu-west-1');
  });
});
