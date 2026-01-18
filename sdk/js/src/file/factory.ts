/**
 * @fractary/core - Storage Factory
 *
 * Factory function for creating storage backends based on configuration.
 * Supports automatic configuration loading from .fractary/config.yaml.
 */

import {
  Storage,
  StorageConfig,
  StorageType,
  LocalStorageConfig,
  S3StorageConfig,
  R2StorageConfig,
  GCSStorageConfig,
  GDriveStorageConfig,
  SourceConfig,
} from './types';
import { LocalStorage } from './local';

/**
 * Create a storage backend from configuration
 *
 * @param config - Storage configuration
 * @returns Storage instance
 */
export function createStorage(config: StorageConfig): Storage {
  switch (config.type) {
    case 'local':
      return new LocalStorage(config.basePath);

    case 's3':
      // Lazy load to avoid hard dependency
      return createS3Storage(config);

    case 'r2':
      return createR2Storage(config);

    case 'gcs':
      return createGCSStorage(config);

    case 'gdrive':
      return createGDriveStorage(config);

    default:
      throw new Error(`Unsupported storage type: ${(config as any).type}`);
  }
}

/**
 * Create S3 storage (with lazy module loading)
 */
function createS3Storage(config: S3StorageConfig): Storage {
  // Return a proxy that lazy-loads the actual implementation
  return new Proxy({} as Storage, {
    get(_target, prop) {
      return async (...args: any[]) => {
        const { S3Storage } = await import('./s3');
        const storage = new S3Storage(config);
        return (storage as any)[prop](...args);
      };
    },
  });
}

/**
 * Create R2 storage (with lazy module loading)
 */
function createR2Storage(config: R2StorageConfig): Storage {
  return new Proxy({} as Storage, {
    get(_target, prop) {
      return async (...args: any[]) => {
        const { R2Storage } = await import('./r2');
        const storage = new R2Storage(config);
        return (storage as any)[prop](...args);
      };
    },
  });
}

/**
 * Create GCS storage (with lazy module loading)
 */
function createGCSStorage(config: GCSStorageConfig): Storage {
  return new Proxy({} as Storage, {
    get(_target, prop) {
      return async (...args: any[]) => {
        const { GCSStorage } = await import('./gcs');
        const storage = new GCSStorage(config);
        return (storage as any)[prop](...args);
      };
    },
  });
}

/**
 * Create Google Drive storage (with lazy module loading)
 */
function createGDriveStorage(config: GDriveStorageConfig): Storage {
  return new Proxy({} as Storage, {
    get(_target, prop) {
      return async (...args: any[]) => {
        const { GDriveStorage } = await import('./gdrive');
        const storage = new GDriveStorage(config);
        return (storage as any)[prop](...args);
      };
    },
  });
}

/**
 * Convert a source configuration from config.yaml to a StorageConfig
 *
 * @param source - Source configuration from config.yaml
 * @returns StorageConfig for creating a storage backend
 */
export function sourceConfigToStorageConfig(source: SourceConfig): StorageConfig {
  switch (source.type) {
    case 'local':
      return {
        type: 'local',
        basePath: source.local?.basePath || '.',
      } as LocalStorageConfig;

    case 's3':
      return {
        type: 's3',
        bucket: source.bucket!,
        region: source.region || 'us-east-1',
        prefix: source.prefix,
        auth: source.auth
          ? {
              profile: source.auth.profile,
              accessKeyId: expandEnvVar(source.auth.accessKeyId),
              secretAccessKey: expandEnvVar(source.auth.secretAccessKey),
            }
          : undefined,
        publicUrl: source.publicUrl,
      } as S3StorageConfig;

    case 'r2':
      return {
        type: 'r2',
        bucket: source.bucket!,
        accountId: expandEnvVar(source.accountId) || '',
        accessKeyId: expandEnvVar(source.auth?.accessKeyId) || '',
        secretAccessKey: expandEnvVar(source.auth?.secretAccessKey) || '',
        prefix: source.prefix,
        publicUrl: source.publicUrl,
      } as R2StorageConfig;

    case 'gcs':
      return {
        type: 'gcs',
        bucket: source.bucket!,
        projectId: source.projectId || '',
        prefix: source.prefix,
        keyFilePath: expandEnvVar(source.auth?.keyFilePath),
        region: source.region,
      } as GCSStorageConfig;

    case 'gdrive':
      return {
        type: 'gdrive',
        folderId: source.folderId,
      } as GDriveStorageConfig;

    default:
      throw new Error(`Unsupported source type: ${source.type}`);
  }
}

/**
 * Expand environment variable references in a string
 *
 * @param value - String potentially containing ${VAR_NAME} references
 * @returns Expanded string with environment variable values
 */
function expandEnvVar(value: string | undefined): string | undefined {
  if (!value) return value;

  // Match ${VAR_NAME} pattern
  return value.replace(/\$\{([^}]+)\}/g, (_match, varName) => {
    return process.env[varName] || '';
  });
}

/**
 * Create a storage backend from a named source in config.yaml
 *
 * @param sourceName - Name of the source (e.g., 'specs', 'logs')
 * @param fileConfig - File plugin configuration from config.yaml
 * @returns Storage instance
 */
export function createStorageFromSource(
  sourceName: string,
  fileConfig: { sources?: Record<string, SourceConfig> }
): Storage {
  const source = fileConfig.sources?.[sourceName];

  if (!source) {
    throw new Error(
      `Source '${sourceName}' not found in configuration. Available sources: ${
        Object.keys(fileConfig.sources || {}).join(', ') || 'none'
      }`
    );
  }

  const storageConfig = sourceConfigToStorageConfig(source);
  return createStorage(storageConfig);
}

/**
 * Get the default storage type based on configuration
 *
 * @param fileConfig - File plugin configuration
 * @returns Default storage type
 */
export function getDefaultStorageType(
  fileConfig?: { sources?: Record<string, SourceConfig> }
): StorageType {
  if (!fileConfig?.sources) {
    return 'local';
  }

  // Return the type of the first source, or 'local' if none
  const sources = Object.values(fileConfig.sources);
  return sources.length > 0 ? sources[0].type : 'local';
}
