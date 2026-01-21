import {
  loadConfig as sdkLoadConfig,
  loadEnv,
  type LoadedConfig,
} from '@fractary/core/config';
import { sanitizeSecrets } from '@fractary/core/common/secrets';

/**
 * Configuration interface for the MCP server
 *
 * This is a flattened view of the SDK's handler-based configuration,
 * designed for simpler tool access patterns.
 */
export interface Config {
  work?: {
    platform: 'github' | 'jira' | 'linear';
    owner?: string;
    repo?: string;
    token?: string;
    project?: string;
  };
  repo?: {
    platform: 'github' | 'gitlab' | 'bitbucket';
    owner?: string;
    repo?: string;
    token?: string;
    defaultBranch?: string;
  };
  spec?: {
    localPath?: string;
  };
  logs?: {
    localPath?: string;
  };
  file?: {
    basePath?: string;
    sources?: Record<
      string,
      {
        type: 'local' | 's3' | 'r2' | 'gcs' | 'gdrive';
        bucket?: string;
        prefix?: string;
        region?: string;
        projectId?: string;
        accountId?: string;
        folderId?: string;
        local?: { basePath: string };
        auth?: {
          profile?: string;
          accessKeyId?: string;
          secretAccessKey?: string;
          keyFilePath?: string;
        };
        publicUrl?: string;
      }
    >;
  };
  docs?: {
    docsDir?: string;
  };
}

/**
 * Convert SDK's LoadedConfig to MCP's flat Config format
 *
 * The SDK uses a handler-based config structure (active_handler + handlers map),
 * while MCP uses a flattened structure for simpler tool access.
 */
function convertToMcpConfig(sdkConfig: LoadedConfig): Config {
  const config: Config = {};

  // Convert work config
  if (sdkConfig.work) {
    const activeHandler = sdkConfig.work.active_handler as 'github' | 'jira' | 'linear';
    const handlerConfig = sdkConfig.work.handlers?.[activeHandler] || {};
    config.work = {
      platform: activeHandler,
      owner: handlerConfig.owner,
      repo: handlerConfig.repo,
      token: handlerConfig.token,
      project: handlerConfig.project,
    };
  }

  // Convert repo config
  if (sdkConfig.repo) {
    const activeHandler = sdkConfig.repo.active_handler as 'github' | 'gitlab' | 'bitbucket';
    const handlerConfig = sdkConfig.repo.handlers?.[activeHandler] || {};
    config.repo = {
      platform: activeHandler,
      owner: handlerConfig.owner,
      repo: handlerConfig.repo,
      token: handlerConfig.token,
      defaultBranch: sdkConfig.repo.defaults?.default_branch,
    };
  }

  // Convert spec config
  // SDK uses storage-based config, extract local path from storage.local
  if (sdkConfig.spec) {
    const specConfig = sdkConfig.spec as unknown as Record<string, unknown>;
    const storage = specConfig.storage as Record<string, unknown> | undefined;
    config.spec = {
      localPath: (storage?.local as Record<string, unknown>)?.path as string | undefined,
    };
  }

  // Convert logs config
  // SDK uses storage-based config, extract local path from storage.local
  if (sdkConfig.logs) {
    const logsConfig = sdkConfig.logs as unknown as Record<string, unknown>;
    const storage = logsConfig.storage as Record<string, unknown> | undefined;
    config.logs = {
      localPath: (storage?.local as Record<string, unknown>)?.path as string | undefined,
    };
  }

  // Convert file config
  // SDK uses sources-based config
  if (sdkConfig.file) {
    const fileConfig = sdkConfig.file as unknown as Record<string, unknown>;
    const sources = fileConfig.sources as
      | Record<string, Record<string, unknown>>
      | undefined;

    // Convert sources to MCP format
    type FileSourceConfig = NonNullable<NonNullable<Config['file']>['sources']>;
    const mcpSources: FileSourceConfig = {};
    if (sources) {
      for (const [name, source] of Object.entries(sources)) {
        mcpSources[name] = {
          type: source.type as 'local' | 's3' | 'r2' | 'gcs' | 'gdrive',
          bucket: source.bucket as string | undefined,
          prefix: source.prefix as string | undefined,
          region: source.region as string | undefined,
          projectId: source.projectId as string | undefined,
          accountId: source.accountId as string | undefined,
          folderId: source.folderId as string | undefined,
          local: source.local as { basePath: string } | undefined,
          auth: source.auth as FileSourceConfig[string]['auth'],
          publicUrl: source.publicUrl as string | undefined,
        };
      }
    }

    config.file = {
      basePath: (fileConfig.global_settings as Record<string, unknown>)?.basePath as
        | string
        | undefined,
      sources: Object.keys(mcpSources).length > 0 ? mcpSources : undefined,
    };
  }

  // Convert docs config
  // SDK uses output_paths or custom_templates_path
  if (sdkConfig.docs) {
    const docsConfig = sdkConfig.docs as unknown as Record<string, unknown>;
    const outputPaths = docsConfig.output_paths as Record<string, unknown> | undefined;
    config.docs = {
      docsDir:
        (outputPaths?.default as string) ||
        (docsConfig.custom_templates_path as string | undefined),
    };
  }

  return config;
}

/**
 * Load configuration using the SDK's unified config loader
 *
 * This delegates to @fractary/core's loadConfig which handles:
 * - Loading .env files
 * - Loading YAML config from .fractary/config.yaml or .fractary/core/config.yaml
 * - Environment variable substitution
 * - Token provider creation
 *
 * The SDK config is then converted to MCP's flat format for tool access.
 */
export async function loadConfig(): Promise<Config> {
  try {
    // Ensure .env is loaded before config
    loadEnv();

    // Use SDK's unified config loader
    const sdkConfig = await sdkLoadConfig({
      warnMissingEnvVars: false, // Don't warn in MCP server context
    });

    // Convert SDK's handler-based config to MCP's flat format
    return convertToMcpConfig(sdkConfig);
  } catch (error) {
    // Sanitize error message to prevent token/secret exposure
    if (error instanceof Error) {
      const sanitizedError = sanitizeSecrets(error.message);
      console.error(`Failed to load config: ${sanitizedError}`);
    }
    // Return empty config on error - tools will handle missing config gracefully
    return {};
  }
}

// Re-export sanitizeSecrets for use by handlers
export { sanitizeSecrets };
