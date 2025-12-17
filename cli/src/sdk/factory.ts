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
      const { WorkManager } = await import('@fractary/core/dist/work');
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
      const { RepoManager } = await import('@fractary/core/dist/repo');
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
      const { SpecManager } = await import('@fractary/core/dist/spec');
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
      const { LogManager } = await import('@fractary/core/dist/logs');
      instances.logs = new LogManager(config);
    } catch (error) {
      throw new SDKNotAvailableError('core', error instanceof Error ? error : undefined);
    }
  }
  return instances.logs;
}

/**
 * Get FileManager instance (lazy-loaded with dynamic import)
 */
export async function getFileManager(config?: any): Promise<FileManager> {
  if (!instances.file) {
    try {
      // Dynamic import to avoid loading SDK at module load time
      const { FileManager } = await import('@fractary/core/dist/file');
      instances.file = new FileManager(config);
    } catch (error) {
      throw new SDKNotAvailableError('core', error instanceof Error ? error : undefined);
    }
  }
  return instances.file;
}

/**
 * Get DocsManager instance (lazy-loaded with dynamic import)
 */
export async function getDocsManager(config?: any): Promise<DocsManager> {
  if (!instances.docs) {
    try {
      // Dynamic import to avoid loading SDK at module load time
      const { DocsManager } = await import('@fractary/core/dist/docs');
      instances.docs = new DocsManager(config);
    } catch (error) {
      throw new SDKNotAvailableError('core', error instanceof Error ? error : undefined);
    }
  }
  return instances.docs;
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
