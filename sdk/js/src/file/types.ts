/**
 * @fractary/core - File Module Types
 *
 * Type definitions for file storage operations.
 */

/**
 * Generic storage interface for file operations
 */
export interface Storage {
  /**
   * Write content to storage
   * @param id - Unique identifier for the content
   * @param content - Content to write
   * @returns Path or URI where content was written
   */
  write(id: string, content: string): Promise<string>;

  /**
   * Read content from storage
   * @param id - Unique identifier for the content
   * @returns Content or null if not found
   */
  read(id: string): Promise<string | null>;

  /**
   * Check if content exists
   * @param id - Unique identifier for the content
   */
  exists(id: string): Promise<boolean>;

  /**
   * List all items in storage (optionally with prefix)
   * @param prefix - Optional prefix to filter results
   */
  list(prefix?: string): Promise<string[]>;

  /**
   * Delete content from storage
   * @param id - Unique identifier for the content
   */
  delete(id: string): Promise<void>;

  /**
   * Get a URL for the content (optional)
   * @param id - Unique identifier for the content
   * @param expiresIn - Expiration time in seconds (for presigned URLs)
   * @returns URL or null if not supported
   */
  getUrl?(id: string, expiresIn?: number): Promise<string | null>;
}

/**
 * Storage type identifiers
 */
export type StorageType = 'local' | 's3' | 'r2' | 'gcs' | 'gdrive';

/**
 * Base configuration for all storage types
 */
export interface BaseStorageConfig {
  type: StorageType;
}

/**
 * Local filesystem storage configuration
 */
export interface LocalStorageConfig extends BaseStorageConfig {
  type: 'local';
  basePath: string;
  createDirectories?: boolean;
  permissions?: string;
}

/**
 * AWS S3 storage configuration
 */
export interface S3StorageConfig extends BaseStorageConfig {
  type: 's3';
  bucket: string;
  region: string;
  prefix?: string;
  auth?: {
    profile?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  };
  endpoint?: string;
  publicUrl?: string;
}

/**
 * Cloudflare R2 storage configuration
 */
export interface R2StorageConfig extends BaseStorageConfig {
  type: 'r2';
  bucket: string;
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  prefix?: string;
  publicUrl?: string;
}

/**
 * Google Cloud Storage configuration
 */
export interface GCSStorageConfig extends BaseStorageConfig {
  type: 'gcs';
  bucket: string;
  projectId: string;
  prefix?: string;
  keyFilePath?: string;
  region?: string;
}

/**
 * Google Drive storage configuration
 */
export interface GDriveStorageConfig extends BaseStorageConfig {
  type: 'gdrive';
  folderId?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  rcloneRemote?: string;
}

/**
 * Union type for all storage configurations
 */
export type StorageConfig =
  | LocalStorageConfig
  | S3StorageConfig
  | R2StorageConfig
  | GCSStorageConfig
  | GDriveStorageConfig;

/**
 * Configuration for file manager
 */
export interface FileManagerConfig {
  /**
   * Base path for file storage (used when no storage is provided)
   */
  basePath?: string;

  /**
   * Optional storage backend (defaults to LocalStorage)
   */
  storage?: Storage;
}

/**
 * Extended file manager config with type-safe storage configuration
 */
export interface FileManagerStorageConfig {
  /**
   * Storage configuration for automatic backend selection
   */
  storageConfig: StorageConfig;
}

/**
 * File operation result with metadata
 */
export interface FileOperationResult {
  success: boolean;
  message: string;
  url?: string;
  sizeBytes?: number;
  checksum?: string;
}

/**
 * Global settings for file operations
 */
export interface FileGlobalSettings {
  retryAttempts?: number;
  retryDelayMs?: number;
  timeoutSeconds?: number;
  verifyChecksums?: boolean;
  parallelUploads?: number;
}

/**
 * Complete file plugin configuration (v2.0 sources format)
 */
export interface FilePluginConfig {
  schemaVersion: string;
  sources?: Record<string, SourceConfig>;
  globalSettings?: FileGlobalSettings;
}

/**
 * Individual source configuration (from config.yaml)
 */
export interface SourceConfig {
  type: StorageType;
  bucket?: string;
  prefix?: string;
  region?: string;
  projectId?: string;
  accountId?: string;
  folderId?: string;
  local?: {
    basePath: string;
  };
  push?: {
    compress?: boolean;
    keepLocal?: boolean;
  };
  auth?: {
    profile?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    keyFilePath?: string;
  };
  publicUrl?: string;
}
