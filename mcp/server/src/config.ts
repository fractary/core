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
/**
 * PR merge defaults configuration
 */
export interface PrMergeDefaults {
  strategy?: 'merge' | 'squash' | 'rebase';
  deleteBranch?: boolean;
}

/** Environment-to-branch mapping for MCP config */
export interface McpEnvironmentBranch {
  branch: string;
  protected?: boolean;
  deployTarget?: string;
}

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
    /** @deprecated Use environments + defaultEnvironment instead */
    defaultBranch?: string;
    environments?: Record<string, McpEnvironmentBranch>;
    defaultEnvironment?: string;
    prMergeDefaults?: PrMergeDefaults;
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
 * Internal interfaces for SDK config structure
 * These provide type safety when accessing the SDK's config format
 */
interface SdkStorageConfig {
  local?: {
    path?: string;
  };
  [key: string]: unknown;
}

interface SdkFileSource {
  type?: string;
  bucket?: string;
  prefix?: string;
  region?: string;
  projectId?: string;
  accountId?: string;
  folderId?: string;
  local?: { basePath?: string };
  auth?: {
    profile?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    keyFilePath?: string;
  };
  publicUrl?: string;
}

interface SdkFileConfig {
  sources?: Record<string, SdkFileSource>;
  global_settings?: {
    basePath?: string;
  };
  [key: string]: unknown;
}

interface SdkDocsConfig {
  output_paths?: {
    default?: string;
  };
  custom_templates_path?: string;
  [key: string]: unknown;
}

/**
 * Type guard to safely check if a value is an object
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
    const prMergeConfig = sdkConfig.repo.defaults?.pr?.merge;
    // Convert environments from snake_case config to camelCase MCP format
    const sdkEnvironments = sdkConfig.repo.defaults?.environments;
    let mcpEnvironments: Record<string, McpEnvironmentBranch> | undefined;
    if (sdkEnvironments && typeof sdkEnvironments === 'object') {
      mcpEnvironments = {};
      for (const [envId, envConfig] of Object.entries(sdkEnvironments)) {
        if (envConfig && typeof envConfig === 'object' && 'branch' in envConfig) {
          const env = envConfig as { branch: string; protected?: boolean; deploy_target?: string };
          mcpEnvironments[envId] = {
            branch: env.branch,
            protected: env.protected,
            deployTarget: env.deploy_target,
          };
        }
      }
      if (Object.keys(mcpEnvironments).length === 0) {
        mcpEnvironments = undefined;
      }
    }

    // Resolve defaultBranch from environments for backwards compatibility
    const defaultEnv = sdkConfig.repo.defaults?.default_environment;
    let resolvedDefaultBranch = sdkConfig.repo.defaults?.default_branch;
    if (sdkEnvironments && defaultEnv && sdkEnvironments[defaultEnv]) {
      const env = sdkEnvironments[defaultEnv] as { branch?: string };
      if (env.branch) {
        resolvedDefaultBranch = env.branch;
      }
    }

    config.repo = {
      platform: activeHandler,
      owner: handlerConfig.owner,
      repo: handlerConfig.repo,
      token: handlerConfig.token,
      defaultBranch: resolvedDefaultBranch,
      environments: mcpEnvironments,
      defaultEnvironment: defaultEnv,
      prMergeDefaults: prMergeConfig ? {
        strategy: prMergeConfig.strategy,
        deleteBranch: prMergeConfig.delete_branch,
      } : undefined,
    };
  }

  // Convert spec config - SDK uses storage-based config
  if (sdkConfig.spec && isObject(sdkConfig.spec)) {
    const storage = (sdkConfig.spec as { storage?: SdkStorageConfig }).storage;
    config.spec = {
      localPath: storage?.local?.path,
    };
  }

  // Convert logs config - SDK uses storage-based config
  if (sdkConfig.logs && isObject(sdkConfig.logs)) {
    const storage = (sdkConfig.logs as { storage?: SdkStorageConfig }).storage;
    config.logs = {
      localPath: storage?.local?.path,
    };
  }

  // Convert file config - SDK uses sources-based config
  if (sdkConfig.file && isObject(sdkConfig.file)) {
    const fileConfig = sdkConfig.file as SdkFileConfig;
    const sources = fileConfig.sources;

    // Convert sources to MCP format with type safety
    type FileSourceConfig = NonNullable<NonNullable<Config['file']>['sources']>;
    const mcpSources: FileSourceConfig = {};

    if (sources) {
      for (const [name, source] of Object.entries(sources)) {
        if (source && source.type) {
          mcpSources[name] = {
            type: source.type as 'local' | 's3' | 'r2' | 'gcs' | 'gdrive',
            bucket: source.bucket,
            prefix: source.prefix,
            region: source.region,
            projectId: source.projectId,
            accountId: source.accountId,
            folderId: source.folderId,
            local: source.local as { basePath: string } | undefined,
            auth: source.auth,
            publicUrl: source.publicUrl,
          };
        }
      }
    }

    config.file = {
      basePath: fileConfig.global_settings?.basePath,
      sources: Object.keys(mcpSources).length > 0 ? mcpSources : undefined,
    };
  }

  // Convert docs config - SDK uses output_paths or custom_templates_path
  if (sdkConfig.docs && isObject(sdkConfig.docs)) {
    const docsConfig = sdkConfig.docs as SdkDocsConfig;
    config.docs = {
      docsDir: docsConfig.output_paths?.default || docsConfig.custom_templates_path,
    };
  }

  return config;
}

/**
 * Sanitize an error for safe logging, including both message and stack trace
 */
function sanitizeError(error: Error): string {
  const sanitizedMessage = sanitizeSecrets(error.message);
  const sanitizedStack = error.stack ? sanitizeSecrets(error.stack) : undefined;
  return sanitizedStack || sanitizedMessage;
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
    // Sanitize error message AND stack trace to prevent token/secret exposure
    if (error instanceof Error) {
      console.error(`Failed to load config: ${sanitizeError(error)}`);
    }
    // Return empty config on error - tools will handle missing config gracefully
    return {};
  }
}

// Re-export sanitizeSecrets for use by handlers
export { sanitizeSecrets };
