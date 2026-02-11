/**
 * @fractary/core - Default Configuration Templates
 *
 * Provides default configuration templates for initializing new projects.
 * Used by both CLI and agents to ensure consistent config generation.
 */

import type { CoreYamlConfig, WorkConfig, RepoConfig, LogsConfig, FileConfig, DocsConfig } from '../common/yaml-config';

/**
 * Options for generating default configuration
 */
export interface DefaultConfigOptions {
  /** Work tracking platform */
  workPlatform?: 'github' | 'jira' | 'linear';
  /** Repository platform */
  repoPlatform?: 'github';
  /** File storage handler */
  fileHandler?: 'local' | 's3';
  /** GitHub/GitLab owner/organization */
  owner?: string;
  /** Repository name */
  repo?: string;
  /** S3 bucket name (if using S3) */
  s3Bucket?: string;
  /** AWS region (if using S3) */
  awsRegion?: string;
}

/**
 * Get default work configuration for a platform
 */
function getDefaultWorkConfig(options: DefaultConfigOptions): WorkConfig {
  const { workPlatform = 'github', owner = 'your-org', repo = 'your-repo' } = options;

  const baseConfig: WorkConfig = {
    active_handler: workPlatform,
    handlers: {},
  };

  if (workPlatform === 'github') {
    baseConfig.handlers.github = {
      owner,
      repo,
      token: '${GITHUB_TOKEN}',
      api_url: 'https://api.github.com',
    };
  } else if (workPlatform === 'jira') {
    baseConfig.handlers.jira = {
      base_url: '${JIRA_BASE_URL}',
      email: '${JIRA_EMAIL}',
      api_token: '${JIRA_API_TOKEN}',
      project_key: 'PROJ',
    };
  } else if (workPlatform === 'linear') {
    baseConfig.handlers.linear = {
      api_key: '${LINEAR_API_KEY}',
      team_key: 'TEAM',
    };
  }

  return baseConfig;
}

/**
 * Get default repository configuration for a platform
 */
function getDefaultRepoConfig(options: DefaultConfigOptions): RepoConfig {
  const { repoPlatform = 'github', owner = 'your-org', repo = 'your-repo' } = options;

  return {
    active_handler: repoPlatform,
    handlers: {
      [repoPlatform]: {
        owner,
        repo,
        token: '${GITHUB_TOKEN}',
        api_url: 'https://api.github.com',
      },
    },
    defaults: {
      environments: {
        production: {
          branch: 'main',
          protected: true,
        },
        test: {
          branch: 'test',
          protected: false,
        },
      },
      default_environment: 'production',
      pr: {
        merge: {
          strategy: 'squash',
          delete_branch: true,
        },
      },
    },
  };
}

/**
 * Get default logs configuration
 */
function getDefaultLogsConfig(): LogsConfig {
  return {
    schema_version: '2.0',
    storage: {
      file_handlers: [
        { name: 'default', write: 'logs-write', archive: 'logs-archive' },
      ],
    },
  };
}

/**
 * Get default file storage configuration
 *
 * Generates separate write and archive handlers for each plugin (logs, docs).
 * When using S3, the write handler stores to S3 directly while keeping a local
 * fallback path, and the archive handler uses a separate S3 prefix.
 */
function getDefaultFileConfig(options: DefaultConfigOptions): FileConfig {
  const { fileHandler = 'local', s3Bucket, awsRegion = 'us-east-1' } = options;

  if (fileHandler === 's3' && s3Bucket) {
    return {
      schema_version: '2.0',
      handlers: {
        'logs-write': {
          type: 's3',
          bucket: s3Bucket,
          prefix: 'logs/',
          region: awsRegion,
          local: {
            base_path: 'logs',
          },
        },
        'logs-archive': {
          type: 's3',
          bucket: s3Bucket,
          prefix: 'logs/_archive/',
          region: awsRegion,
          local: {
            base_path: 'logs/_archive',
          },
        },
        'docs-write': {
          type: 's3',
          bucket: s3Bucket,
          prefix: 'docs/',
          region: awsRegion,
          local: {
            base_path: 'docs',
          },
        },
        'docs-archive': {
          type: 's3',
          bucket: s3Bucket,
          prefix: 'docs/_archive/',
          region: awsRegion,
          local: {
            base_path: 'docs/_archive',
          },
        },
      },
    };
  }

  return {
    schema_version: '2.0',
    handlers: {
      'logs-write': {
        type: 'local',
        local: {
          base_path: 'logs',
        },
      },
      'logs-archive': {
        type: 'local',
        local: {
          base_path: 'logs/_archive',
        },
      },
      'docs-write': {
        type: 'local',
        local: {
          base_path: 'docs',
        },
      },
      'docs-archive': {
        type: 'local',
        local: {
          base_path: 'docs/_archive',
        },
      },
    },
  };
}

/**
 * Get default documentation configuration
 */
function getDefaultDocsConfig(): DocsConfig {
  return {
    schema_version: '1.1',
    custom_templates_path: 'docs/templates/manifest.yaml',
    storage: {
      file_handlers: [
        { name: 'default', write: 'docs-write', archive: 'docs-archive' },
      ],
    },
  };
}

/**
 * Generate a full default configuration with all plugins
 *
 * @param options Configuration options
 * @returns Complete CoreYamlConfig with all sections
 *
 * @example
 * ```typescript
 * const config = getDefaultConfig({
 *   workPlatform: 'github',
 *   owner: 'myorg',
 *   repo: 'my-project',
 *   fileHandler: 's3',
 *   s3Bucket: 'my-bucket',
 * });
 * ```
 */
export function getDefaultConfig(options: DefaultConfigOptions = {}): CoreYamlConfig {
  return {
    version: '2.0',
    repo: getDefaultRepoConfig(options),
    work: getDefaultWorkConfig(options),
    file: getDefaultFileConfig(options),
    docs: getDefaultDocsConfig(),
    logs: getDefaultLogsConfig(),
  };
}

/**
 * Generate a minimal configuration with only essential settings
 *
 * @param options Configuration options
 * @returns Minimal CoreYamlConfig with work and repo sections only
 *
 * @example
 * ```typescript
 * const config = getMinimalConfig({
 *   workPlatform: 'github',
 *   owner: 'myorg',
 *   repo: 'my-project',
 * });
 * ```
 */
export function getMinimalConfig(options: DefaultConfigOptions = {}): CoreYamlConfig {
  return {
    version: '2.0',
    repo: getDefaultRepoConfig(options),
    work: getDefaultWorkConfig(options),
  };
}
