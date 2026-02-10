/**
 * @fractary/core - File Manager
 *
 * Unified interface for file storage operations.
 * Supports multiple storage backends: local, S3, R2, GCS, Google Drive.
 */

import { Storage, FileManagerConfig, StorageConfig } from './types';
import { LocalStorage } from './local';
import { createStorage } from './factory';

/**
 * Extended configuration options for FileManager
 */
export interface FileManagerOptions extends FileManagerConfig {
  /**
   * Storage configuration for automatic backend selection
   * If provided, this takes precedence over storage and basePath
   */
  storageConfig?: StorageConfig;
}

/**
 * File Manager - Unified interface for file operations
 *
 * Provides a consistent API for file operations across different storage backends.
 * Supports local filesystem, AWS S3, Cloudflare R2, Google Cloud Storage,
 * and Google Drive.
 *
 * @example
 * // Local storage (default)
 * const localManager = new FileManager({ basePath: '.fractary/files' });
 *
 * @example
 * // S3 storage with configuration
 * const s3Manager = new FileManager({
 *   storageConfig: {
 *     type: 's3',
 *     bucket: 'my-bucket',
 *     region: 'us-east-1',
 *     prefix: 'files/',
 *     auth: { profile: 'default' }
 *   }
 * });
 *
 * @example
 * // Custom storage backend
 * const customManager = new FileManager({
 *   storage: myCustomStorage
 * });
 */
export class FileManager {
  private storage: Storage;

  constructor(config?: FileManagerOptions) {
    // Priority: storageConfig > storage > LocalStorage with basePath
    if (config?.storageConfig) {
      this.storage = createStorage(config.storageConfig);
    } else if (config?.storage) {
      this.storage = config.storage;
    } else {
      const basePath = config?.basePath || '.fractary/files';
      this.storage = new LocalStorage(basePath);
    }
  }

  /**
   * Validate a file path for security issues
   *
   * @param path - Path to validate
   * @throws Error if path is invalid or contains security issues
   */
  private validatePath(path: string): void {
    if (!path || path.trim() === '') {
      throw new Error('Path cannot be empty');
    }

    // Check for directory traversal sequences
    if (path.includes('..')) {
      throw new Error('Path cannot contain directory traversal sequences (..)');
    }

    // Check for null bytes (potential security issue)
    if (path.includes('\0')) {
      throw new Error('Path cannot contain null bytes');
    }

    // Check for absolute paths on Windows
    if (/^[a-zA-Z]:/.test(path)) {
      throw new Error('Absolute Windows paths are not allowed');
    }

    // Check for absolute Unix paths (starting with /)
    if (path.startsWith('/')) {
      throw new Error('Absolute paths are not allowed');
    }
  }

  /**
   * Write file content
   *
   * @param path - Path/identifier for the file
   * @param content - Content to write
   * @returns URI or path where the content was written
   */
  async write(path: string, content: string | Buffer): Promise<string> {
    this.validatePath(path);
    return this.storage.write(path, content);
  }

  /**
   * Read file content
   *
   * @param path - Path/identifier for the file
   * @returns File content or null if not found
   */
  async read(path: string): Promise<string | null> {
    this.validatePath(path);
    return this.storage.read(path);
  }

  /**
   * Check if file exists
   *
   * @param path - Path/identifier for the file
   * @returns True if the file exists
   */
  async exists(path: string): Promise<boolean> {
    this.validatePath(path);
    return this.storage.exists(path);
  }

  /**
   * List files (optionally with prefix)
   *
   * @param prefix - Optional prefix to filter results
   * @returns List of file paths/identifiers
   */
  async list(prefix?: string): Promise<string[]> {
    if (prefix) {
      this.validatePath(prefix);
    }
    return this.storage.list(prefix);
  }

  /**
   * Delete file
   *
   * @param path - Path/identifier for the file
   */
  async delete(path: string): Promise<void> {
    this.validatePath(path);
    return this.storage.delete(path);
  }

  /**
   * Copy file from one location to another
   *
   * @param sourcePath - Source path/identifier
   * @param destPath - Destination path/identifier
   * @returns URI or path where the content was copied
   */
  async copy(sourcePath: string, destPath: string): Promise<string> {
    this.validatePath(sourcePath);
    this.validatePath(destPath);
    const content = await this.storage.read(sourcePath);
    if (!content) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }
    return this.storage.write(destPath, content);
  }

  /**
   * Move file from one location to another
   *
   * @param sourcePath - Source path/identifier
   * @param destPath - Destination path/identifier
   * @returns URI or path where the content was moved
   */
  async move(sourcePath: string, destPath: string): Promise<string> {
    this.validatePath(sourcePath);
    this.validatePath(destPath);
    const result = await this.copy(sourcePath, destPath);
    await this.storage.delete(sourcePath);
    return result;
  }

  /**
   * Get a URL for the file (if supported by the storage backend)
   *
   * @param path - Path/identifier for the file
   * @param expiresIn - Expiration time in seconds (for presigned URLs)
   * @returns URL or null if not supported
   */
  async getUrl(path: string, expiresIn?: number): Promise<string | null> {
    this.validatePath(path);
    if (this.storage.getUrl) {
      return this.storage.getUrl(path, expiresIn);
    }
    return null;
  }

  /**
   * Get the underlying storage backend
   *
   * @returns The storage instance
   */
  getStorage(): Storage {
    return this.storage;
  }
}
