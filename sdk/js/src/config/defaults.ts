/**
 * @fractary/core - Default Configuration Templates
 *
 * Provides default configuration templates for initializing new projects.
 * Used by both CLI and agents to ensure consistent config generation.
 */

import type { CoreYamlConfig, WorkConfig, RepoConfig, LogsConfig, FileConfig, DocsConfig, FileSource } from '../common/yaml-config';

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
  /**
   * S3 bucket name (if using S3).
   * When not provided and fileHandler is 's3', defaults to `dev.{repo}`.
   * The dev bucket is intended for development artifacts (docs, logs, specs)
   * that don't belong to test or production environments.
   */
  s3Bucket?: string;
  /** AWS region (if using S3) */
  awsRegion?: string;
}

/**
 * Supported cloud storage providers for cloud-init
 */
export type CloudProvider = 's3' | 'r2';

/**
 * Scope of cloud storage enablement
 *
 * - 'archives': Only archive handlers are cloud-backed (writes stay local for speed)
 * - 'all': Both write and archive handlers are cloud-backed
 */
export type CloudScope = 'archives' | 'all';

/**
 * Options for generating cloud-enabled file handler configuration.
 *
 * Used by the `cloud-init` command to upgrade an existing local-storage
 * configuration to use a cloud provider (S3 or R2).
 */
export interface CloudConfigOptions {
  /** Cloud storage provider */
  provider: CloudProvider;
  /** Bucket name for storage */
  bucket: string;
  /** AWS region (required for S3, ignored for R2) */
  region?: string;
  /** Cloudflare account ID (required for R2, ignored for S3) */
  accountId?: string;
  /**
   * Which handlers to cloud-enable.
   * - 'archives' (default): Only archive handlers use cloud storage; writes stay local for speed.
   * - 'all': Both write and archive handlers use cloud storage.
   */
  scope?: CloudScope;
  /** Existing FileConfig to merge with (preserves local paths for write handlers in 'archives' scope) */
  existingConfig?: FileConfig;
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
    worktree: {
      location: '.claude/worktrees',
      naming: {
        with_work_id: 'work-id-{id}',
        default: 'random-words',
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
  const { fileHandler = 'local', s3Bucket, awsRegion = 'us-east-1', repo } = options;

  // When S3 is selected, derive bucket from repo name if not explicitly provided
  const resolvedBucket = s3Bucket || (fileHandler === 's3' && repo ? `dev.${repo}` : undefined);

  if (fileHandler === 's3' && resolvedBucket) {
    return {
      schema_version: '2.0',
      handlers: {
        'logs-write': {
          type: 's3',
          bucket: resolvedBucket,
          prefix: 'logs/',
          region: awsRegion,
          local: {
            base_path: 'logs',
          },
        },
        'logs-archive': {
          type: 's3',
          bucket: resolvedBucket,
          prefix: 'logs/_archive/',
          region: awsRegion,
          local: {
            base_path: 'logs/_archive',
          },
        },
        'docs-write': {
          type: 's3',
          bucket: resolvedBucket,
          prefix: 'docs/',
          region: awsRegion,
          local: {
            base_path: 'docs',
          },
        },
        'docs-archive': {
          type: 's3',
          bucket: resolvedBucket,
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
 * // With explicit bucket
 * const config = getDefaultConfig({
 *   workPlatform: 'github',
 *   owner: 'myorg',
 *   repo: 'my-project',
 *   fileHandler: 's3',
 *   s3Bucket: 'my-bucket',
 * });
 *
 * // Bucket auto-derived as 'dev.my-project' from repo name
 * const config2 = getDefaultConfig({
 *   owner: 'myorg',
 *   repo: 'my-project',
 *   fileHandler: 's3',
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

/**
 * Build a cloud-backed FileSource for a given handler category.
 *
 * @param provider Cloud provider type
 * @param bucket Bucket name
 * @param prefix S3/R2 object key prefix (e.g. 'logs/')
 * @param localBasePath Local fallback path
 * @param options Additional provider-specific options
 */
function buildCloudHandler(
  provider: CloudProvider,
  bucket: string,
  prefix: string,
  localBasePath: string,
  options: { region?: string; accountId?: string },
): FileSource {
  const handler: FileSource = {
    type: provider,
    bucket,
    prefix,
    local: { base_path: localBasePath },
  };

  if (provider === 's3') {
    handler.region = options.region || 'us-east-1';
  } else if (provider === 'r2') {
    handler.auth = {
      accountId: options.accountId || '${R2_ACCOUNT_ID}',
    };
  }

  return handler;
}

/**
 * Generate a cloud-enabled file configuration by upgrading existing handlers.
 *
 * When scope is 'archives' (the default), only the archive handlers (logs-archive,
 * docs-archive) are switched to the cloud provider. Write handlers remain local,
 * preserving fast local writes while ensuring durable cloud-backed archival.
 *
 * When scope is 'all', both write and archive handlers use cloud storage.
 *
 * @param options Cloud configuration options
 * @returns FileConfig with cloud-backed handlers
 *
 * @example
 * ```typescript
 * // Upgrade archives to S3 (writes stay local)
 * const fileConfig = getCloudFileConfig({
 *   provider: 's3',
 *   bucket: 'dev.my-project',
 *   region: 'us-east-1',
 *   scope: 'archives',
 * });
 *
 * // Upgrade everything to R2
 * const fileConfig2 = getCloudFileConfig({
 *   provider: 'r2',
 *   bucket: 'my-project-files',
 *   accountId: 'abc123',
 *   scope: 'all',
 * });
 * ```
 */
export function getCloudFileConfig(options: CloudConfigOptions): FileConfig {
  const {
    provider,
    bucket,
    region,
    accountId,
    scope = 'archives',
    existingConfig,
  } = options;

  const providerOpts = { region, accountId };

  // Start from existing config or a local default
  const baseHandlers = existingConfig?.handlers || getDefaultFileConfig({}).handlers || {};

  const handlers: Record<string, FileSource> = {};

  if (scope === 'all') {
    // Cloud-enable everything
    handlers['logs-write'] = buildCloudHandler(provider, bucket, 'logs/', 'logs', providerOpts);
    handlers['logs-archive'] = buildCloudHandler(provider, bucket, 'logs/_archive/', 'logs/_archive', providerOpts);
    handlers['docs-write'] = buildCloudHandler(provider, bucket, 'docs/', 'docs', providerOpts);
    handlers['docs-archive'] = buildCloudHandler(provider, bucket, 'docs/_archive/', 'docs/_archive', providerOpts);
  } else {
    // Archives-only: keep writes local, upgrade archives to cloud
    handlers['logs-write'] = baseHandlers['logs-write'] || {
      type: 'local',
      local: { base_path: 'logs' },
    };
    handlers['logs-archive'] = buildCloudHandler(provider, bucket, 'logs/_archive/', 'logs/_archive', providerOpts);
    handlers['docs-write'] = baseHandlers['docs-write'] || {
      type: 'local',
      local: { base_path: 'docs' },
    };
    handlers['docs-archive'] = buildCloudHandler(provider, bucket, 'docs/_archive/', 'docs/_archive', providerOpts);
  }

  return {
    schema_version: existingConfig?.schema_version || '2.0',
    handlers,
  };
}
