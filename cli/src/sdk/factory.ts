/**
 * SDK Factory - Provides lazy-loaded SDK client instances
 *
 * This module implements the factory pattern for SDK integration,
 * providing centralized access to @fractary/core SDK managers.
 *
 * IMPORTANT: Uses dynamic imports to avoid loading @fractary/core at module load time.
 * This prevents CLI hangs when running simple commands like --help.
 */

// Import types only (these don't cause module execution)
import type {
  WorkManager,
  RepoManager,
  SpecManager,
  LogManager,
  FileManager,
  DocsManager,
  StorageConfig,
  DocTypeRegistry,
} from '@fractary/core';

/**
 * Cached SDK instances
 */
interface SDKInstances {
  work?: WorkManager;
  repo?: RepoManager;
  spec?: SpecManager;
  logs?: LogManager;
  file?: FileManager;
  docs?: DocsManager;
  docTypeRegistry?: DocTypeRegistry;
}

const instances: SDKInstances = {};

/**
 * Error thrown when SDK is not available
 */
export class SDKNotAvailableError extends Error {
  readonly sdk: string;
  readonly cause?: Error;

  constructor(sdk: string, cause?: Error) {
    super(`${sdk} SDK is not available. Install with: npm install @fractary/${sdk}`);
    this.name = 'SDKNotAvailableError';
    this.sdk = sdk;
    this.cause = cause;
  }
}

/**
 * Get WorkManager instance (lazy-loaded with dynamic import)
 */
export async function getWorkManager(config?: any): Promise<WorkManager> {
  if (!instances.work) {
    try {
      // Dynamic import to avoid loading SDK at module load time
      const { WorkManager } = await import('@fractary/core/work');
      instances.work = new WorkManager(config);
    } catch (error) {
      throw new SDKNotAvailableError('core', error instanceof Error ? error : undefined);
    }
  }
  return instances.work;
}

/**
 * Get RepoManager instance (lazy-loaded with dynamic import)
 */
export async function getRepoManager(config?: any): Promise<RepoManager> {
  if (!instances.repo) {
    try {
      // Dynamic import to avoid loading SDK at module load time
      const { RepoManager } = await import('@fractary/core/repo');
      instances.repo = new RepoManager(config);
    } catch (error) {
      throw new SDKNotAvailableError('core', error instanceof Error ? error : undefined);
    }
  }
  return instances.repo;
}

/**
 * Get SpecManager instance (lazy-loaded with dynamic import)
 */
export async function getSpecManager(config?: any): Promise<SpecManager> {
  if (!instances.spec) {
    try {
      // Dynamic import to avoid loading SDK at module load time
      const { SpecManager } = await import('@fractary/core/spec');
      instances.spec = new SpecManager(config);
    } catch (error) {
      throw new SDKNotAvailableError('core', error instanceof Error ? error : undefined);
    }
  }
  return instances.spec;
}

/**
 * Get LogManager instance (lazy-loaded with dynamic import)
 */
export async function getLogManager(config?: any): Promise<LogManager> {
  if (!instances.logs) {
    try {
      // Dynamic import to avoid loading SDK at module load time
      const { LogManager } = await import('@fractary/core/logs');
      instances.logs = new LogManager(config);
    } catch (error) {
      throw new SDKNotAvailableError('core', error instanceof Error ? error : undefined);
    }
  }
  return instances.logs;
}

/**
 * Options for creating a FileManager instance
 */
export interface FileManagerOptions {
  /**
   * Named source from config.yaml (e.g., 'specs', 'logs')
   * If provided, uses the source configuration from .fractary/config.yaml
   */
  source?: string;

  /**
   * Base path for local storage (used if no source is specified)
   */
  basePath?: string;

  /**
   * Direct storage configuration (overrides source and basePath)
   */
  storageConfig?: StorageConfig;
}

/**
 * Get FileManager instance (lazy-loaded with dynamic import)
 *
 * Supports multiple configuration modes:
 * 1. Named source: getFileManager({ source: 'specs' }) - uses config.yaml source
 * 2. Base path: getFileManager({ basePath: './files' }) - local storage
 * 3. Storage config: getFileManager({ storageConfig: { type: 's3', ... } }) - explicit config
 * 4. Default: getFileManager() - local storage at .fractary/files
 */
export async function getFileManager(options?: FileManagerOptions): Promise<FileManager> {
  // If requesting a specific source, don't cache (different sources = different instances)
  const cacheKey = options?.source || options?.storageConfig?.type || 'default';

  // For now, only cache the default instance
  if (cacheKey === 'default' && instances.file) {
    return instances.file;
  }

  try {
    // Dynamic import to avoid loading SDK at module load time
    const { FileManager, createStorageFromSource } = await import('@fractary/core/file');
    const { loadFileConfig } = await import('@fractary/core/common/config');

    let fileManager: FileManager;

    if (options?.storageConfig) {
      // Direct storage configuration
      fileManager = new FileManager({ storageConfig: options.storageConfig });
    } else if (options?.source) {
      // Load from named source in config.yaml
      const fileConfig = loadFileConfig();
      if (fileConfig?.sources?.[options.source]) {
        const storage = createStorageFromSource(options.source, fileConfig);
        fileManager = new FileManager({ storage });
      } else {
        throw new Error(
          `Source '${options.source}' not found in configuration. ` +
            `Available sources: ${Object.keys(fileConfig?.sources || {}).join(', ') || 'none'}`
        );
      }
    } else if (options?.basePath) {
      // Local storage with custom base path
      fileManager = new FileManager({ basePath: options.basePath });
    } else {
      // Default: local storage
      fileManager = new FileManager();
    }

    // Cache default instance
    if (cacheKey === 'default') {
      instances.file = fileManager;
    }

    return fileManager;
  } catch (error) {
    throw new SDKNotAvailableError('core', error instanceof Error ? error : undefined);
  }
}

/**
 * Get FileManager for a specific source from config.yaml
 *
 * @param sourceName - Name of the source (e.g., 'specs', 'logs')
 * @returns FileManager configured for the specified source
 */
export async function getFileManagerForSource(sourceName: string): Promise<FileManager> {
  return getFileManager({ source: sourceName });
}

/**
 * Get DocsManager instance (lazy-loaded with dynamic import)
 */
export async function getDocsManager(config?: any): Promise<DocsManager> {
  if (!instances.docs) {
    try {
      // Dynamic import to avoid loading SDK at module load time
      const { DocsManager } = await import('@fractary/core/docs');
      // Provide sensible defaults if no config is provided
      const docsConfig = config || {
        docsDir: process.env.FRACTARY_DOCS_DIR || './docs',
        metadataMode: 'frontmatter',
      };
      instances.docs = new DocsManager(docsConfig);
    } catch (error) {
      throw new SDKNotAvailableError('core', error instanceof Error ? error : undefined);
    }
  }
  return instances.docs;
}

/**
 * Get DocTypeRegistry instance (lazy-loaded with dynamic import)
 */
export async function getDocTypeRegistry(config?: any): Promise<DocTypeRegistry> {
  if (!instances.docTypeRegistry) {
    try {
      // Dynamic import to avoid loading SDK at module load time
      const { DocTypeRegistry } = await import('@fractary/core/docs');
      instances.docTypeRegistry = new DocTypeRegistry(config);
    } catch (error) {
      throw new SDKNotAvailableError('core', error instanceof Error ? error : undefined);
    }
  }
  return instances.docTypeRegistry;
}

/**
 * Clear cached instances (useful for testing)
 */
export function clearInstances(): void {
  instances.work = undefined;
  instances.repo = undefined;
  instances.spec = undefined;
  instances.logs = undefined;
  instances.file = undefined;
  instances.docs = undefined;
  instances.docTypeRegistry = undefined;
}

/**
 * Check if core SDK is available
 */
export async function isCoreAvailable(): Promise<boolean> {
  try {
    await import('@fractary/core');
    return true;
  } catch {
    return false;
  }
}
