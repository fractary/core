/**
 * @fractary/core - Default Configuration Templates
 *
 * Provides default configuration templates for initializing new projects.
 * Used by both CLI and agents to ensure consistent config generation.
 */

import type { CoreYamlConfig, WorkConfig, RepoConfig, LogsConfig, FileConfig, SpecConfig, DocsConfig } from '../common/yaml-config';

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
    defaults: {
      auto_assign: false,
      auto_label: true,
      close_on_merge: true,
      comment_on_state_change: true,
      link_pr_to_issue: true,
    },
  };

  if (workPlatform === 'github') {
    baseConfig.handlers.github = {
      owner,
      repo,
      token: '${GITHUB_TOKEN}',
      api_url: 'https://api.github.com',
      classification: {
        feature: ['feature', 'enhancement', 'story', 'user-story'],
        bug: ['bug', 'fix', 'defect', 'error'],
        chore: ['chore', 'maintenance', 'docs', 'documentation', 'test', 'refactor'],
        patch: ['hotfix', 'patch', 'urgent', 'critical', 'security'],
      },
      states: {
        open: 'OPEN',
        in_progress: 'OPEN',
        in_review: 'OPEN',
        done: 'CLOSED',
        closed: 'CLOSED',
      },
      labels: {
        prefix: 'faber-',
        in_progress: 'in-progress',
        in_review: 'in-review',
        completed: 'completed',
        error: 'faber-error',
      },
    };
  } else if (workPlatform === 'jira') {
    baseConfig.handlers.jira = {
      base_url: '${JIRA_BASE_URL}',
      email: '${JIRA_EMAIL}',
      api_token: '${JIRA_API_TOKEN}',
      project_key: 'PROJ',
      classification: {
        feature: ['Story', 'New Feature'],
        bug: ['Bug'],
        chore: ['Task', 'Sub-task'],
        patch: ['Bug'],
      },
      states: {
        open: 'To Do',
        in_progress: 'In Progress',
        in_review: 'In Review',
        done: 'Done',
        closed: 'Done',
      },
    };
  } else if (workPlatform === 'linear') {
    baseConfig.handlers.linear = {
      api_key: '${LINEAR_API_KEY}',
      team_key: 'TEAM',
      classification: {
        feature: ['Feature'],
        bug: ['Bug'],
        chore: ['Chore'],
        patch: ['Bug'],
      },
      states: {
        open: 'Backlog',
        in_progress: 'In Progress',
        in_review: 'In Review',
        done: 'Done',
        closed: 'Canceled',
      },
    };
  }

  return baseConfig;
}

/**
 * Get default repository configuration for a platform
 */
function getDefaultRepoConfig(options: DefaultConfigOptions): RepoConfig {
  const { repoPlatform = 'github' } = options;

  return {
    active_handler: repoPlatform,
    handlers: {
      [repoPlatform]: {
        token: '${GITHUB_TOKEN}',
        api_url: 'https://api.github.com',
      },
    },
    defaults: {
      default_branch: 'main',
      protected_branches: ['main', 'master', 'production', 'staging'],
      branch_naming: {
        pattern: '{prefix}/{issue_id}-{slug}',
        allowed_prefixes: ['feat', 'fix', 'chore', 'hotfix', 'docs', 'test', 'refactor', 'style', 'perf'],
      },
      commit_format: 'faber',
      require_signed_commits: false,
      merge_strategy: 'no-ff',
      auto_delete_merged_branches: false,
      remote: {
        name: 'origin',
        auto_set_upstream: true,
      },
      push_sync_strategy: 'auto-merge',
      pull_sync_strategy: 'auto-merge-prefer-remote',
      pr: {
        template: 'standard',
        require_work_id: true,
        auto_link_issues: true,
        ci_polling: {
          enabled: true,
          interval_seconds: 60,
          timeout_seconds: 900,
          initial_delay_seconds: 10,
        },
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
function getDefaultLogsConfig(options: DefaultConfigOptions): LogsConfig {
  const { fileHandler = 'local' } = options;
  const useS3 = fileHandler === 's3';

  return {
    schema_version: '2.0',
    custom_templates_path: '.fractary/logs/templates/manifest.yaml',
    storage: {
      path_write_local: '.fractary/logs',
      path_archive_local: '.fractary/logs/archive',
      ...(useS3 && { path_write_cloud: 'logs' }),
      ...(useS3 && { path_archive_cloud: 'archive/logs' }),
    },
    retention: {
      default: {
        local_days: 30,
        ...(useS3 && { cloud_days: 'forever' }),
        priority: 'medium',
        auto_archive: useS3,
        cleanup_after_archive: useS3,
      },
      paths: [
        {
          pattern: 'sessions/*',
          log_type: 'session',
          local_days: 7,
          ...(useS3 && { cloud_days: 'forever' }),
          priority: 'high',
          auto_archive: useS3,
          cleanup_after_archive: false,
        },
      ],
    },
    session_logging: {
      enabled: true,
      auto_capture: true,
      format: 'markdown',
      include_timestamps: true,
      redact_sensitive: true,
      auto_name_by_issue: true,
      redaction_patterns: {
        api_keys: true,
        jwt_tokens: true,
        passwords: true,
        credit_cards: true,
        email_addresses: false,
      },
    },
  };
}

/**
 * Get default file storage configuration
 */
function getDefaultFileConfig(options: DefaultConfigOptions): FileConfig {
  const { fileHandler = 'local', s3Bucket, awsRegion = 'us-east-1' } = options;

  if (fileHandler === 's3' && s3Bucket) {
    return {
      schema_version: '2.0',
      sources: {
        specs: {
          type: 's3',
          bucket: s3Bucket,
          prefix: 'specs/',
          region: awsRegion,
          local: {
            base_path: '.fractary/specs',
          },
          push: {
            compress: false,
            keep_local: true,
          },
          auth: {
            profile: 'default',
          },
        },
        logs: {
          type: 's3',
          bucket: s3Bucket,
          prefix: 'logs/',
          region: awsRegion,
          local: {
            base_path: '.fractary/logs',
          },
          push: {
            compress: true,
            keep_local: true,
          },
          auth: {
            profile: 'default',
          },
        },
      },
      global_settings: {
        retry_attempts: 3,
        retry_delay_ms: 1000,
        timeout_seconds: 300,
        verify_checksums: true,
        parallel_uploads: 4,
      },
    };
  }

  return {
    schema_version: '2.0',
    sources: {
      specs: {
        type: 'local',
        local: {
          base_path: '.fractary/specs',
        },
      },
      logs: {
        type: 'local',
        local: {
          base_path: '.fractary/logs',
        },
      },
    },
    global_settings: {
      retry_attempts: 3,
      retry_delay_ms: 1000,
      timeout_seconds: 300,
      verify_checksums: true,
      parallel_uploads: 4,
    },
  };
}

/**
 * Get default specification configuration
 */
function getDefaultSpecConfig(options: DefaultConfigOptions): SpecConfig {
  const { fileHandler = 'local' } = options;
  const useS3 = fileHandler === 's3';

  return {
    schema_version: '1.0',
    storage: {
      path_write_local: '.fractary/specs',
      path_archive_local: '.fractary/specs/archive',
      ...(useS3 && { path_write_cloud: 'specs' }),
      ...(useS3 && { path_archive_cloud: 'archive/specs' }),
    },
    naming: {
      issue_specs: {
        prefix: 'WORK',
        digits: 5,
        phase_format: 'numeric',
        phase_separator: '-',
      },
      standalone_specs: {
        prefix: 'SPEC',
        digits: 4,
        auto_increment: true,
      },
    },
    archive: {
      strategy: 'lifecycle',
      auto_archive_on: {
        issue_close: true,
        pr_merge: true,
        faber_release: true,
      },
    },
    integration: {
      work_plugin: 'fractary-work',
      file_plugin: 'fractary-file',
      link_to_issue: true,
      update_issue_on_create: true,
    },
  };
}

/**
 * Get default documentation configuration
 */
function getDefaultDocsConfig(): DocsConfig {
  return {
    schema_version: '1.1',
    custom_templates_path: '.fractary/docs/templates/manifest.yaml',
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
    work: getDefaultWorkConfig(options),
    repo: getDefaultRepoConfig(options),
    logs: getDefaultLogsConfig(options),
    file: getDefaultFileConfig(options),
    spec: getDefaultSpecConfig(options),
    docs: getDefaultDocsConfig(),
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
    work: getDefaultWorkConfig(options),
    repo: getDefaultRepoConfig(options),
  };
}
