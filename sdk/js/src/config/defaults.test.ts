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

    it('includes classification mappings', () => {
      const config = getDefaultConfig();
      const github = config.work?.handlers?.github;

      expect(github.classification).toBeDefined();
      expect(github.classification.feature).toContain('feature');
      expect(github.classification.bug).toContain('bug');
      expect(github.classification.chore).toContain('chore');
      expect(github.classification.patch).toContain('hotfix');
    });

    it('includes state mappings', () => {
      const config = getDefaultConfig();
      const github = config.work?.handlers?.github;

      expect(github.states).toBeDefined();
      expect(github.states.open).toBe('OPEN');
      expect(github.states.done).toBe('CLOSED');
    });

    it('includes label configuration', () => {
      const config = getDefaultConfig();
      const github = config.work?.handlers?.github;

      expect(github.labels).toBeDefined();
      expect(github.labels.prefix).toBe('faber-');
    });

    it('includes work defaults', () => {
      const config = getDefaultConfig();

      expect(config.work?.defaults).toBeDefined();
      expect(config.work?.defaults?.auto_label).toBe(true);
      expect(config.work?.defaults?.close_on_merge).toBe(true);
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

    it('includes jira classification mappings', () => {
      const config = getDefaultConfig({ workPlatform: 'jira' });
      const jira = config.work?.handlers?.jira;

      expect(jira.classification.feature).toContain('Story');
      expect(jira.classification.bug).toContain('Bug');
    });

    it('includes jira state mappings', () => {
      const config = getDefaultConfig({ workPlatform: 'jira' });
      const jira = config.work?.handlers?.jira;

      expect(jira.states.open).toBe('To Do');
      expect(jira.states.in_progress).toBe('In Progress');
      expect(jira.states.done).toBe('Done');
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

    it('includes linear state mappings', () => {
      const config = getDefaultConfig({ workPlatform: 'linear' });
      const linear = config.work?.handlers?.linear;

      expect(linear.states.open).toBe('Backlog');
      expect(linear.states.in_progress).toBe('In Progress');
      expect(linear.states.closed).toBe('Canceled');
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

    it('includes repo defaults', () => {
      const config = getDefaultConfig();
      const defaults = config.repo?.defaults;

      expect(defaults?.default_branch).toBe('main');
      expect(defaults?.protected_branches).toContain('main');
      expect(defaults?.commit_format).toBe('faber');
    });

    it('includes branch naming configuration', () => {
      const config = getDefaultConfig();
      const naming = config.repo?.defaults?.branch_naming;

      expect(naming?.pattern).toBe('{prefix}/{issue_id}-{slug}');
      expect(naming?.allowed_prefixes).toContain('feat');
      expect(naming?.allowed_prefixes).toContain('fix');
    });

    it('includes PR configuration', () => {
      const config = getDefaultConfig();
      const pr = config.repo?.defaults?.pr;

      expect(pr?.template).toBe('standard');
      expect(pr?.require_work_id).toBe(true);
      expect(pr?.auto_link_issues).toBe(true);
    });

    it('includes CI polling configuration', () => {
      const config = getDefaultConfig();
      const ciPolling = config.repo?.defaults?.pr?.ci_polling;

      expect(ciPolling?.enabled).toBe(true);
      expect(ciPolling?.interval_seconds).toBe(60);
      expect(ciPolling?.timeout_seconds).toBe(900);
    });

    it('includes merge configuration', () => {
      const config = getDefaultConfig();
      const merge = config.repo?.defaults?.pr?.merge;

      expect(merge?.strategy).toBe('squash');
      expect(merge?.delete_branch).toBe(true);
    });
  });

  describe('file handler: local (default)', () => {
    it('uses local storage by default', () => {
      const config = getDefaultConfig();

      expect(config.file?.sources?.specs?.type).toBe('local');
      expect(config.file?.sources?.logs?.type).toBe('local');
    });

    it('configures local base paths', () => {
      const config = getDefaultConfig();

      expect(config.file?.sources?.specs?.local?.base_path).toBe('.fractary/specs');
      expect(config.file?.sources?.logs?.local?.base_path).toBe('.fractary/logs');
    });

    it('does not include S3-specific fields for local', () => {
      const config = getDefaultConfig();

      expect(config.file?.sources?.specs?.bucket).toBeUndefined();
      expect(config.file?.sources?.specs?.region).toBeUndefined();
    });

    it('includes global settings', () => {
      const config = getDefaultConfig();

      expect(config.file?.global_settings?.retry_attempts).toBe(3);
      expect(config.file?.global_settings?.timeout_seconds).toBe(300);
    });
  });

  describe('file handler: s3', () => {
    it('configures S3 storage when specified with bucket', () => {
      const config = getDefaultConfig({
        fileHandler: 's3',
        s3Bucket: 'my-bucket',
        awsRegion: 'us-west-2',
      });

      expect(config.file?.sources?.specs?.type).toBe('s3');
      expect(config.file?.sources?.specs?.bucket).toBe('my-bucket');
      expect(config.file?.sources?.specs?.region).toBe('us-west-2');
    });

    it('includes S3 prefixes', () => {
      const config = getDefaultConfig({
        fileHandler: 's3',
        s3Bucket: 'my-bucket',
      });

      expect(config.file?.sources?.specs?.prefix).toBe('specs/');
      expect(config.file?.sources?.logs?.prefix).toBe('logs/');
    });

    it('includes push configuration for S3', () => {
      const config = getDefaultConfig({
        fileHandler: 's3',
        s3Bucket: 'my-bucket',
      });

      expect(config.file?.sources?.specs?.push?.keep_local).toBe(true);
      expect(config.file?.sources?.logs?.push?.compress).toBe(true);
    });

    it('includes auth configuration for S3', () => {
      const config = getDefaultConfig({
        fileHandler: 's3',
        s3Bucket: 'my-bucket',
      });

      expect(config.file?.sources?.specs?.auth?.profile).toBe('default');
    });

    it('falls back to local when s3 specified without bucket', () => {
      const config = getDefaultConfig({ fileHandler: 's3' });

      expect(config.file?.sources?.specs?.type).toBe('local');
    });

    it('uses default region when not specified', () => {
      const config = getDefaultConfig({
        fileHandler: 's3',
        s3Bucket: 'my-bucket',
      });

      expect(config.file?.sources?.specs?.region).toBe('us-east-1');
    });
  });

  describe('logs configuration', () => {
    it('includes logs config with schema version', () => {
      const config = getDefaultConfig();
      expect(config.logs?.schema_version).toBe('2.0');
    });

    it('includes storage paths', () => {
      const config = getDefaultConfig();
      expect(config.logs?.storage?.local_path).toBe('.fractary/logs');
    });

    it('includes retention configuration', () => {
      const config = getDefaultConfig();
      expect(config.logs?.retention?.default?.local_days).toBe(30);
    });

    it('includes session logging configuration', () => {
      const config = getDefaultConfig();
      const session = config.logs?.session_logging;

      expect(session?.enabled).toBe(true);
      expect(session?.format).toBe('markdown');
      expect(session?.redact_sensitive).toBe(true);
    });

    it('includes cloud archive path for S3', () => {
      const config = getDefaultConfig({
        fileHandler: 's3',
        s3Bucket: 'my-bucket',
      });

      expect(config.logs?.storage?.cloud_archive_path).toBeDefined();
    });

    it('omits cloud archive path for local', () => {
      const config = getDefaultConfig({ fileHandler: 'local' });

      expect(config.logs?.storage?.cloud_archive_path).toBeUndefined();
    });
  });

  describe('spec configuration', () => {
    it('includes spec config with schema version', () => {
      const config = getDefaultConfig();
      expect(config.spec?.schema_version).toBe('1.0');
    });

    it('includes naming configuration', () => {
      const config = getDefaultConfig();
      const naming = config.spec?.naming;

      expect(naming?.issue_specs?.prefix).toBe('WORK');
      expect(naming?.standalone_specs?.prefix).toBe('SPEC');
    });

    it('includes archive configuration', () => {
      const config = getDefaultConfig();
      const archive = config.spec?.archive;

      expect(archive?.strategy).toBe('lifecycle');
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
    expect(config.file?.sources?.specs?.bucket).toBe('custom-bucket');
    expect(config.file?.sources?.specs?.region).toBe('eu-west-1');
  });
});
